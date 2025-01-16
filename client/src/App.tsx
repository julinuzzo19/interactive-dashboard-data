import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./components/Home";

function App() {
  return (
    <BrowserRouter>
      {/* <Header /> */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

      {/* <Footer /> */}
    </BrowserRouter>
  );
}

export default App;
