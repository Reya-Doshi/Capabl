import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Students from "./pages/Students";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/features"
          element={<Features />}
        />

        <Route
          path="/howitworks"
          element={<HowItWorks />}
        />

        <Route
          path="/students"
          element={<Students />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

      </Routes>

    </BrowserRouter>
  );
}