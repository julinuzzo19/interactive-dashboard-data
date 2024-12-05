import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import Select from "react-select";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { GeoCountry } from "../interfaces/Geo";

const Home = () => {
  const { indicadores } = useFetch();
  const [tooltipContent, setTooltipContent] = useState<Partial<GeoCountry>>({});

  useEffect(() => {
    console.log({ indicadores });
  }, [indicadores]);
  useEffect(() => {
    console.log({ tooltipContent });
  }, [tooltipContent]);

  return (
    <div className="flex flex-col justify-center items-center mt-10 w-full">
      <h2>Indicadores</h2>

      <div className="w-full flex flex-col justify-center items-center mt-10">
        <Select
          className="w-8/12"
          options={indicadores.map((indicador) => ({
            value: indicador.id,
            label: indicador.name,
          }))}
          maxMenuHeight={200}
          placeholder="Selecciona un indicador"
        />
      </div>

      <div className="w-8/12">
        <ComposableMap data-tip="">
          <Geographies geography="../../public/features.json">
            {({ geographies }: { geographies: GeoCountry[] }) => {
              return geographies.map((geo) => {
                // console.log({ geo });

                const countryName = geo.properties.name;
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
                    // data-tip={`País: ${countryName}`}
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
