import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import Select, { SingleValue } from "react-select";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { GeoCountry } from "../interfaces/Geo";

const Home = () => {
  const { indicators, getDataIndicator, dataIndicator } = useFetch();
  const [tooltipContent, setTooltipContent] = useState<Partial<GeoCountry>>({});
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentIndicator, setCurrentIndicator] = useState<
    SingleValue<{
      label: string;
      value: string;
    }>
  >({
    label: "",
    value: "",
  });

  useEffect(() => {
    console.log({ indicators });
  }, [indicators]);
  useEffect(() => {
    // console.log({ tooltipContent });
  }, [tooltipContent]);

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
    console.log({ dataIndicator });
  }, [dataIndicator]);

  return (
    <div className="flex flex-col justify-center items-center mt-10 w-full">
      <h2>Indicadores</h2>

      <div className="w-full flex flex-col justify-center items-center mt-10 mb-10">
        <Select
          className="w-8/12"
          options={indicators.map((indicador) => ({
            value: indicador.id,
            label: indicador.name,
          }))}
          maxMenuHeight={200}
          placeholder="Selecciona un indicador"
          onChange={(data) => setCurrentIndicator(data)}
        />
      </div>

      {currentIndicator?.value && (
        <div className="text-center">
          <h2>Indicador</h2>
          <h5 className="font-bold">{currentIndicator.label}</h5>
          <span>({currentIndicator.value})</span>
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
        <ComposableMap data-tip="">
          <Geographies geography="../../public/features.json">
            {({ geographies }: { geographies: GeoCountry[] }) => {
              return geographies.map((geo) => {
                // console.log({ geo });
                return (
                  <Geography
                    key={geo.id}
                    geography={geo}
                    fill="grey"
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#F53", outline: "none" },
                      pressed: { fill: "#E42", outline: "none" },
                    }}
                    data-tooltip-id={"my-tooltip"}
                    onMouseEnter={() => {
                      setTooltipContent(geo);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent({});
                    }}
                  />
                );
              });
            }}
          </Geographies>
        </ComposableMap>
        <Tooltip id="my-tooltip" className="text-center">
          <div>
            <h3>{tooltipContent.properties?.name}</h3>
            <p className="text-sm italic">
              {tooltipContent.properties?.continent}
            </p>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default Home;
