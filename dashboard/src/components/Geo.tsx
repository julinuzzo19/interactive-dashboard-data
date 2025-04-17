import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { GeoCountryColor } from "../interfaces/Geo";
import { useCallback, useContext } from "react";
import { IndicatorValue } from "../interfaces/Indicador";
import { AppContext } from "@/store/Context";
import TooltipCountry from "./TooltipCountry";
import countriesJson from "../assets/countries_map.json";

const Geo = ({
  generateColorByValue,
  data,
}: {
  generateColorByValue: (value: number) => string | undefined;
  data: IndicatorValue[];
}) => {
  const { dispatch } = useContext(AppContext);

  console.log({ countriesJson });

  const handleMouseEnter = useCallback((geo) => {
    dispatch({
      type: "setTooltipData",
      payload: geo,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    dispatch({
      type: "setTooltipData",
      payload: {},
    });
  }, []);

  return (
    <div className="h-full w-full">
      <ComposableMap height={500} projectionConfig={{ scale: 180 }}>
        <Geographies geography={countriesJson}>
          {({ geographies }: { geographies: GeoCountryColor[] }) => {
            console.log({ geographies });
            return geographies.map((geo) => {
              const valueCountry = data?.find(
                (item) => item.countryiso3code === geo.id
              );

              // console.log({ data, valueCountry });

              geo.value = valueCountry?.value;

              geo.date = valueCountry?.date;

              geo.tecnicaUtilizada = valueCountry?.tecnicaUtilizada || "";

              const colorCountry = generateColorByValue(geo.value);

              return (
                <Geography
                  key={geo.id}
                  geography={geo}
                  fill={colorCountry}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "grey", outline: "none" },
                  }}
                  data-tooltip-id={"my-tooltip"}
                  onMouseEnter={() => handleMouseEnter(geo)}
                  onMouseLeave={handleMouseLeave}
                  stroke="grey"
                  strokeWidth={0.3}
                />
              );
            });
          }}
        </Geographies>
      </ComposableMap>
      <TooltipCountry />
    </div>
  );
};

export default Geo;
