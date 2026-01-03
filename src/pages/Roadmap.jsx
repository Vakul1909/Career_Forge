import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Roadmap.css";

const roles = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "AI / ML Engineer",
  "DevOps Engineer",
  "Cyber Security Analyst",
];
const levels = ["Beginner", "Intermediate", "Advanced"];
const durations = ["3 Months", "6 Months", "12 Months"];
export default function Roadmap() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const showError = (msg) => {
  setError(msg);
  setTimeout(() => {
    setError("");
  }, 2000);
};
  const generateRoadmap = async () => {
    if (!role || !level || !duration) {
      showError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setError("");
    const prompt = `
Generate a structured learning roadmap.
Role: ${role}
Level: ${level}
Duration: ${duration}
Rules:
- Divide roadmap into 5 to 7 phases
- Each phase must include:
  - phase
  - duration
  - skills (array)
  - tools (array)
  - outcome
Return ONLY valid JSON in this format:
{
  "roadmap": [
    {
      "phase": "",
      "duration": "",
      "skills": [],
      "tools": [],
      "outcome": ""
    }
  ]
}
`;
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + import.meta.env.VITE_OPENROUTER_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const output = data?.choices?.[0]?.message?.content;
      const parsed = JSON.parse(output);
      setRoadmap(parsed.roadmap);
      setShowResult(true);
    } catch {
      showError("Failed to generate roadmap.");
    }
    setLoading(false);
  };
  return (
    <div className="roadmap-root">
      <button className="home-btn" onClick={() => navigate("/")}>
        Home
      </button>
      {!showResult && (
        <>
          <h1 className="title">Roadmap Generator</h1>
          <div className="roadmap-box">
            <div className="roadmap-grid">
              <div className="select-card">
                <div className="select-label">Job Role</div>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">Select</option>
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="select-card">
                <div className="select-label">Current Level</div>
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="">Select</option>
                  {levels.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="select-card">
                <div className="select-label">Target Duration</div>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option value="">Select</option>
                  {durations.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="generate-btn" onClick={generateRoadmap}>
              {loading ? "Generating..." : "Generate Roadmap"}
            </button>
          </div>
        </>
      )}
      {showResult && (
        <div className="roadmap-result">
          <h2 className="roadmap-heading">
            Your Roadmap for {role}
          </h2>
          <div className="roadmap-list">
            {roadmap.map((step, i) => (
              <div className="roadmap-card" key={i}>
                <h3>
                  {i + 1}. {step.phase}
                </h3>
                <p>
                  <b>Duration:</b> {step.duration}
                </p>
                <p><b>Skills:</b></p>
                <ul>
                  {step.skills.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
                <p><b>Tools:</b> {step.tools.join(", ")}</p>
                <p className="outcome"> {step.outcome}</p>
              </div>
            ))}
          </div>
          <div className="roadmap-graph">
            <h2 className="roadmap-heading">Roadmap Flow</h2>
            <div className="timeline">
              {roadmap.map((step, index) => (
                <div className="timeline-item" key={index}>
                  <div className="timeline-dot">{index + 1}</div>
                  {index !== roadmap.length - 1 && (
                    <div className="timeline-line"></div>
                  )}
                  <div className="timeline-content">
                    <h3>{step.phase}</h3>
                    <p><b>Duration:</b> {step.duration}</p>
                    <p><b>Skills:</b> {step.skills.slice(0, 3).join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            className="back-btn"
            onClick={() => setShowResult(false)}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}