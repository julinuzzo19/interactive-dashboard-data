import axios from "axios";
import { useEffect, useState } from "react";
import {
  Indicador,
  IndicatorMetadata,
  IndicatorValue,
} from "../interfaces/Indicador";
import DATA_MOCK from "../mocks/data.json";
import VALUES_MOCK from "../mocks/values.json";
import METADATA_ES_MOCK from "../mocks/metadata_es.json";
import METADATA_EN_MOCK from "../mocks/metadata_en.json";

const BASE_URL_WB = "https://api.worldbank.org/v2";
const BASE_URL_WB_ES = "https://api.worldbank.org/v2/es";
const CODE_TOPIC_HEALTH = 8;
const LIMIT_INDICATORS = 5;

const useFetch = () => {
  const [indicators, setIndicators] = useState<Indicador[]>([]);
  const [dataIndicator, setDataIndicator] = useState<IndicatorValue[]>([]);

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

    setDataIndicator(VALUES_MOCK?.filter((item) => item.value));
    getMetadataIndicator(indicator);
    // await axios
    //   .get(
    //     BASE_URL_WB_ES +
    //       `/country/ALL/indicator/${indicator}?format=json&per_page=${1000}&date=${currentYearFrom}:${currentYearTo}`
    //   )
    //   .then((res) => {
    //     console.log({ res });
    //     const data: IndicatorValue[] = res.data[1];
    //     setDataIndicator(data?.filter((item) => item.value));
    //   })
    //   .catch((err) => {
    //     console.log({ err });
    //   });
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

    console.log({ metadataEnglish, metadataEspañol });

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

  return { indicators, getDataIndicator, dataIndicator };
};

export default useFetch;
