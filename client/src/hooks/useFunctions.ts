import { IndicatorValue } from "@/interfaces/Indicador";

export type FunctionType = "" | "MAX" | "MIN" | "AVERAGE" | "TASA_CAMBIO";

export type FunctionValue = { label: string; value: FunctionType };

export const DEFAULT_VALUE_FUNCTION: FunctionValue = {
  value: "",
  label: "Seleccione",
};

export const FUNCTIONS_LIST: FunctionValue[] = [
  {
    label: "Máximo",
    value: "MAX",
  },
  {
    label: "Mínimo",
    value: "MIN",
  },
  {
    label: "Promedio",
    value: "AVERAGE",
  },
  {
    label: "Tasa de cambio",
    value: "TASA_CAMBIO",
  },
];

const useFunctions = () => {
  const getValueFunction = ({
    func,
    indicatorValues,
  }: {
    func: FunctionType;
    indicatorValues: IndicatorValue[];
  }): IndicatorValue => {
    try {
      let dataFinal: IndicatorValue;

      if (func === "MAX") {
        dataFinal = {
          ...indicatorValues[0],
          value: Math.max(
            ...indicatorValues.map((valueCountry) => valueCountry.value)
          ),
        };
      } else if (func === "MIN") {
        dataFinal = {
          ...indicatorValues[0],
          value: Math.min(
            ...indicatorValues.map((valueCountry) => valueCountry.value)
          ),
        };
      } else if (func === "AVERAGE") {
        let total = 0;
        let count = 0;

        indicatorValues.forEach((valueCountry) => {
          total += valueCountry.value;
          count++;
        });

        dataFinal = {
          ...indicatorValues[0],
          value: total / count,
        };
      } else if (func === "TASA_CAMBIO") {
        dataFinal = {
          ...indicatorValues[0],
          value: Math.min(
            ...indicatorValues.map((valueCountry) => valueCountry.value)
          ),
        };
      } else {
        throw new Error("La función a utilizar no existe");
      }

      return dataFinal;
    } catch (error) {
      console.log({ error });
      throw new Error(`Error al utilizar función '${func}'`);
    }
  };

  return {
    getValueFunction,
  };
};

export default useFunctions;
