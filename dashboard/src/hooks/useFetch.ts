import axios from "axios";
import { useEffect, useState } from "react";
import {
  Indicador,
  IndicatorMetadata,
  IndicatorValue,
} from "../interfaces/Indicador";
import usePredictions from "./predictions/usePredictions";
import { ICountry, IRegion } from "@/interfaces/Countries";
import { filterDataApi } from "@/utils/filterDataAPI";
// IMPORTS MOCKS
import DATA_MOCK from "../mocks/data.json";
// import VALUES_MOCK from "../mocks/values.json";
// import VALUES_FROM_TO_MOCK from "../mocks/values_from_to.json";
// import VALUES_FROM_TO_PREDICTIONS_MOCK from "../mocks/data_predictions.json";
// import VALUES_FROM_TO_PREDICTIONS_MOCK_REG_LINEAL from "../mocks/data_predictions_REG_LINEAL.json";
// import VALUES_FROM_TO_PREDICTIONS_MOCK_SP from "../mocks/data_predictions_SP.json";
// import VALUES_FROM_TO_PREDICTIONS_MOCK_REG_EXP from "../mocks/data_predictions_REG_EXP.json";
import DATA_INDICATOR2 from "../mocks/DATA_INDICATOR2.json";
import METADATA_ES_MOCK from "../mocks/metadata_es.json";
import METADATA_EN_MOCK from "../mocks/metadata_en.json";
import REGIONS_MOCK from "../mocks/regions.json";
import COUNTRIES_MOCK from "../mocks/countries.json";

export const USE_MOCK: boolean = false;

const BASE_URL_WB = "https://api.worldbank.org/v2";
const BASE_URL_WB_ES = "https://api.worldbank.org/v2/es";
const CODE_TOPIC_HEALTH = 8;
const LIMIT_INDICATORS = 1000;
const EXTENDED_YEARS_LIMIT = 10;
const LIMIT_EXTENDED_YEARS = 10;

const useFetch = () => {
  const [indicators, setIndicators] = useState<Indicador[]>([]);
  const [dataIndicator, setDataIndicator] = useState<IndicatorValue[]>([]);
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
    if (USE_MOCK) {
      setIndicators((DATA_MOCK as any[]).filter((item) => item.name));
    } else {
      await axios
        .get(
          BASE_URL_WB_ES +
            `/topic/${CODE_TOPIC_HEALTH}/indicator?format=json&per_page=${LIMIT_INDICATORS}&source=2`
        )
        .then((res) => {
          // console.log({ resgetIndicadores: res });
          const data: Indicador[] = res.data[1];
          setIndicators(data.filter((item) => item.name));
        })
        .catch((err) => {
          // console.log({ err });
          console.log("Error al obtener todos los indicadores de salud");
        });
    }
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

    // GET METADATA
    const metadata = await getMetadataIndicator(indicator);
    setMetadataIndicator(metadata);

    if (USE_MOCK) {
      const data: IndicatorValue[] = filterDataApi(
        DATA_INDICATOR2 as any,
        regions
      );

      // console.log({ data });
      // Procesar data para predictions
      const dataFinal = processDataFetchPredictions({
        data,
        currentYearFrom,
        currentYearTo,
      });

      // console.log({ dataFinal });

      setDataIndicator(dataFinal);
    } else {
      const URL =
        BASE_URL_WB +
        `/country/${
          // Limit selected countries in URL by cors politicy
          selectedCountries.length > 0 && selectedCountries.length < 190
            ? selectedCountries.map((item) => item).join(";")
            : "ALL"
        }/indicator/${indicator}?format=json&per_page=${10000}&date=${
          hasExtendedYears
            ? currentYearFrom
            : currentYearFrom - EXTENDED_YEARS_LIMIT
        }:${
          hasExtendedYears
            ? currentYearTo
            : currentYearTo + EXTENDED_YEARS_LIMIT
        }&source=2`;

      // console.log({ URL });

      await axios
        .get(URL)
        .then((res) => {
          // console.log({ res });
          let data: IndicatorValue[] = filterDataApi(
            res.data[1] || ([] as IndicatorValue[]),
            regions
          ).sort((a, b) => parseInt(a.date) - parseInt(b.date));

          // console.log({ data });

          // Procesar data para predictions
          const dataFinal = processDataFetchPredictions({
            data,
            currentYearFrom,
            currentYearTo,
          });

          console.log({ dataFinal });

          if (dataFinal?.length === 0) {
            throw new Error("No data found");
          }

          setDataIndicator(dataFinal);
        })
        .catch((err) => {
          console.log({ err });
          throw new Error("No data found");
        });
    }
  };

  const getMetadataIndicator = async (
    indicatorCode: string
  ): Promise<IndicatorMetadata> => {
    let metadataEnglish,
      metadataEspañol: any = {};

    if (USE_MOCK) {
      metadataEnglish = METADATA_EN_MOCK[1]?.[0];
      metadataEspañol = METADATA_ES_MOCK[1]?.[0];
    } else {
      const [metadataEnglishResult, metadataEspañolResult] = await Promise.all([
        axios.get(
          BASE_URL_WB + `/en/indicator/${indicatorCode}?format=json&source=2`
        ),
        axios.get(
          BASE_URL_WB + `/es/indicator/${indicatorCode}?format=json&source=2`
        ),
      ]);

      metadataEnglish = metadataEnglishResult?.data?.[1]?.[0] || {};
      metadataEspañol = metadataEspañolResult?.data?.[1]?.[0] || {};
    }

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
    const result = await axios
      .get(
        BASE_URL_WB_ES +
          `/country/${
            // Limit selected countries in URL by cors politicy
            selectedCountries.length > 0 && selectedCountries.length < 190
              ? selectedCountries.map((item) => item).join(";")
              : "ALL"
          }/indicator/${indicator}?format=json&per_page=1&page=1&source=2`
      )
      .then((res) => {
        // console.log({ getYearsRangeIndicatorres: res });
        return res.data;
      })
      .catch((err) => {
        // console.log({ errgetYearsRangeIndicator: err });
        console.log("Error al obtener ultimo año del indicador", err);
      });

    const lastPage = result[0].pages;

    const lastYearResult = parseInt(result[1][0].date);

    const result2 = await axios
      .get(
        BASE_URL_WB_ES +
          `/country/${
            // Limit selected countries in URL by cors politicy
            selectedCountries.length > 0 && selectedCountries.length < 190
              ? selectedCountries.map((item) => item).join(";")
              : "ALL"
          }/indicator/${indicator}?format=json&per_page=1&page=${lastPage}&source=2`
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        // console.log({ errgetYeasRangeIndicator: err });
        console.log("Error al obtener primer año del indicador", err);
      });

    const firstYearResult = parseInt(result2[1][0].date);

    const dataYears = Array.from(
      { length: lastYearResult - firstYearResult + 1 },
      (_, i) => firstYearResult + i
    );

    setRangeYearsIndicator(dataYears.sort((a, b) => b - a));
  };

  const getRegionsCountriesAPI = async () => {
    if (USE_MOCK) {
      setRegions(REGIONS_MOCK);
      setCountries(COUNTRIES_MOCK);
    } else {
      const regionsResult = await axios.get(
        `${BASE_URL_WB_ES}/regions?format=json&per_page=1000`
      );

      const countriesResult = await axios.get(
        `${BASE_URL_WB_ES}/country?format=json&per_page=1000`
      );

      let countriesList: ICountry[] = countriesResult?.data?.[1];
      let regionsList: IRegion[] = regionsResult?.data?.[1];
      // console.log({ regionsList, countriesList });

      if (regionsList) {
        setRegions(regionsList);
      }
      if (countriesList) {
        setCountries(countriesList);
      }
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
  };
};

export default useFetch;
