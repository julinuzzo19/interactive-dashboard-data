import axios from "axios";
import { useEffect, useState } from "react";
import { Indicador, IndicatorValue } from "../interfaces/Indicador";
import DATA_MOCK from "../data.json";
import VALUES_MOCK from "../values.json";

const BASE_URL_WB = "https://api.worldbank.org/v2/es";
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
    //     BASE_URL_WB +
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
    // await axios
    //   .get(
    //     BASE_URL_WB +
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

  return { indicators, getDataIndicator, dataIndicator };
};

export default useFetch;
