import axios from "axios";
import { useEffect, useState } from "react";
import { Indicador } from "../interfaces/Indicador";

const BASE_URL_WB = "https://api.worldbank.org/v2/es";
const CODE_TOPIC_HEALTH = 8;

const useFetch = () => {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);

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
        setIndicadores(res.data[1]);
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  return { indicadores };
};

export default useFetch;
