import { GeoCountryColor } from "@/interfaces/Geo";

export interface InitialState {
  tooltipData: Partial<GeoCountryColor>;
  hasYearFunction: boolean;
}

export const initialState: InitialState = {
  tooltipData: {},
  hasYearFunction: false,
};
