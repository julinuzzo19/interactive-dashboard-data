import axios from "axios";
import { useEffect, useState } from "react";
import {
  Indicador,
  IndicatorMetadata,
  IndicatorValue,
} from "../interfaces/Indicador";
import DATA_MOCK from "../mocks/data.json";
import VALUES_MOCK from "../mocks/values.json";
import VALUES_FROM_TO_MOCK from "../mocks/values_from_to.json";
import METADATA_ES_MOCK from "../mocks/metadata_es.json";
import METADATA_EN_MOCK from "../mocks/metadata_en.json";
import usePredictions from "./predictions/usePredictions";

const BASE_URL_WB = "https://api.worldbank.org/v2";
const BASE_URL_WB_ES = "https://api.worldbank.org/v2/es";
const CODE_TOPIC_HEALTH = 8;
const LIMIT_INDICATORS = 5;
const EXTENDED_YEARS_LIMIT = 10;

const useFetch = () => {
  const [indicators, setIndicators] = useState<Indicador[]>([]);
  const [dataIndicator, setDataIndicator] = useState<IndicatorValue[]>([]);
  const [dataIndicatorExtended, setDataIndicatorExtended] = useState<
    IndicatorValue[]
  >([]);
  const [rangeYearsIndicator, setRangeYearsIndicator] = useState<number[]>([]);
  const [metadataIndicator, setMetadataIndicator] = useState<
    Partial<IndicatorMetadata>
  >({});
  const { linearRegression, determinarTecnicaPredictiva } = usePredictions();

  useEffect(() => {
    getIndicadores();
  }, []);

  const getIndicadores = async () => {
    // @ts-ignore
    setIndicators(DATA_MOCK.filter((item) => item.name));

    // await axios
    //   .get(
    //     BASE_URL_WB_ES +
    //       `/topic/${CODE_TOPIC_HEALTH}/indicator?format=json&per_page=${LIMIT_INDICATORS}`
    //   )
    //   .then((res) => {
    //     // console.log({ res });
    //     const data: Indicador[] = res.data[1];
    //     setIndicators(data.filter((item) => item.name));
    //   })
    //   .catch((err) => {
    //     console.log({ err });
    //   });
  };

  const getDataIndicator = async ({
    indicator,
    currentYearFrom,
    currentYearTo,
  }: {
    indicator: string;
    currentYearFrom: number;
    currentYearTo: number;
  }) => {
    // console.log({ indicator, currentYearFrom, currentYearTo });

    // setDataIndicator(VALUES_FROM_TO_MOCK?.filter((item) => item.value));
    // // setDataIndicator(VALUES_MOCK?.filter((item) => item.value));
    // const metadata = await getMetadataIndicator(indicator);
    // setMetadataIndicator(metadata);
    await axios
      .get(
        BASE_URL_WB_ES +
          `/country/ALL/indicator/${indicator}?format=json&per_page=${1000}&date=${
            currentYearFrom - EXTENDED_YEARS_LIMIT
          }:${currentYearTo + EXTENDED_YEARS_LIMIT}`
      )
      .then((res) => {
        console.log({ res });
        const data: IndicatorValue[] = (res.data[1] as IndicatorValue[]).sort(
          (a, b) => parseInt(a.date) - parseInt(b.date)
        );

        const dataFinal: IndicatorValue[] = [];

        // Get data indicators and handle predictions
        data.forEach((item) => {
          const dateItem = parseInt(item.date);

          // Ignora valores de años pasados o posteriores a años seleccionados
          if (!(dateItem >= currentYearFrom && dateItem <= currentYearTo)) {
            return;
          }

          // Si valor no existe funcion de analizar que tecnica de prediccion utilizar
          if (!item.value) {
            // TODO Logica determinar tecnica
            const tecnicaDeterminada = determinarTecnicaPredictiva(data);

            // Al determinar que funcion utilizar
            if (tecnicaDeterminada === "REGRESION LINEAL") {
              item.value = linearRegression(
                data.map((item) => parseInt(item.date)),
                data.map((item) => parseInt(item.value)),
                parseInt(item.date)
              );

              console.log({ valuePredicted: item.value });
            }
          }

          dataFinal.push(item);
        });

        setDataIndicator(dataFinal);
        setDataIndicatorExtended(data);
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  const getMetadataIndicator = async (
    indicatorCode: string
  ): Promise<IndicatorMetadata> => {
    // const [metadataEnglish, metadataEspañol] = await Promise.all([
    //   axios.get(BASE_URL_WB + `/en/indicator/${indicatorCode}?format=json`),
    //   axios.get(BASE_URL_WB + `/es/indicator/${indicatorCode}?format=json`),
    // ]);

    const metadataEnglish = METADATA_EN_MOCK[1]?.[0];
    const metadataEspañol = METADATA_ES_MOCK[1]?.[0];

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

  const getYearsRangeIndicator = async (indicator: string) => {
    const result = await axios
      .get(
        BASE_URL_WB_ES +
          `/country/ALL/indicator/${indicator}?format=json&per_page=1`
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log({ errgetYearsRangeIndicator: err });
      });

    const lastPage = result[0].pages;

    const lastYearResult = parseInt(result[1][0].date);

    const result2 = await axios
      .get(
        BASE_URL_WB_ES +
          `/country/ALL/indicator/${indicator}?format=json&per_page=1&page=${lastPage}`
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log({ errgetYeasRangeIndicator: err });
      });

    const firstYearResult = parseInt(result2[1][0].date);

    const dataYears = Array.from(
      { length: lastYearResult - firstYearResult + 1 },
      (_, i) => firstYearResult + i
    );
    setRangeYearsIndicator(dataYears.sort((a, b) => b - a));
  };

  return {
    indicators,
    getDataIndicator,
    dataIndicator,
    getYearsRangeIndicator,
    rangeYearsIndicator,
    metadataIndicator,
  };
};

export default useFetch;
