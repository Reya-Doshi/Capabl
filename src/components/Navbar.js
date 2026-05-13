import { Link } from "react-router-dom";

export default function Navbar() {
  return (

    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">

      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-full border-[3px] border-black flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
          </div>

          <span className="text-xl font-bold tracking-tight">
            Capabl
          </span>

        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">

          <Link to="/">Home</Link>

          <Link to="/features">Features</Link>

          <Link to="/howitworks">
            How It Works
          </Link>

          <Link to="/students">
            Students
          </Link>

          <Link to="/about">
            About
          </Link>

        </nav>

        <div className="flex items-center gap-4">

          <Link to="/login">
            Login
          </Link>

          <Link
            to="/signup"
            className="bg-black text-white px-5 py-2 rounded-full font-semibold"
          >
            Get Started
          </Link>

        </div>
      </div>
    </header>
  );
}