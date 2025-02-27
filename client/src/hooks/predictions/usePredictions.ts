import { IndicatorValue } from "@/interfaces/Indicador";
import { TecnicaPredictiva } from "./predictions.interface";
import * as d3 from "d3-interpolate";

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

      // Si la correlación es baja o hay muchas variaciones irregulares.
      if (Math.abs(correlacionPearson) <= 0.7) {
        tecnicaDeterminada = "CURVAS SP";
      } else {
        // determinar si usar regresion exponencial

        // 2️⃣ Calcular el crecimiento relativo entre puntos consecutivos
        let diferencias: number[] = [];
        for (let i = 1; i < valuesIndicator.length; i++) {
          diferencias.push(valuesIndicator[i] / valuesIndicator[i - 1]);
        }

        const promedioCrecimiento =
          diferencias.reduce((a, b) => a + b, 0) / diferencias.length;

        console.log({ diferencias, promedioCrecimiento });

        // Si el promedio de crecimiento es hasta un 10%, usa regresión lineal
        if (promedioCrecimiento <= 1.1) {
          tecnicaDeterminada = "REGRESION LINEAL";
        }
        // Si el promedio de crecimiento es mayor, usa regresion exponencial
        else if (promedioCrecimiento <= 1.3) {
          tecnicaDeterminada = "REGRESION EXPONENCIAL";
        } else {
          tecnicaDeterminada = "CURVAS SP";
        }
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

  // Función para calcular la regresión exponencial
  function exponentialRegression(x, y) {
    // X: años de los datos
    // Y: valores de los datos ordenados con el año en X
    // PredictYear: Año a predecir valor

    // Transformamos y en escala logarítmica: ln(y)
    let lnY = y.map((value) => Math.log(value));

    // Cálculo de regresión lineal sobre x y ln(y)
    let n = x.length;
    let sumX = x.reduce((a, b) => a + b, 0);
    let sumLnY = lnY.reduce((a, b) => a + b, 0);
    let sumXlnY = x.map((xi, i) => xi * lnY[i]).reduce((a, b) => a + b, 0);
    let sumX2 = x.map((xi) => xi * xi).reduce((a, b) => a + b, 0);

    // Cálculo de coeficientes b y a
    let b = (n * sumXlnY - sumX * sumLnY) / (n * sumX2 - sumX ** 2);
    let a = Math.exp((sumLnY - b * sumX) / n);

    return { a, b };
  }
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

    console.log({ objectCountriesData });

    // Buscar valores nulos para analizar tecnica de prediccion a utilizar con los valores del pais en el rango de años
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

            console.log({ tecnicaDeterminada });

            const years = listItemsCountry.map((item) => parseInt(item.date));
            const values = listItemsCountry.map((item) => parseInt(item.value));

            console.log({ years, values });

            // Al determinar que funcion utilizar
            if (tecnicaDeterminada === "REGRESION LINEAL") {
              item.value = linearRegression(years, values, parseInt(item.date));
            } else if (tecnicaDeterminada === "REGRESION EXPONENCIAL") {
              if (new Set(values).size < 2) {
                // throw new Error(
                //   "Se necesitan al menos 2 valores diferentes en x."
                // );
                console.log("Se necesitan al menos 2 valores diferentes en x.");
                return;
              }

              const { a, b } = exponentialRegression(years, values);
              const x = parseInt(item.date);

              const valuePredicted = a * Math.exp(b * x);
              console.log({
                a,
                b,
                x,
                expBX: Math.exp(b * x),
                valuePredicted,
              });

              console.log({ valuePredicted });

              item.value = parseFloat(valuePredicted.toFixed(3));
            } else if (tecnicaDeterminada === "CURVAS SP") {
              const spline = d3.interpolateBasis(values);

              const minYear = years.at(0) as number;
              const maxYear = years.at(-1) as number;

              const normalizedYearPredict =
                (dateItem - minYear) / (maxYear - minYear);

              if (normalizedYearPredict < 0 || normalizedYearPredict > 1) {
                // throw new Error(
                //   "El valor del año a predecir está fuera del rango de los datos históricos."
                // );
                console.log(
                  "El valor del año a predecir está fuera del rango de los datos históricos."
                );
                return;
              }

              const predictedValue = spline(normalizedYearPredict);

              console.log({
                predictedValue,
                minYear,
                maxYear,
                normalizedYearPredict,
                dateItem,
              });

              item.value = predictedValue;
            }

            if (!item.value) {
              // throw new Error("El valor no fue predicho correctamente");
              console.log("El valor no fue predicho correctamente");
              return;
            }
            if (item.value == Infinity) {
              // throw new Error("El valor tiende a infinito.");
              console.log("El valor tiende a infinito.");
              return;
            }

            const indexItemValue = objectCountriesData[countryCode].findIndex(
              (item) => parseInt(item.date) === dateItem
            );

            if (indexItemValue == -1) {
              console.log("Error al buscar indice");
            }

            item.tecnicaUtilizada = tecnicaDeterminada;

            objectCountriesData[countryCode][indexItemValue].value = item.value;
            objectCountriesData[countryCode][indexItemValue].tecnicaUtilizada =
              item.tecnicaUtilizada;
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
