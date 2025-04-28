import { IndicatorValue } from "@/interfaces/Indicador";
import { hasDigits } from "./hasDigits";
import { IRegion } from "@/interfaces/Countries";

export const filterDataApi = (data: IndicatorValue[], regions: IRegion[]) => {
  return data.filter(
    (item) =>
      !regions.some((elem) => elem.name == item.country?.value) &&
      //
      // ids de union europea o ocde
      !["EU", "OE", ""].includes(item.country.id) &&
      // id que empieza con x o incluye xk no son paises realmente
      (!item?.country?.id.startsWith("X") ||
        (item?.country?.id.startsWith("X") &&
          ["XK"].includes(item.country.id))) &&
      // paises con numeros en los codigos no sos paises
      !item?.country?.id.startsWith("1") &&
      item?.country?.value &&
      !hasDigits(item?.country?.id) &&
      // codigos que empiezan con z pero no pertenecen a paises
      ((item.country.id.startsWith("Z") &&
        ["ZA", "ZM", "ZW"].includes(item.country.id)) ||
        !item.country.id.startsWith("Z"))
  );
};
