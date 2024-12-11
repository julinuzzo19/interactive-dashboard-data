import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import Select, { SingleValue } from "react-select";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { GeoCountryColor } from "../interfaces/Geo";
import { formatPrecio } from "../utils/formatPrecio";
import Geo from "./Geo";

const Home = () => {
  const { indicators, getDataIndicator, dataIndicator } = useFetch();
  const [tooltipContent, setTooltipContent] = useState<
    Partial<GeoCountryColor>
  >({});
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
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

  useEffect(() => {
    console.log({ tooltipContent });
  }, [tooltipContent]);
  useEffect(() => {
    console.log({ maxValueIndicator, minValueIndicator });
  }, [maxValueIndicator, minValueIndicator]);

  useEffect(() => {
    console.log({ currentIndicator });
    if (currentIndicator?.value && currentYear) {
      getDataIndicator({
        indicator: currentIndicator.value,
        currentYear,
      });
    }
  }, [currentIndicator?.value, currentYear]);

  useEffect(() => {
    if (dataIndicator?.length > 0) {
      console.log({ dataIndicator });
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

  const generateColorByValue = (value: number) => {
    // Verifica que la lista no esté vacía
    if (maxValueIndicator === 0 || minValueIndicator === 0) {
      // throw new Error("La lista de números no puede estar vacía.");
      return;
    }

    // Obtén el valor mínimo y máximo de la lista
    const min = minValueIndicator;
    const max = maxValueIndicator;

    // Normaliza el valor entre 0 y 1
    const normalizedValue = (value - min) / (max - min);

    // Genera componentes RGB basados en la intensidad
    const red = Math.floor(255 * normalizedValue); // Más alto con mayor intensidad
    const blue = Math.floor(255 * (1 - normalizedValue)); // Más alto con menor intensidad
    const green = 100; // Componente fija o ajustable según preferencia

    // Retorna el color en formato RGB
    return `rgb(${red}, ${green}, ${blue})`;
  };

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
          <p>Año seleccionado</p>
          <select
            className="text-center"
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
        </div>
      </div>

      <div className="w-8/12">
        <Geo
          dataIndicator={dataIndicator}
          generateColorByValue={generateColorByValue}
          setTooltipContent={setTooltipContent}
        />
        <Tooltip id="my-tooltip" className="text-center">
          {tooltipContent?.id && (
            <div>
              <h3>{tooltipContent.properties?.name}</h3>
              <p className="text-sm italic">
                {tooltipContent.properties?.continent}
              </p>
              <b>({formatPrecio(tooltipContent.value)})</b>
            </div>
          )}
        </Tooltip>
      </div>
    </div>
  );
};

export default Home;
