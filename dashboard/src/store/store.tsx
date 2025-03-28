import { InitialState } from "./initialData";

export const appReducer = (
  state: InitialState,
  action: { type: string; payload: unknown }
) => {
  switch (action.type) {
    case "setTooltipData": {
      return {
        ...state,
        tooltipData: action.payload,
      };
    }
    case "setHasYearFunction": {
      return {
        ...state,
        hasYearFunction: action.payload,
      };
    }

    default:
      return state;
  }
};
