import { IndicatorValue } from "@/interfaces/Indicador";
import { TecnicaPredictiva } from "./predictions.interface";

const usePredictions = () => {
  // TODO

  // analizar variaciones entre rango de años para determinar tecnicas a utilizar

  const determinarTecnicaPredictiva = (
    values: IndicatorValue[]
  ): TecnicaPredictiva => {
    try {
      return "REGRESION LINEAL";
    } catch (error) {
      console.log({ error });
      throw new Error("Error al determinar tecnica predictiva");
    }
  };

  const validateHandlePrediction = (values: IndicatorValue[]) => {
    if (values.length === 1) {
      throw new Error(
        "Para predecir valor es necesario contar con al menos 2 elementos y un valor en uno"
      );
    }
  };

  // Función para calcular la regresión lineal
  function linearRegression(x, y, predictYear) {
    // X: años de los datos
    // Y: valores de los datos ordenados con el año en X
    // PredictYear: Año a predecir valor

    // Número de años disponibles
    let n = x.length;

    // Suma de todos los años
    let sumX = x.reduce((a, b) => a + b, 0);

    // Suma de todos los valores del indicador
    let sumY = y.reduce((a, b) => a + b, 0);

    // Multiplica cada año por su respectivo valor del indicador y luego los suma
    let sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);

    // Calcula la suma de los cuadrados de cada año
    let sumX2 = x.map((xi) => xi * xi).reduce((a, b) => a + b, 0);

    // Calcula pendiente
    let m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Calculo de ordenada al origen
    let b = (sumY - m * sumX) / n;

    // Calculo de valor del indicador en el año a predecir
    const result = m * predictYear + b;

    console.log({ result });

    return result;
  }

  return {
    determinarTecnicaPredictiva,
    linearRegression,
  };
};

export default usePredictions;
