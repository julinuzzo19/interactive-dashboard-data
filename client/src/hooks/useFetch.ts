import axios from "axios";
import { useEffect, useState } from "react";
import { Indicador } from "../interfaces/Indicador";

const BASE_URL_WB = "https://api.worldbank.org/v2";

const useFetch = () => {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);

  useEffect(() => {
    getIndicadores();
  }, []);

  const getIndicadores = async () => {
    await axios
      .get(BASE_URL_WB + "/indicator?format=json")
      .then((res) => {
        console.log({ res });
        setIndicadores(res.data[1]);
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  return { indicadores };
};

export default useFetch;
