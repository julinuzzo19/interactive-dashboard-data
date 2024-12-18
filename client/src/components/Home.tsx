import { useCallback, useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import Select, { SingleValue } from "react-select";
import "react-tooltip/dist/react-tooltip.css";
import { GeoCountryColor } from "../interfaces/Geo";
import { formatPrecio } from "../utils/formatPrecio";
import Geo from "./Geo";
// import { Tooltip } from "react-tooltip";
import chroma from "chroma-js";

const Home = () => {
  const { indicators, getDataIndicator, dataIndicator } = useFetch();
  // const [tooltipContent, setTooltipContent] = useState<
  //   Partial<GeoCountryColor>
  // >({});
  const [currentYearFrom, setCurrentYearFrom] = useState(
    new Date().getFullYear()
  );
  const [currentYearTo, setCurrentYearTo] = useState(new Date().getFullYear());
  const [currentIndicator, setCurrentIndicator] = useState<
    SingleValue<{
      label: string;
      value: string;
    }>
  >({
    // label: "",
    // value: "",
    label: "Población, hombres  (SP.POP.TOTL.MA.IN)",
    value: "SP.POP.TOTL.MA.IN",
  });
  const [minValueIndicator, setMinValueIndicator] = useState(0);
  const [maxValueIndicator, setMaxValueIndicator] = useState(0);

  // let colorScale = chroma.scale(["#ADD8E6", "#FF0000"]).domain([0, 1]);
  let colorScale = chroma.scale(["yellow", "navy"]).mode("lch");
  // let colorScale = chroma.scale("OrRd").padding([0.2, 0]);

  useEffect(() => {
    if (minValueIndicator !== undefined && maxValueIndicator !== undefined) {
      colorScale = chroma
        .scale(["yellow", "navy"])
        .mode("lch")
        .domain([minValueIndicator, maxValueIndicator]);
    }
  }, [minValueIndicator, maxValueIndicator]);

  useEffect(() => {
    // console.log({ currentIndicator });
    if (currentIndicator?.value && currentYearFrom && currentYearTo) {
      getDataIndicator({
        indicator: currentIndicator.value,
        currentYearFrom,
        currentYearTo,
      });
    }
  }, [currentIndicator?.value, currentYearTo, currentYearFrom]);

  useEffect(() => {
    if (dataIndicator?.length > 0) {
      // console.log({ dataIndicator });
      setMinValueIndicator(
        Math.min(...dataIndicator.map((item) => item.value))
      );
      setMaxValueIndicator(
        Math.max(...dataIndicator.map((item) => item.value))
      );
    } else {
      setMinValueIndicator(0);
      setMaxValueIndicator(0);
    }
  }, [dataIndicator]);

  // const generateColorByValue = useCallback(
  //   (value: number) => {
  //     // Verifica que la lista no esté vacía
  //     // if (maxValueIndicator === 0 || minValueIndicator === 0) {
  //     //   // throw new Error("La lista de números no puede estar vacía.");
  //     //   return;
  //     // }

  //     // // Obtén el valor mínimo y máximo de la lista
  //     // const min = minValueIndicator;
  //     // const max = maxValueIndicator;

  //     // console.log({ min, max });

  //     // return colorScale(value).hex();
  //     // Normaliza el valor entre 0 y 1
  //     // const normalizedValueB = (value - min) / (max - min);

  //     // // Escalación logarítmica
  //     // const logMin = Math.log(min);
  //     // const logMax = Math.log(max);
  //     // const logValue = Math.log(value);

  //     // // Normaliza entre 0 y 1
  //     // const normalizedValue = (logValue - logMin) / (logMax - logMin);

  //     // console.log({ normalizedValueB, normalizedValue });

  //     // // const red = Math.floor(255 * (1 - normalizedValue)); // Disminuye al aumentar el valor
  //     // // const green = Math.floor(255 * normalizedValue); // Aumenta al aumentar el valor
  //     // // const blue = 0; // Azul fijo en 0 para simplificar

  //     // const red = Math.floor(173 + (255 - 173) * normalizedValue);   // Aumenta de 173 a 255
  //     // const green = Math.floor(216 - 216 * normalizedValue);         // Decrece de 216 a 0
  //     // const blue = Math.floor(230 - 230 * normalizedValue);

  //     // console.log({ red, green, blue, value });

  //     // // Retorna el color en formato RGB
  //     // return `rgb(${red}, ${green}, ${blue})`;
  //   },
  //   [colorScale]
  // );

  const generateColorByValue = useCallback(
    (value) => {
      if (!colorScale || typeof colorScale !== "function") return "#ccc"; // Valor por defecto

      const colorCountry = colorScale(value as number).hex();
      console.log({ value, colorCountry });
      return colorCountry;
    },
    [colorScale]
  );

  return (
    <div className="flex flex-col justify-center items-center mt-10 w-full">
      <h2>Indicadores</h2>

      <div className="w-full flex flex-col justify-center items-center mt-10 mb-10">
        <Select
          className="w-8/12"
          options={indicators.map((indicador) => ({
            value: indicador.id,
            label: `${indicador.name}  (${indicador.id})`,
          }))}
          maxMenuHeight={200}
          placeholder="Selecciona un indicador"
          value={currentIndicator}
          onChange={(data) => setCurrentIndicator(data)}
        />
      </div>

      {currentIndicator?.value && (
        <div className="text-center">
          <h2>Indicador</h2>
          <h5 className="font-bold">{currentIndicator.label}</h5>
        </div>
      )}

      <div className="flex flex-row justify-end items-end w-10/12">
        <div className="flex flex-col text-center justify-center">
          <p>Intervalo de tiempo</p>

          <div>
            <span>Desde</span>
            <select
              className="text-center"
              value={currentYearFrom}
              onChange={(e) => setCurrentYearFrom(parseInt(e.target.value))}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
          <div>
            <span>Hasta</span>
            <select
              className="text-center"
              value={currentYearTo}
              onChange={(e) => setCurrentYearTo(parseInt(e.target.value))}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-8/12">
        <Geo
          dataIndicator={dataIndicator}
          // setTooltipContent={setTooltipContent}
          // tooltipContent={tooltipContent}
          generateColorByValue={generateColorByValue}
        />
        {/* <Tooltip id="my-tooltip" className="text-center">
          {tooltipContent?.id && (
            <div>
              <h3>{tooltipContent.properties?.name}</h3>
              <p className="text-sm italic">
                {tooltipContent.properties?.continent}
              </p>
              <b>({formatPrecio(tooltipContent.value)})</b>
            </div>
          )}
        </Tooltip> */}
      </div>
    </div>
  );
};

export default Home;
