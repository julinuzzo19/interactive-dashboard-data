import { AppContext } from "@/store/Context";
import { formatPrecio } from "@/utils/formatPrecio";
import { useContext, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const TooltipCountry = () => {
  const {
    state: { tooltipData, hasYearFunction },
  } = useContext(AppContext);

  // useEffect(() => {
  //   console.log({ tooltipData, hasYearFunction });
  // }, [tooltipData, hasYearFunction]);

  return (
    <Tooltip id="my-tooltip" className="text-center" float={true}>
      {tooltipData?.id && (
        <div>
          <h3>{tooltipData.properties?.name}</h3>
          <p className="text-sm italic">{tooltipData.properties?.continent}</p>
          <b>
            {formatPrecio(tooltipData.value)}{" "}
            {hasYearFunction && tooltipData.date && `(${tooltipData.date})`}
          </b>
          {tooltipData?.tecnicaUtilizada && (
            <p className="italic font-bold capitalize">
              ({tooltipData.tecnicaUtilizada})
            </p>
          )}
        </div>
      )}
    </Tooltip>
  );
};
export default TooltipCountry;
