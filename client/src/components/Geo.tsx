import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { GeoCountryColor } from "../interfaces/Geo";
import { Dispatch, SetStateAction } from "react";
import { IndicatorValue } from "../interfaces/Indicador";

const Geo = ({
  generateColorByValue,
  setTooltipContent,
  dataIndicator,
}: {
  generateColorByValue: (value: number) => string | undefined;
  setTooltipContent: Dispatch<SetStateAction<Partial<GeoCountryColor>>>;
  dataIndicator: IndicatorValue[];
}) => {
  return (
    <ComposableMap data-tip="">
      <Geographies geography="../../public/features.json">
        {({ geographies }: { geographies: GeoCountryColor[] }) => {
          return geographies.map((geo) => {
            // console.log({ geo });
            const valueCountry = dataIndicator.find(
              (item) => item.countryiso3code === geo.id
            );

            const colorCountry =
              generateColorByValue(valueCountry?.value) || "grey";

            geo.value = valueCountry?.value || 0;
            // console.log({ colorCountry, valueCountry });
            return (
              <Geography
                key={geo.id}
                geography={geo}
                // fill={"grey"}
                fill={colorCountry}
                style={{
                  default: { outline: "none" },
                  // hover: { fill: "#F53", outline: "none" },
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
  );
};

export default Geo;
