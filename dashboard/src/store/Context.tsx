import { createContext, useContext } from "react";
import { InitialState } from "./initialData";

interface GlobalContextType {
  state: InitialState;
  dispatch: any;
}

export const AppContext = createContext<GlobalContextType>({
  state: { tooltipData: {}, hasYearFunction: false },
  dispatch: () => {},
});

export const useGlobalContext = () => {
  const context = useContext(AppContext);

  if (!context?.state) {
    throw new Error(
      "GlobalContext must be used within a GlobalContextProvider"
    );
  }

  return context;
};
