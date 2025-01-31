import { IndicatorValue } from "@/interfaces/Indicador";

export type FunctionType =
  | ""
  | "MAX"
  | "MIN"
  | "AVERAGE"
  | "TASA_CAMBIO"
  | "RECIENTE"
  | "ANTIGUO";

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
  {
    label: "Más reciente",
    value: "RECIENTE",
  },
  {
    label: "Más antiguo",
    value: "ANTIGUO",
  },
];

const useFunctions = () => {
  const getValueFunction = ({
    func,
    indicatorValues = [],
  }: {
    func: FunctionType;
    indicatorValues: IndicatorValue[];
  }): IndicatorValue => {
    try {
      let dataFinal: IndicatorValue;

      // console.log({ indicatorValues });

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
        const valuesSortLastYear = indicatorValues.sort(
          (a, b) => parseInt(b.date) - parseInt(a.date)
        );

        const initialValue = valuesSortLastYear.at(-1)?.value ?? 0;
        const lastValue = valuesSortLastYear.at(0)?.value ?? 0;

        const tasaCambioResult = parseFloat(
          (((lastValue - initialValue) / initialValue) * 100).toFixed(2)
        );

        dataFinal = {
          ...indicatorValues[0],
          value: tasaCambioResult,
        };
      } else if (func === "RECIENTE") {
        const valueReciente = indicatorValues.sort(
          (a, b) => parseInt(b.date) - parseInt(a.date)
        )[0];

        dataFinal = {
          ...indicatorValues[0],
          value: valueReciente.value,
        };
      } else if (func === "ANTIGUO") {
        const valueAntiguo = indicatorValues.sort(
          (a, b) => parseInt(a.date) - parseInt(b.date)
        )[0];

        dataFinal = {
          ...indicatorValues[0],
          value: valueAntiguo.value,
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
