import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import AppProvider from "./store/AppProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
