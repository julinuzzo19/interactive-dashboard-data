import "react-tooltip/dist/react-tooltip.css";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { GeoCountryColor } from "../interfaces/Geo";
import { useCallback, useEffect, useState } from "react";
import { IndicatorValue } from "../interfaces/Indicador";
import { Tooltip } from "react-tooltip";
import { formatPrecio } from "../utils/formatPrecio";

// import { MemoizedGeographies } from "./Geo2";

const Geo = ({
  generateColorByValue,
  dataIndicator,
  hasYearFunction,
}: {
  generateColorByValue: (value: number) => string | undefined;
  dataIndicator: IndicatorValue[];
  hasYearFunction?: boolean;
}) => {
  const [tooltipContent, setTooltipContent] = useState<
    Partial<GeoCountryColor>
  >({});

  useEffect(() => {
    console.log({ tooltipContent });
  }, [tooltipContent]);

  const handleMouseEnter = useCallback((geo) => {
    setTooltipContent(geo);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipContent({});
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

              geo.value = valueCountry?.value || 0;

              geo.date = valueCountry?.date;

              const colorCountry = generateColorByValue(geo.value);

              return (
                <Geography
                  key={geo.id}
                  geography={geo}
                  // fill={"grey"}
                  fill={colorCountry}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "grey", outline: "none" },
                    // pressed: { fill: "#E42", outline: "none" },
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
      <Tooltip id="my-tooltip" className="text-center" float={true}>
        {tooltipContent?.id && (
          <div>
            <h3>{tooltipContent.properties?.name}</h3>
            <p className="text-sm italic">
              {tooltipContent.properties?.continent}
            </p>
            <b>
              {formatPrecio(tooltipContent.value)}{" "}
              {hasYearFunction &&
                tooltipContent.date &&
                `(${tooltipContent.date})`}
            </b>
            {tooltipContent?.tecnicaUtilizada && (
              <p className="italic font-bold capitalize">
                ({tooltipContent.tecnicaUtilizada})
              </p>
            )}
          </div>
        )}
      </Tooltip>
    </>
  );
};

export default Geo;
