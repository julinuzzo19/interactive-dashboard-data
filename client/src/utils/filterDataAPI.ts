import { IndicatorValue } from "@/interfaces/Indicador";
import { hasDigits } from "./hasDigits";
import { IRegion } from "@/interfaces/Countries";

export const filterDataApi = (data: IndicatorValue[], regions: IRegion[]) => {
  return data.filter(
    (item) =>
      !regions.some((elem) => elem.name == item.country.value) &&
      (!item?.country?.id.startsWith("X") ||
        (item?.country?.id.startsWith("X") &&
          ["XK"].includes(item.country.id))) &&
      !item?.country?.id.startsWith("1") &&
      item?.country?.value &&
      !hasDigits(item?.country?.id) &&
      ((item.country.id.startsWith("Z") &&
        ["ZA", "ZM", "ZW"].includes(item.country.id)) ||
        !item.country.id.startsWith("Z"))
  );
};
