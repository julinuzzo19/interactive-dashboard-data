import { IndicatorValue } from "@/interfaces/Indicador";
import { TecnicaPredictiva } from "./predictions.interface";
import * as d3 from "d3-interpolate";
import * as d3sp from "d3";

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
      // console.log({ years, valuesIndicator, correlacionPearson });

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

        // console.log({ diferencias, promedioCrecimiento });

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
      throw new Error("Error al determinar tecnica predictiva");
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

    let objectTecnicasCount: { [key in TecnicaPredictiva]: number } = {
      "CURVAS SP": 0,
      "REGRESION LINEAL": 0,
      "REGRESION EXPONENCIAL": 0,
      "": 0,
    };

    // Determinar tecnica de prediccion por votacion
    Object.entries(objectCountriesData).forEach(
      ([_countryCode, valuesCountry]) => {
        const tecnicaDeterminada = determinarTecnicaPredictiva(valuesCountry);
        objectTecnicasCount[tecnicaDeterminada]++;
      }
    );

    const tecnicaDeterminadaGlobal = Object.entries(objectTecnicasCount).sort(
      (a, b) => b[1] - a[1]
    )[0][0] as TecnicaPredictiva;

    console.log({
      objectCountriesData,
      objectTecnicasCount,
      tecnicaDeterminadaGlobal,
    });

    // Calcular predicciones
    Object.entries(objectCountriesData).forEach(
      ([_countryCode, valuesCountry]) => {
        valuesCountry.forEach((item) => {
          const dateItem = parseInt(item.date);

          if (!(dateItem >= currentYearFrom && dateItem <= currentYearTo)) {
            return;
          }

          if (!item.value) {
            const listItemsCountry = valuesCountry.filter(
              (item) => item.value && item.date
            );

            const years = listItemsCountry.map((item) => parseInt(item.date));
            const values = listItemsCountry.map((item) => parseInt(item.value));

            console.log({ years, values });

            if (values.length < 2) {
              console.log("No se puede predecir valor sin datos históricos");
              return;
            }

            // Al determinar que funcion utilizar
            if (tecnicaDeterminadaGlobal === "REGRESION LINEAL") {
              item.value = linearRegression(years, values, parseInt(item.date));
            } else if (tecnicaDeterminadaGlobal === "REGRESION EXPONENCIAL") {
              if (new Set(values).size < 2) {
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

              item.value = parseFloat(valuePredicted.toFixed(3));
            } else if (tecnicaDeterminadaGlobal === "CURVAS SP") {
              const interpolator = d3.interpolateBasis(values);

              const minYear = years.at(0) as number;
              const maxYear = years.at(-1) as number;

              const normalizedYearPredict =
                (dateItem - minYear) / (maxYear - minYear);

              // Si el valor esta por fuera del intervalo de los datos históricos, utiliza regresión lineal por ser menos arriesgado
              if (normalizedYearPredict < 0 || normalizedYearPredict > 1) {
                console.log(
                  "El valor del año a predecir está fuera del rango de los datos históricos. Se utiliza Regresion lineal"
                );
                item.value = linearRegression(
                  years,
                  values,
                  parseInt(item.date)
                );

                item.tecnicaUtilizada = "REGRESION LINEAL";
              } else {
                const predictedValue = interpolator(normalizedYearPredict);

                item.value = predictedValue;
                item.tecnicaUtilizada = tecnicaDeterminadaGlobal;

                console.log({ years, values });
                const correlacionPearson = pearsonCorrelation(years, values);
                // Depende de la correlación, se determina la suavidad de la curva
                const alpha = calcularSuavidadCurvasSP(correlacionPearson);

                const valorPredichoSuavizado =
                  (1 - alpha) * interpolator(normalizedYearPredict) +
                  alpha * interpolator(normalizedYearPredict ^ 2);

                const valorPredichoSuavizado0 =
                  (1 - 0) * interpolator(normalizedYearPredict) +
                  0 * interpolator(normalizedYearPredict ^ 2);
                const valorPredichoSuavizado03 =
                  (1 - 0.3) * interpolator(normalizedYearPredict) +
                  0.3 * interpolator(normalizedYearPredict ^ 2);

                const valorPredichoSuavizado05 =
                  (1 - 0.5) * interpolator(normalizedYearPredict) +
                  0.5 * interpolator(normalizedYearPredict ^ 2);

                const valorPredichoSuavizado1 =
                  (1 - 1) * interpolator(normalizedYearPredict) +
                  1 * interpolator(normalizedYearPredict ^ 2);

                console.log({
                  minYear,
                  maxYear,
                  normalizedYearPredict,
                  dateItem,
                  correlacionPearson,
                  alpha,
                  predictedValue,
                  valorPredichoSuavizado,
                  valorPredichoSuavizado0,
                  valorPredichoSuavizado03,
                  valorPredichoSuavizado05,
                  valorPredichoSuavizado1,
                });

                item.value = valorPredichoSuavizado;
              }
            }

            if (!item.value) {
              console.log("El valor no fue predicho correctamente");
              return;
            }
            if (item.value == Infinity) {
              console.log("El valor tiende a infinito.");
              return;
            }
          }

          // Si el valor existe o fue predicho correctamente, pushearlo al array final
          dataFinal.push(item);
        });
      }
    );

    return dataFinal;
  };

  function calcularSuavidadCurvasSP(correlacion) {
    if (correlacion <= 0.7) return 1.0; // Muy flexible (Irregular)
    if (correlacion > 0.7 && correlacion <= 0.9) return 0.5; // Natural
    // Correlacion > 0.9
    return 0.3; // Rígido (Crecimiento estable)
  }

  return {
    determinarTecnicaPredictiva,
    linearRegression,
    processDataFetchPredictions,
  };
};

export default usePredictions;
