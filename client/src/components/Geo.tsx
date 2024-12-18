import "react-tooltip/dist/react-tooltip.css";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { GeoCountryColor } from "../interfaces/Geo";
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { IndicatorValue } from "../interfaces/Indicador";
import { Tooltip } from "react-tooltip";
import { formatPrecio } from "../utils/formatPrecio";

// import { MemoizedGeographies } from "./Geo2";

const Geo = ({
  generateColorByValue,
  dataIndicator,
}: // tooltipContent,
// setTooltipContent,
{
  generateColorByValue: (value: number) => string | undefined;
  dataIndicator: IndicatorValue[];
  // tooltipContent: Partial<GeoCountryColor>;
  // setTooltipContent: Dispatch<SetStateAction<Partial<GeoCountryColor>>>;
}) => {
  const [tooltipContent, setTooltipContent] = useState<
    Partial<GeoCountryColor>
  >({});

  // const [colorData, setColorData] = useState<any>(null);
  // let colorData;

  // useEffect(() => {
  //   console.log({ max, min });
  //   if (max && min) {
  //     // colorData = chroma.scale(["#ADD8E6", "#FF0000"]).domain([min, max]);
  //     // setColorData(chroma.scale(["#ADD8E6", "#FF0000"]).domain([min, max]));
  //     console.log({ colorData });
  //   }
  // }, [max, min]);

  const handleMouseEnter = useCallback((geo) => {
    setTooltipContent(geo);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipContent({});
  }, []);

  return (
    <>
      <ComposableMap data-tip="">
        <Geographies geography="../../public/features.json">
          {({ geographies }: { geographies: GeoCountryColor[] }) => {
            return geographies.map((geo) => {
              const valueCountry = dataIndicator.find(
                (item) => item.countryiso3code === geo.id
              );
              geo.value = valueCountry?.value || 0;

              const colorCountry = generateColorByValue(geo.value);

              return (
                <Geography
                  key={geo.id}
                  geography={geo}
                  // fill={"grey"}
                  fill={colorCountry}
                  style={{
                    default: { outline: "none" },
                    // hover: { fill: "#F53", outline: "none" },
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
    </>
  );
};

export default Geo;
