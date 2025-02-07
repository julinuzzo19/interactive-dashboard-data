import { IndicatorValue } from "@/interfaces/Indicador";
import { TecnicaPredictiva } from "./predictions.interface";

const usePredictions = () => {
  // analizar variaciones entre rango de años para determinar tecnicas a utilizar

  const determinarTecnicaPredictiva = (
    values: IndicatorValue[]
  ): TecnicaPredictiva => {
    try {
      validateHandlePrediction(values);

      let tecnicaDeterminada: TecnicaPredictiva;

      // Formatear los datos
      const valuesSorted = values.sort(
        (a, b) => parseInt(a.date) - parseInt(b.date)
      );

      const years = valuesSorted
        .filter((item) => item?.value)
        .map((item) => parseInt(item.date));
      const valuesIndicator = valuesSorted
        .filter((item) => item?.value)
        .map((item) => item.value);

      const correlacionPearson = pearsonCorrelation(years, valuesIndicator);
      console.log({ years, valuesIndicator, correlacionPearson });

      if (Math.abs(correlacionPearson) > 0.7) {
        tecnicaDeterminada = "REGRESION LINEAL";
      } else {
        // Determinar otros metodos
        console.log("DETERMINAR OTRO METODO");
        tecnicaDeterminada = "REGRESION LINEAL";
      }

      return tecnicaDeterminada;
    } catch (error) {
      console.log({ error });
      // throw new Error("Error al determinar tecnica predictiva");
      return "REGRESION LINEAL";
    }
  };

  const validateHandlePrediction = (values: IndicatorValue[]) => {
    if (values.length === 1) {
      throw new Error(
        "Para predecir valor es necesario contar con al menos 2 elementos y un valor en uno"
      );
    }

    const valuesSorted = values.sort(
      (a, b) => parseInt(a.date) - parseInt(b.date)
    );

    const years = valuesSorted
      .filter((item) => item?.value)
      .map((item) => parseInt(item.date));
    const valuesIndicator = valuesSorted
      .filter((item) => item?.value)
      .map((item) => item.value);

    if (years.length < 2) {
      throw new Error(
        "Para predecir valor es necesario contar con al menos 2 valores de año"
      );
    } else if (valuesIndicator.length < 1) {
      throw new Error(
        "Para predecir valor es necesario contar con al menos 2 valores de indicador"
      );
    }
  };

  // Función para calcular la regresión lineal
  function linearRegression(x, y, predictYear) {
    // X: años de los datos
    // Y: valores de los datos ordenados con el año en X
    // PredictYear: Año a predecir valor

    // console.log({ x, y });

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

    return result;
  }

  function pearsonCorrelation(x, y) {
    // X: años de los datos
    // Y: valores de los datos ordenados con el año en X

    // Cantidad de datos
    let n = x.length;

    // Suma de años
    let sumX = x.reduce((a, b) => a + b, 0);

    // Suma de valores de indicador
    let sumY = y.reduce((a, b) => a + b, 0);

    // Suma de productos x e y
    let sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);

    // Suma de los cuadrados
    let sumX2 = x.map((xi) => xi * xi).reduce((a, b) => a + b, 0);
    let sumY2 = y.map((yi) => yi * yi).reduce((a, b) => a + b, 0);

    // Cálculo del Numerador
    let numerator = n * sumXY - sumX * sumY;

    // Cálculo del Denominador
    let denominator = Math.sqrt(
      (n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2)
    );

    const result = numerator / denominator;

    return result;
  }

  const processDataFetchPredictions = ({
    currentYearFrom,
    currentYearTo,
    data,
  }: {
    data: IndicatorValue[];
    currentYearFrom: number;
    currentYearTo: number;
  }) => {
    const dataFinal: IndicatorValue[] = [];

    const dataSorted = data.sort((a, b) => parseInt(a.date) - parseInt(b.date));

    // Agrupar por paises

    let objectCountriesData: { [key in string]: IndicatorValue[] } = {};

    dataSorted.forEach((item) => {
      if (item?.countryiso3code) {
        if (objectCountriesData[item.countryiso3code]) {
          objectCountriesData[item.countryiso3code].push(item);
        } else {
          objectCountriesData[item.countryiso3code] = [item];
        }
      }
    });

    // analizar valores

    // predecir valores faltantes

    // retornar datos dentro del rango de años seleccionado

    // Get data indicators and handle predictions

    Object.entries(objectCountriesData).forEach(
      ([countryCode, valuesCountry]) => {
        valuesCountry.forEach((item) => {
          const dateItem = parseInt(item.date);

          if (!(dateItem >= currentYearFrom && dateItem <= currentYearTo)) {
            return;
          }

          if (!item.value) {
            const listItemsCountry = objectCountriesData[countryCode].filter(
              (item) => item.value && item.date
            );

            // Accedo desde el objeto objectCountriesData para obtener los valores actualizados
            const tecnicaDeterminada =
              determinarTecnicaPredictiva(listItemsCountry);

            // Al determinar que funcion utilizar
            if (tecnicaDeterminada === "REGRESION LINEAL") {
              item.value = linearRegression(
                listItemsCountry.map((item) => parseInt(item.date)),
                listItemsCountry.map((item) => parseInt(item.value)),
                parseInt(item.date)
              );
            }

            if (!item.value) {
              throw new Error("El valor no fue predicho correctamente");
            }

            const indexItemValue = objectCountriesData[countryCode].findIndex(
              (item) => parseInt(item.date) === dateItem
            );

            if (indexItemValue == -1) {
              console.log("Error al buscar indice");
            }
            objectCountriesData[countryCode][indexItemValue].value = item.value;
          }
          // Si el valor existe, pushearlo al array final
          dataFinal.push(item);
        });
      }
    );

    return dataFinal;
  };

  return {
    determinarTecnicaPredictiva,
    linearRegression,
    processDataFetchPredictions,
  };
};

export default usePredictions;
