import { IndicatorValue } from "@/interfaces/Indicador";
import { TecnicaPredictiva } from "@/interfaces/predictions";
import EXP from "../data/indicators/EXP.json";
import LOGISTIC from "../data/indicators/LOGISTIC.json";
import LINEAL from "../data/indicators/LINEAL.json";
import INDICATOR from "../data/indicators/SP_POP_TOTL_MA_IN.json";
import INDICATOR2 from "../data/indicators/SG_VAW_NEGL_ZS.json";
import INDICATOR3 from "../data/indicators/SH_H2O_BASW_RU_ZS.json";
import INDICATOR4 from "../data/indicators/SG_VAW_ARGU_ZS.json";
import INDICATOR5 from "../data/indicators/SP_POP_DPND_OL.json";
import INDICATOR6 from "../data/indicators/SP_UWT_TFRT.json";
import INDICATOR7 from "../data/indicators/SH_CON_1524_MA_ZS.json";
import INDICATOR8 from "../data/indicators/SH_DYN_MORT_FE.json";
import INDICATOR9 from "../data/indicators/SH_HIV_PMTC_ZS.json";
import INDICATOR10 from "../data/indicators/SP_POP_7074_FE_5Y.json";
import { useEffect } from "react";

const usePredictions = () => {
  useEffect(() => {
    predeterminarTecnicasPredictivas();
  }, []);

  const predeterminarTecnicasPredictivas = async () => {
    // const DATA = (INDICATOR as IndicatorValue[]).filter(
    //   (item) => item.countryiso3code === "ARG"
    // );

    processDataFetchPredictions({
      data: EXP as any,
      currentYearFrom: 1960,
      currentYearTo: 2025,
    });
  };

  const determinarTecnicaPredictiva = (
    data: IndicatorValue[]
  ): TecnicaPredictiva | null => {
    try {
      console.log({ data });
      // Filtrar y ordenar los datos
      const { years, values } = processData(data);

      console.log({ years, values });

      validateHandlePrediction(values, years);

      // Variables para determinar la técnica
      const correlacionPearson = pearsonCorrelation(years, values);
      const promedioCrecimiento = getPromedioCrecimiento(values);
      const seEstabililza = isGrowthDecelerating(values);

      let tecnicaDeterminada: TecnicaPredictiva | null = null;

      /*  Condiciones para determinar la técnica  */

      if (correlacionPearson <= 0.7) {
        if (seEstabililza) {
          // Si la correlación es baja y se estabiliza
          tecnicaDeterminada = "REGRESION LOGISTICA";
        } else {
          // Si la correlación es baja y no se estabiliza
          tecnicaDeterminada = "REGRESION EXPONENCIAL";
        }
      } else {
        // Correlacion fuerte

        if (promedioCrecimiento <= 1.1) {
          // Correlacion fuerte y crecimiento muy estable
          tecnicaDeterminada = "REGRESION LINEAL";
        } else if (seEstabililza) {
          // Correlación fuerte, el indicador muestra desaceleración progresiva
          tecnicaDeterminada = "REGRESION LOGISTICA";
        } else if (promedioCrecimiento <= 1.3 && values.length >= 5) {
          // Crecimiento moderado (entre 10% y 30%) con datos suficientes y sin estabilización
          tecnicaDeterminada = "REGRESION EXPONENCIAL";
        } else {
          // Crecimiento muy alto o pocos datos -> riesgo de proyecciones irreales con exponencial
          tecnicaDeterminada = "REGRESION LOGISTICA";
        }
      }

      // // Si la correlación no es muy alta o hay muchas variaciones irregulares.
      // if (correlacionPearson <= 0.7) {
      //   tecnicaDeterminada = "REGRESION LOGISTICA";
      // } else {
      //   // Si el promedio de crecimiento es hasta un 10% mas, usa regresión lineal
      //   if (promedioCrecimiento <= 1.1) {
      //     tecnicaDeterminada = "REGRESION LINEAL";
      //   }
      //   // evita predicciones demasiado extremas cuando hay pocos datos.
      //   else if (valuesIndicator.length < 5 && promedioCrecimiento <= 1.3) {
      //     tecnicaDeterminada = "REGRESION LOGISTICA";
      //   } else if (promedioCrecimiento <= 1.3 && valuesIndicator.length >= 5) {
      //     tecnicaDeterminada = "REGRESION EXPONENCIAL";
      //   } else if (promedioCrecimiento > 1.3) {
      //     // para comportamientos mezclados de crecimiento y decrecimiento o variaciones de la tasa de crecimiento
      //     tecnicaDeterminada = "REGRESION LOGISTICA";
      //   }

      console.table({
        values,
        years,
        correlacionPearson,
        promedioCrecimiento,
        seEstabililza,
        tecnicaDeterminada,
      });

      return tecnicaDeterminada;
    } catch (error) {
      console.log({ error });
      return null;
    }
  };

  const validateHandlePrediction = (values: number[], years: number[]) => {
    if (values.length <= 2) {
      throw new Error(
        "Si solo hay 2 valores o menos, no participa en votacion"
      );
    }
    if (years.length < 2) {
      throw new Error(
        "Para predecir valor es necesario contar con al menos 2 elementos"
      );
    }
  };

  // Función para calcular la regresión exponencial
  function exponentialRegression(
    years: number[],
    values: number[],
    year: number
  ) {
    // X: años de los datos
    // Y: valores de los datos ordenados con el año en X
    // PredictYear: Año a predecir valor
    /*  Normalizacion de x (year)   */

    // Calcular la media
    const mediaYear = years.reduce((sum, year) => sum + year, 0) / years.length;

    //  Calculo la desviación estándar

    // Diferencia de cuadrados
    const squaredDifferences = years.map((year) =>
      Math.pow(year - mediaYear, 2)
    );
    // Varianza
    const variance =
      squaredDifferences.reduce((sum, value) => sum + value, 0) / years.length;

    // Desviación estandar
    const stdX = Math.sqrt(variance);

    const normalizedYears = years.map((year) => (year - mediaYear) / stdX);

    // Paso 2: Linealización de la ecuación exponencial, aplicando logaritmo
    const logValues = values.map((value) => Math.log(value));

    // Paso 3: Regresión lineal sobre ln(y) y x normalizado
    const n = years.length;
    const sumX = normalizedYears.reduce((sum, x) => sum + x, 0);
    const sumY = logValues.reduce((sum, y) => sum + y, 0);
    const sumXY = normalizedYears.reduce(
      (sum, x, i) => sum + x * logValues[i],
      0
    );
    const sumX2 = normalizedYears.reduce((sum, x) => sum + x * x, 0);

    // Calcular b y ln(a)
    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const lnA = (sumY - b * sumX) / n;
    const a = Math.exp(lnA);

    // Predecir el valor para el año
    const yearToPredict = year;
    const xNormalized = (yearToPredict - mediaYear) / stdX;
    const valuePredicted = a * Math.exp(b * xNormalized);

    const valueFinal = parseFloat(valuePredicted.toFixed(3));
    return valueFinal;
  }
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

    return result;
  }

  function logisticRegressionPredict(
    years: number[],
    values: number[],
    targetYear: number,
    L: any = null
  ) {
    // Normalizar años para estabilidad numérica
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const normalizedYears = years.map(
      (y) => (y - minYear) / (maxYear - minYear)
    );

    // Definir L (límite superior)
    if (L === null) {
      L = Math.max(...values);
    }

    // Evitar problemas numéricos en la transformación log-odds
    const epsilon = 1e-10;
    const logOdds = values.map((v) => {
      if (v >= L) v = L - epsilon; // Evitar que v sea igual o mayor que L
      return Math.log(v / (L - v));
    });

    // Calcular coeficientes de regresión lineal sobre log-odds
    const n = normalizedYears.length;
    const sumX = normalizedYears.reduce((a, b) => a + b, 0);
    const sumY = logOdds.reduce((a, b) => a + b, 0);
    const sumXY = normalizedYears.reduce(
      (sum, x, i) => sum + x * logOdds[i],
      0
    );
    const sumX2 = normalizedYears.reduce((sum, x) => sum + x * x, 0);

    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const a = (sumY - b * sumX) / n;

    // Normalizar año objetivo
    const normalizedTargetYear = (targetYear - minYear) / (maxYear - minYear);
    const predictedLogOdds = a + b * normalizedTargetYear;

    // Convertir log-odds a valor predicho
    const predictedValue = L / (1 + Math.exp(-predictedLogOdds));

    return predictedValue;
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
    const result = Math.abs(numerator / denominator);

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

    // Agrupar por paises
    let objectCountriesData: { [key in string]: IndicatorValue[] } = {};

    data
      .sort((a, b) => parseInt(a.date) - parseInt(b.date))
      .forEach((item) => {
        if (item?.countryiso3code) {
          if (objectCountriesData[item.countryiso3code]) {
            objectCountriesData[item.countryiso3code].push(item);
          } else {
            objectCountriesData[item.countryiso3code] = [item];
          }
        }
      });

    // console.log({ objectCountriesData });

    let objectTecnicasCount: { [key in TecnicaPredictiva]: number } = {
      "REGRESION LINEAL": 0,
      "REGRESION EXPONENCIAL": 0,
      "REGRESION LOGISTICA": 0,
    };

    // Determinar tecnica de prediccion por votacion
    Object.entries(objectCountriesData).forEach(
      ([_countryCode, valuesCountry]) => {
        if (valuesCountry?.length <= 1) {
          return;
        }

        const tecnicaDeterminada = determinarTecnicaPredictiva(valuesCountry);

        if (tecnicaDeterminada) {
          objectTecnicasCount[tecnicaDeterminada]++;
        }
      }
    );

    // Si no hay tecnica predilecta, por defecto regresion lineal
    const tecnicasSorted = Object.entries(objectTecnicasCount).sort(
      (a, b) => b[1] - a[1]
    );

    const tecnicaDeterminadaGlobal =
      tecnicasSorted[0][1] === tecnicasSorted[1][1]
        ? "REGRESION LINEAL"
        : (tecnicasSorted[0][0] as TecnicaPredictiva);

    // console.log({
    //   objectTecnicasCount,
    //   tecnicaDeterminadaGlobal,
    // });

    // Calcular predicciones
    Object.entries(objectCountriesData).forEach(
      ([_countryCode, valuesCountry]) => {
        valuesCountry.forEach((item) => {
          const dateItem = parseInt(item.date);

          if (!(dateItem >= currentYearFrom && dateItem <= currentYearTo)) {
            return;
          }

          if (!item.value) {
            const years: number[] = [];
            const values: number[] = [];

            valuesCountry
              .filter(
                (item) =>
                  !(
                    item.value === null ||
                    item.value === undefined ||
                    isNaN(item.value)
                  ) && item.date
              )
              .forEach((item) => {
                values.push(parseInt(item.value));
                years.push(parseInt(item.date));
              });

            // No se puede predecir valor sin datos históricos
            if (values.length < 2) {
              return;
            }

            // Utilizar tecnica determina para predecir valor
            if (tecnicaDeterminadaGlobal === "REGRESION LINEAL") {
              const resultValue = linearRegression(
                years,
                values,
                parseInt(item.date)
              );
              item.value = parseFloat(resultValue.toFixed(3));
            } else if (tecnicaDeterminadaGlobal === "REGRESION EXPONENCIAL") {
              if (new Set(values).size < 2) {
                console.log("Se necesitan al menos 2 valores diferentes en x.");
                return;
              }

              const resultValue = exponentialRegression(
                years,
                values,
                parseInt(item.date)
              );
              item.value = parseFloat(resultValue.toFixed(3));
            } else if (tecnicaDeterminadaGlobal === "REGRESION LOGISTICA") {
              const resultValue = logisticRegressionPredict(
                years,
                values,
                parseInt(item.date)
              );

              item.value = parseFloat(resultValue.toFixed(3));
            }

            console.log(item.date, item.value, data[0].countryiso3code);
            // console.log({
            // item,
            // date: item.date,
            // value: item.value,
            // countryCode: item.countryiso3code,
            // });

            item.tecnicaUtilizada = tecnicaDeterminadaGlobal;

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

  function processData(valuesIndicator: IndicatorValue[]) {
    const years: number[] = [];
    const values: number[] = [];

    // Filtrar los valores para obtener solo los años y valores
    // y ordenarlos por año
    valuesIndicator
      .filter(
        (item) =>
          !(
            item.value === null ||
            item.value === undefined ||
            isNaN(item.value)
          )
      )
      .sort((a, b) => parseInt(a.date) - parseInt(b.date))
      .forEach((item) => {
        years.push(parseInt(item.date));
        values.push(parseFloat(item.value));
      });

    return {
      years,
      values,
    };
  }

  function getPromedioCrecimiento(values: number[]) {
    let diferencias: number[] = [];
    for (let i = 1; i < values.length; i++) {
      diferencias.push(values[i] / values[i - 1]);
    }
    return diferencias.reduce((a, b) => a + b, 0) / diferencias.length;
  }

  function isGrowthDecelerating(values: number[]) {
    const rates: number[] = [];
    for (let i = 1; i < values.length; i++) {
      const rate = (values[i] - values[i - 1]) / values[i - 1];
      rates.push(rate);
    }

    let decelerating = true;
    for (let i = 1; i < rates.length; i++) {
      if (rates[i] > rates[i - 1]) {
        decelerating = false;
        break;
      }
    }

    return decelerating;
  }

  return {
    determinarTecnicaPredictiva,
    linearRegression,
    processDataFetchPredictions,
    predeterminarTecnicasPredictivas,
  };
};

export default usePredictions;
