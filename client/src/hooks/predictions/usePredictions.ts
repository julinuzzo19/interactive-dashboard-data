import { IndicatorValue } from "@/interfaces/Indicador";
import { TecnicaPredictiva } from "./predictions.interface";

const usePredictions = () => {
  // analizar variaciones entre rango de años para determinar tecnicas a utilizar

  const determinarTecnicaPredictiva = (
    values: IndicatorValue[]
  ): TecnicaPredictiva | "" => {
    try {
      validateHandlePrediction(values);

      let tecnicaDeterminada: TecnicaPredictiva = "";

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

      if (valuesIndicator.length <= 2) {
        // Sisolo hay 2 valores o menos, no participa en votacion
      }
      // Si la correlación es baja o hay muchas variaciones irregulares.
      else if (Math.abs(correlacionPearson) <= 0.7) {
        tecnicaDeterminada = "REGRESION LOGISTICA";
      } else {
        // determinar si usar regresion exponencial

        // 2️⃣ Calcular el crecimiento relativo entre puntos consecutivos
        let diferencias: number[] = [];
        for (let i = 1; i < valuesIndicator.length; i++) {
          diferencias.push(valuesIndicator[i] / valuesIndicator[i - 1]);
        }

        const promedioCrecimiento =
          diferencias.reduce((a, b) => a + b, 0) / diferencias.length;

        // console.log({ promedioCrecimiento, correlacionPearson });

        // Si el promedio de crecimiento es hasta un 10%, usa regresión lineal
        if (promedioCrecimiento <= 1.1) {
          tecnicaDeterminada = "REGRESION LINEAL";
        }
        // Si el promedio de crecimiento es mayor, usa regresion exponencial
        else if (valuesIndicator.length < 5 && promedioCrecimiento <= 1.3) {
          // evita predicciones demasiado extremas cuando hay pocos datos.
          tecnicaDeterminada = "REGRESION LOGISTICA";
        } else if (promedioCrecimiento <= 1.3 && valuesIndicator.length >= 5) {
          tecnicaDeterminada = "REGRESION EXPONENCIAL";
        } else if (promedioCrecimiento > 1.3) {
          // para comportamientos mezclados de crecimiento y decrecimiento o variaciones de la tasa de crecimiento
          tecnicaDeterminada = "REGRESION LOGISTICA";
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

    // console.log({ years, values:  valuesIndicator });

    if (years.length < 2) {
      // throw new Error(
      console.log(
        "Para predecir valor es necesario contar con al menos 2 valores de año"
      );
      // );
    } else if (valuesIndicator.length < 1) {
      // throw new Error(
      console.log(
        "Para predecir valor es necesario contar con al menos 2 valores de indicador"
      );
      // );
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

    // console.log({ a, lnA, b, xNormalized, valuePredicted });
    // }

    const valueFinal = parseFloat(valuePredicted.toFixed(3));
    return valueFinal;
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

    console.log({ currentYearFrom, currentYearTo });

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
    let objectTecnicasCount: { [key in TecnicaPredictiva]: number } = {
      "REGRESION LINEAL": 0,
      "REGRESION EXPONENCIAL": 0,
      "REGRESION LOGISTICA": 0,
      "": 0,
    };

    // Determinar tecnica de prediccion por votacion
    Object.entries(objectCountriesData).forEach(
      ([_countryCode, valuesCountry]) => {
        const tecnicaDeterminada = determinarTecnicaPredictiva(valuesCountry);

        objectTecnicasCount[tecnicaDeterminada]++;
      }
    );

    // Si no hay tecnica predilecta, por defecto regresion lineal
    const tecnicaDeterminadaGlobal =
      objectTecnicasCount[0] === objectTecnicasCount[1] &&
      objectTecnicasCount[1] === objectTecnicasCount[2]
        ? "REGRESION LINEAL"
        : (Object.entries(objectTecnicasCount).sort(
            (a, b) => b[1] - a[1]
          )[0][0] as TecnicaPredictiva) || "REGRESION LINEAL";

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
            let lineal, exponencial;

            const listItemsCountry = valuesCountry.filter(
              (item) => item.value && item.date
            );

            const years = listItemsCountry.map((item) => parseInt(item.date));
            const values = listItemsCountry.map((item) => parseInt(item.value));

            let diferencias: number[] = [];

            for (let i = 1; i < values.length; i++) {
              diferencias.push(values[i] / values[i - 1]);
            }

            const correlacionPearson = pearsonCorrelation(years, values);

            const promedioCrecimiento =
              diferencias.reduce((a, b) => a + b, 0) / diferencias.length;

            // console.log({ years, values });

            if (values.length < 2) {
              console.log("No se puede predecir valor sin datos históricos");
              return;
            }

            // Al determinar que funcion utilizar
            if (true || tecnicaDeterminadaGlobal === "REGRESION LINEAL") {
              item.value = linearRegression(years, values, parseInt(item.date));

              lineal = item.value;
            }
            if (true || tecnicaDeterminadaGlobal === "REGRESION EXPONENCIAL") {
              if (new Set(values).size < 2) {
                console.log("Se necesitan al menos 2 valores diferentes en x.");
                return;
              }

              const resultValue = exponentialRegression(
                years,
                values,
                parseInt(item.date)
              );
              exponencial = resultValue;
            }
            if (true || tecnicaDeterminadaGlobal === "REGRESION LOGISTICA") {
            }

            console.log({
              // @ts-ignore
              valorReal: item.valueReal,
              correlacionPearson,
              promedioCrecimiento,
              lineal,
              exponencial,
              item,
            });

            if (!item.value) {
              console.log("El valor no fue predicho correctamente");
              return;
            }
            if (item.value == Infinity) {
              console.log("El valor tiende a infinito.");
              return;
            }
          }

          // if (!item.value) {
          //   const listItemsCountry = valuesCountry.filter(
          //     (item) => item.value && item.date
          //   );

          //   const years = listItemsCountry.map((item) => parseInt(item.date));
          //   const values = listItemsCountry.map((item) => parseInt(item.value));

          //   console.log({ years, values });

          //   if (values.length < 2) {
          //     console.log("No se puede predecir valor sin datos históricos");
          //     return;
          //   }

          //   // Al determinar que funcion utilizar
          //   if (tecnicaDeterminadaGlobal === "REGRESION LINEAL") {
          //     item.value = linearRegression(years, values, parseInt(item.date));
          //   } else if (tecnicaDeterminadaGlobal === "REGRESION EXPONENCIAL") {
          //     if (new Set(values).size < 2) {
          //       console.log("Se necesitan al menos 2 valores diferentes en x.");
          //       return;
          //     }

          //     /*  Normalizacion de x (year)   */

          //     // Calcular la media
          //     const mediaYear =
          //       years.reduce((sum, year) => sum + year, 0) / years.length;

          //     //  Calculo la desviación estándar

          //     // Diferencia de cuadrados
          //     const squaredDifferences = years.map((year) =>
          //       Math.pow(year - mediaYear, 2)
          //     );
          //     // Varianza
          //     const variance =
          //       squaredDifferences.reduce((sum, value) => sum + value, 0) /
          //       years.length;

          //     // Desviación estandar
          //     const stdX = Math.sqrt(variance);

          //     const normalizedYears = years.map(
          //       (year) => (year - mediaYear) / stdX
          //     );

          //     // Paso 2: Linealización de la ecuación exponencial, aplicando logaritmo
          //     const logValues = values.map((value) => Math.log(value));

          //     // Paso 3: Regresión lineal sobre ln(y) y x normalizado
          //     const n = years.length;
          //     const sumX = normalizedYears.reduce((sum, x) => sum + x, 0);
          //     const sumY = logValues.reduce((sum, y) => sum + y, 0);
          //     const sumXY = normalizedYears.reduce(
          //       (sum, x, i) => sum + x * logValues[i],
          //       0
          //     );
          //     const sumX2 = normalizedYears.reduce((sum, x) => sum + x * x, 0);

          //     // Calcular b y ln(a)
          //     const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
          //     const lnA = (sumY - b * sumX) / n;
          //     const a = Math.exp(lnA);

          //     // Predecir el valor para el año
          //     const yearToPredict = dateItem;
          //     const xNormalized = (yearToPredict - mediaYear) / stdX;
          //     const valuePredicted = a * Math.exp(b * xNormalized);

          //     console.log({ a, lnA, b, xNormalized, valuePredicted });
          //     // }

          //     item.value = parseFloat(valuePredicted.toFixed(3));
          //   }

          //   if (!item.value) {
          //     console.log("El valor no fue predicho correctamente");
          //     return;
          //   }
          //   if (item.value == Infinity) {
          //     console.log("El valor tiende a infinito.");
          //     return;
          //   }
          // }

          // Si el valor existe o fue predicho correctamente, pushearlo al array final
          dataFinal.push(item);
        });
      }
    );

    console.log({ dataFinal });

    return dataFinal;
  };

  function calcularMSE(real: number[], predicho: number[]) {
    if (real.length !== predicho.length) {
      throw new Error("Los arrays deben tener la misma longitud");
    }

    const errores = real.map((valor, i) => (valor - predicho[i]) ** 2);
    const mse = errores.reduce((a, b) => a + b, 0) / real.length;

    return mse;
  }

  return {
    determinarTecnicaPredictiva,
    linearRegression,
    processDataFetchPredictions,
  };
};

export default usePredictions;
