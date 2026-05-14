import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Students from "./pages/Students";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./student/Dashboard";
import Analyzer from "./student/Analyzer";
import RoadMap from "./student/RoadMap";
import SkillGap from "./student/SkillGap";
import Resume from "./student/Resume";
import Interview from "./student/Interview";
import Projects from "./student/Projects";
import Recommendations from "./student/Recommendations";
import Profile from "./student/Profile";
import Settings from "./student/Settings";
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
        <Route path="/dashboard" element={<Dashboard />} />
<Route path="/analyzer" element={<Analyzer />} />
<Route path="/road-map" element={<RoadMap />} />
<Route path="/skill-gap" element={<SkillGap />} />
<Route path="/resume" element={<Resume />} />
<Route path="/interview" element={<Interview />} />
<Route path="/projects" element={<Projects />} />
<Route path="/recommendations" element={<Recommendations />} />
<Route path="/profile" element={<Profile />} />
<Route path="/settings" element={<Settings />} />

      </Routes>

    </BrowserRouter>
  );
}