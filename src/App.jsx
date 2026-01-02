import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import MockInterview from "./pages/MockInterview";
import JobFinder from "./pages/JobFinder";
import Roadmap from "./pages/Roadmap";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/job-finder" element={<JobFinder />} />
        <Route path="/roadmap" element={<Roadmap />} />
      </Routes>
    </Router>
  );
};
export default App;