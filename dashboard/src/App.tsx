import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Bounce, ToastContainer } from "react-toastify";

import Home from "./components/Home";

function App() {
  return (
    <BrowserRouter>
      {/* <Header /> */}
      <main>
        <ToastContainer
          position="top-right"
          theme="light"
          transition={Bounce}
        />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;
