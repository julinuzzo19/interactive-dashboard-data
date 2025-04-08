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

      const indicatorValuesNoPredichos = indicatorValues.filter(
        (item) => !item?.tecnicaUtilizada
      );

      console.log({ indicatorValuesNoPredichos, indicatorValues });

      // Validacion de datos
      if (
        indicatorValues.length === 1 ||
        indicatorValuesNoPredichos.length === 0
      ) {
        const item = indicatorValues[0];
        dataFinal = item;
        return dataFinal;
      }

      if (func === "MAX") {
        const maxValue = Math.max(
          ...indicatorValuesNoPredichos.map(
            (valueCountry) => valueCountry.value
          )
        );
        const resultValue = indicatorValuesNoPredichos.find(
          (item) => item.value === maxValue
        );

        console.log({ maxValue, resultValue });

        dataFinal = {
          ...indicatorValuesNoPredichos[0],
          value: maxValue,
          date: resultValue?.date as string,
          tecnicaUtilizada: resultValue?.tecnicaUtilizada,
        };
      } else if (func === "MIN") {
        const minValue = Math.min(
          ...indicatorValuesNoPredichos.map(
            (valueCountry) => valueCountry.value
          )
        );
        const resultValue = indicatorValuesNoPredichos.find(
          (item) => item.value === minValue
        );

        dataFinal = {
          ...indicatorValuesNoPredichos[0],
          value: minValue,
          date: resultValue?.date as string,
          tecnicaUtilizada: resultValue?.tecnicaUtilizada,
        };
      } else if (func === "AVERAGE") {
        let total = 0;
        let count = 0;

        indicatorValuesNoPredichos.forEach((valueCountry) => {
          total += valueCountry.value;
          count++;
        });

        dataFinal = {
          ...indicatorValuesNoPredichos[0],
          value: total / count,
        };
      } else if (func === "TASA_CAMBIO") {
        const valuesSortLastYear = indicatorValuesNoPredichos.sort(
          (a, b) => parseInt(b.date) - parseInt(a.date)
        );

        const initialValue = valuesSortLastYear.at(-1)?.value ?? 0;
        const lastValue = valuesSortLastYear.at(0)?.value ?? 0;

        const tasaCambioResult = parseFloat(
          (((lastValue - initialValue) / initialValue) * 100).toFixed(2)
        );

        dataFinal = {
          ...indicatorValuesNoPredichos[0],
          tecnicaUtilizada: undefined,
          value: tasaCambioResult,
        };
      } else if (func === "RECIENTE") {
        const valueReciente = indicatorValuesNoPredichos.sort(
          (a, b) => parseInt(b.date) - parseInt(a.date)
        )[0];

        dataFinal = {
          ...indicatorValuesNoPredichos[0],
          value: valueReciente.value,
          date: valueReciente.date,
          tecnicaUtilizada: valueReciente?.tecnicaUtilizada,
        };
      } else if (func === "ANTIGUO") {
        const valueAntiguo = indicatorValuesNoPredichos.sort(
          (a, b) => parseInt(a.date) - parseInt(b.date)
        )[0];

        dataFinal = {
          ...indicatorValuesNoPredichos[0],
          value: valueAntiguo.value,
          date: valueAntiguo.date,
          tecnicaUtilizada: valueAntiguo?.tecnicaUtilizada,
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
