import React from "react";
import { Hammer } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="bg-zinc-900 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[96px]" style={{ padding: "0px 30px" }}>
        <div className="flex items-center gap-1">
          <Hammer className="text-indigo-500" size={60} />
          <span className="text-3xl font-bold text-white tracking-wide ml-2">
            CareerForge
          </span>
        </div>
        <div className="hidden md:flex gap-10 text-gray-300">
          <NavLink to="/resume" className={({ isActive }) =>
            isActive ? "text-indigo-400 font-semibold" : "hover:text-white transition"
          }>
            Resume Analyzer
          </NavLink>
          <NavLink to="/mock-interview" className={({ isActive }) =>
            isActive ? "text-indigo-400 font-semibold" : "hover:text-white transition"
          }>
            Mock Interview
          </NavLink>
          <NavLink to="/job-finder" className={({ isActive }) =>
            isActive ? "text-indigo-400 font-semibold" : "hover:text-white transition"
          }>
            Job Finder
          </NavLink>
          <NavLink to="/roadmap" className={({ isActive }) =>
            isActive ? "text-indigo-400 font-semibold" : "hover:text-white transition"
          }>
            Roadmap
          </NavLink>
        </div>
      </div>
    </div>
  );
};
export default Navbar;