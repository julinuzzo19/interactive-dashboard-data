import { useReducer } from "react";
import { appReducer } from "./store";
import { InitialState, initialState } from "./initialData";
import { AppContext } from "./Context";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // @ts-ignore
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state: state as InitialState, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
