import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { GeoCountryColor } from "../interfaces/Geo";
import { useCallback, useContext, useEffect } from "react";
import { IndicatorValue } from "../interfaces/Indicador";

import { AppContext } from "@/store/Context";
import TooltipCountry from "./TooltipCountry";

// import { MemoizedGeographies } from "./Geo2";

const Geo = ({
  generateColorByValue,
  dataIndicator,
}: {
  generateColorByValue: (value: number) => string | undefined;
  dataIndicator: IndicatorValue[];
}) => {
  const { dispatch } = useContext(AppContext);

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
    <>
      <ComposableMap>
        <Geographies geography="../../public/features.json">
          {({ geographies }: { geographies: GeoCountryColor[] }) => {
            return geographies.map((geo) => {
              const valueCountry = dataIndicator?.find(
                (item) => item.countryiso3code === geo.id
              );

              geo.value = valueCountry?.value;

              geo.date = valueCountry?.date;

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
                />
              );
            });
          }}
        </Geographies>
      </ComposableMap>
      <TooltipCountry />
    </>
  );
};

export default Geo;
