import axios from "axios";
import { useEffect, useState } from "react";
import { Indicador, IndicatorValue } from "../interfaces/Indicador";

const BASE_URL_WB = "https://api.worldbank.org/v2/es";
const CODE_TOPIC_HEALTH = 8;

const useFetch = () => {
  const [indicators, setIndicators] = useState<Indicador[]>([]);
  const [dataIndicator, setDataIndicator] = useState<IndicatorValue[]>([]);

  useEffect(() => {
    getIndicadores();
  }, []);

  const getIndicadores = async () => {
    await axios
      .get(
        BASE_URL_WB +
          `/topic/${CODE_TOPIC_HEALTH}/indicator?format=json&per_page=5`
      )
      .then((res) => {
        // console.log({ res });
        setIndicators(res.data[1]);
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  const getDataIndicator = async ({
    indicator,
    currentYear,
  }: {
    indicator: string;
    currentYear: number;
  }) => {
    await axios
      .get(
        BASE_URL_WB +
          `/country/ALL/indicator/${indicator}?format=json&date=${currentYear}`
      )
      .then((res) => {
        // console.log({ res });
        setDataIndicator(res.data[1]);
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  return { indicators, getDataIndicator, dataIndicator };
};

export default useFetch;
