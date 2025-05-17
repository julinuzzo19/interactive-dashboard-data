import axios from "axios";
import { useEffect, useState } from "react";
import {
  Indicador,
  IndicatorMetadata,
  IndicatorValue,
} from "../interfaces/Indicador";
import { ICountry, IRegion } from "@/interfaces/Countries";
import { filterDataApi } from "@/utils/filterDataAPI";
import usePredictions from "@/hooks/usePredictions";

const BASE_URL_WB = "https://api.worldbank.org/v2";
const BASE_URL_WB_ES = "https://api.worldbank.org/v2/es";
const CODE_TOPIC_HEALTH = 8;
const LIMIT_INDICATORS = 1000;
const EXTENDED_YEARS_LIMIT = 10;
const LIMIT_EXTENDED_YEARS = 10;

const useFetch = () => {
  const [indicators, setIndicators] = useState<Indicador[]>([]);
  const [dataIndicator, setDataIndicator] = useState<IndicatorValue[]>([]);
  const [allTopics, setAllTopics] = useState<{ id: string; value: string }[]>(
    []
  );
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [rangeYearsIndicator, setRangeYearsIndicator] = useState<number[]>([]);
  const [metadataIndicator, setMetadataIndicator] = useState<
    Partial<IndicatorMetadata>
  >({});
  const { processDataFetchPredictions } = usePredictions();

  useEffect(() => {
    getIndicadores();
  }, []);

  const getIndicadores = async () => {
    await axios
      .get(
        BASE_URL_WB_ES +
          `/topic/${CODE_TOPIC_HEALTH}/indicator?format=json&per_page=${LIMIT_INDICATORS}&source=2`
      )
      .then((res) => {
        // Se obtienen todos los indicadores de salud disponibles y se filtran los que no tienen nombre
        const data: Indicador[] = (res.data[1] || []).filter(
          (item) => item.name
        );

        // Se obtienen los topicos de los indicadores de salud
        const topics: { id: string; value: string }[] = [];
        data.forEach((indicator) =>
          indicator.topics.forEach((topic) => {
            if (!topics.some((item) => item.id === topic.id)) {
              topics.push(topic);
            }
          })
        );
        setIndicators(data);
        setAllTopics(topics);
      })
      .catch((err) => {
        console.log("Error al obtener todos los indicadores de salud");
      });
  };

  const getDataIndicator = async ({
    indicator,
    currentYearFrom,
    currentYearTo,
    selectedCountries = [],
  }: {
    indicator: string;
    currentYearFrom: number;
    currentYearTo: number;
    selectedCountries?: string[];
  }) => {
    const hasExtendedYears =
      currentYearTo - currentYearFrom > LIMIT_EXTENDED_YEARS;

    const URL =
      BASE_URL_WB +
      `/country/${
        // Limitar paises seleccionados por URL por politica de cors
        selectedCountries.length > 0 && selectedCountries.length < 190
          ? selectedCountries.map((item) => item).join(";")
          : "ALL"
      }/indicator/${indicator}?format=json&per_page=${10000}&date=${
        hasExtendedYears
          ? currentYearFrom
          : currentYearFrom - EXTENDED_YEARS_LIMIT
      }:${
        hasExtendedYears ? currentYearTo : currentYearTo + EXTENDED_YEARS_LIMIT
      }&source=2`;

    await axios
      .get(URL)
      .then((res) => {
        let data: IndicatorValue[] = filterDataApi(
          res.data[1] || ([] as IndicatorValue[]),
          regions
        ).sort((a, b) => parseInt(a.date) - parseInt(b.date));

        // Procesar data para predictions
        const dataFinal = processDataFetchPredictions({
          data,
          currentYearFrom,
          currentYearTo,
        });

        console.log({ dataProcesada: dataFinal });

        if (dataFinal?.length < 1) {
          throw new Error("Sin datos disponibles");
        }

        setDataIndicator(dataFinal);
      })
      .catch((err) => {
        console.log({ err });
        throw new Error("Sin datos disponibles");
      });

    // Se obtienen los metadatos del indicador seleccionado
    try {
      const metadata = await getMetadataIndicator(indicator);
      setMetadataIndicator(metadata);
    } catch (error) {
      throw new Error("Error al obtener metadatos del indicador");
    }
  };

  const getMetadataIndicator = async (
    indicatorCode: string
  ): Promise<IndicatorMetadata> => {
    let metadataEnglish,
      metadataEspañol: any = {};

    const [metadataEnglishResult, metadataEspañolResult] = await Promise.all([
      axios.get(
        BASE_URL_WB + `/en/indicator/${indicatorCode}?format=json&source=2`
      ),
      axios.get(
        BASE_URL_WB_ES + ` /indicator/${indicatorCode}?format=json&source=2`
      ),
    ]).catch((err) => {
      throw new Error("Error al obtener metadatos del indicador");
    });

    metadataEnglish = metadataEnglishResult?.data?.[1]?.[0] || {};
    metadataEspañol = metadataEspañolResult?.data?.[1]?.[0] || {};

    return {
      id: metadataEspañol.id || metadataEnglish.id,
      name: metadataEspañol.name || metadataEnglish.name,
      unit: metadataEspañol.unit || metadataEnglish.unit,
      source: {
        id: metadataEspañol.source.id || metadataEnglish.source.id,
        value: metadataEspañol.source.value || metadataEnglish.source.value,
      },
      sourceNote: metadataEspañol.sourceNote || metadataEnglish.sourceNote,
      sourceOrganization:
        metadataEspañol.sourceOrganization ||
        metadataEnglish.sourceOrganization,
      topics:
        metadataEspañol.topics?.length > 0
          ? metadataEspañol.topics
          : metadataEnglish.topics,
    };
  };

  const getYearsRangeIndicator = async (
    indicator: string,
    selectedCountries: string[] = []
  ) => {
    const resultFirstPage = await axios
      .get(
        BASE_URL_WB_ES +
          `/country/${
            // Limitar paises seleccionados por URL por politica de cors
            selectedCountries.length > 0 && selectedCountries.length < 190
              ? selectedCountries.map((item) => item).join(";")
              : "ALL"
          }/indicator/${indicator}?format=json&per_page=1&page=1&source=2`
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log("Error al obtener ultimo año del indicador", err);
      });

    const lastPage = resultFirstPage[0].pages;

    const lastYearResult = parseInt(resultFirstPage[1][0].date);

    const resultLastPage = await axios
      .get(
        BASE_URL_WB_ES +
          `/country/${
            // Limitar paises seleccionados por URL por politica de cors
            selectedCountries.length > 0 && selectedCountries.length < 190
              ? selectedCountries.map((item) => item).join(";")
              : "ALL"
          }/indicator/${indicator}?format=json&per_page=1&page=${lastPage}&source=2`
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log("Error al obtener primer año del indicador", err);
      });

    const firstYearResult = parseInt(resultLastPage[1][0].date);

    const dataYears = Array.from(
      { length: lastYearResult - firstYearResult + 1 },
      (_, i) => firstYearResult + i
    );

    setRangeYearsIndicator(dataYears.sort((a, b) => b - a));
  };

  const getRegionsCountriesAPI = async () => {
    const regionsResult = await axios.get(
      `${BASE_URL_WB_ES}/regions?format=json&per_page=1000`
    );

    const countriesResult = await axios.get(
      `${BASE_URL_WB_ES}/country?format=json&per_page=1000`
    );

    let countriesList: ICountry[] = countriesResult?.data?.[1];
    let regionsList: IRegion[] = regionsResult?.data?.[1];

    if (regionsList) {
      setRegions(regionsList);
    }
    if (countriesList) {
      setCountries(countriesList);
    }
  };

  return {
    indicators,
    getDataIndicator,
    dataIndicator,
    getYearsRangeIndicator,
    rangeYearsIndicator,
    metadataIndicator,
    countries,
    regions,
    getRegionsCountriesAPI,
    setDataIndicator,
    allTopics,
  };
};

export default useFetch;
