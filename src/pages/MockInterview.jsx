import React, { useState, useRef } from "react";
import { Bot, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MockInterview.css";

const difficulties = ["Easy", "Medium", "Hard"];
const jobRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "AI / ML Engineer",
  "DevOps Engineer",
  "Cyber Security Analyst",
  "Software Developer",
];
const MockInterview = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [difficulty, setDifficulty] = useState("");
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [readInstructions, setReadInstructions] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef(null);
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  };
  const generateQuestion = async () => {
    setError("");
    setFeedback("");
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setAnswer("");
    if (!role || !difficulty) {
      showError("Please select all interview parameters.");
      return;
    }
    setLoading(true);
    const prompt = `
You are an AI interviewer.
Generate EXACTLY 5 interview questions.
Rules:
- Questions 1, 2, 3 → Technical (role-based)
- Questions 4, 5 → HR based
- Difficulty: ${difficulty}
- Role: ${role}
Return in EXACT format:
Question 1: ...
Question 2: ...
Question 3: ...
Question 4: ...
Question 5: ...
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
      const output = data?.choices?.[0]?.message?.content || "";
      const parsed = output
        .split("\n")
        .filter((q) => q.startsWith("Question"))
        .map((q) => q.replace(/Question \d+:\s*/, "").trim());
      if (parsed.length !== 5) {
        showError("failed to generate questions.");
        setLoading(false);
        return;
      }
      setQuestions(parsed);
      setAnswers(new Array(5).fill(""));
      setQuestion(parsed[0]);
      setStep(3);
    } catch {
      showError("Failed to connect.");
    }
    setLoading(false);
  };
  const handleAnswerChange = (e) => {
    const updated = [...answers];
    updated[currentIndex] = e.target.value;
    setAnswers(updated);
    setAnswer(e.target.value);
  };
  const goNext = () => {
    if (!answer.trim()) {
      showError("Please answer or use Skip.");
      return;
    }
    if (currentIndex === questions.length - 1) {
      setFeedback("");
      setStep(4);
    } else {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setQuestion(questions[next]);
      setAnswer(answers[next] || "");
    }
  };
  const goSkip = () => {
    const updated = [...answers];
    updated[currentIndex] = "(Skipped)";
    setAnswers(updated);
    if (currentIndex === questions.length - 1) {
      setFeedback("");
      setStep(4);
    } else {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setQuestion(questions[next]);
      setAnswer(answers[next] || "");
    }
  };
  const goPrevious = () => {
    if (currentIndex === 0) return;
    const prev = currentIndex - 1;
    setCurrentIndex(prev);
    setQuestion(questions[prev]);
    setAnswer(answers[prev] || "");
  };
  const goBackToLastQuestion = () => {
    setFeedback("");
    setCopied(false);
    setLoading(false);
    setStep(3);
    const last = questions.length - 1;
    setCurrentIndex(last);
    setQuestion(questions[last]);
    setAnswer(answers[last] || "");
    setShowResult(false);
  };
  const evaluateAnswer = async () => {
    setLoading(true);
    setError("");
    const skipped = answers.filter((a) => !a || a === "(Skipped)").length;
    const combined = questions
      .map((q, i) => `Q${i + 1}: ${q}\nA: ${answers[i] || "(Skipped)"}`)
      .join("\n\n");
    const prompt = `
Evaluate candidate answers.
Rules:
- Total = 5
- Skipped = -2 each
- Base score = 10
Return STRICT format:
Score: X/10
Strengths:
- point
Weaknesses:
- point
Suggestions:
- advice
Responses:
${combined}
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
      let output = data?.choices?.[0]?.message?.content || "";
      const match = output.match(/Score:\s*(\d+)/);
      const aiScore = match ? parseInt(match[1]) : 10;
      const finalScore = Math.max(0, aiScore - skipped * 2);
      output = output.replace(/Score:\s*\d+/, `Score: ${finalScore}`);
      setFeedback(output);
      setTimeout(() => {
        setShowResult(true);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }, 200);
    } catch {
      setError("Evaluation failed.");
    }
    setLoading(false);
  };
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (step === 1) {
    return (
      <div className="page-container">
      <button className="home-btn" onClick={() => navigate("/")}>
        Home
      </button>
        <h1 className="title">Mock Interview Setup</h1>
        <div className="mock-upload-box">
          <div className="select-row">
            <div className="select-group">
              <label>Job Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select</option>
                {jobRoles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="select-group">
              <label>Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">Select</option>
                {difficulties.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="btn full"
            onClick={() =>
              role && difficulty ? setStep(2) : showError("Select all fields")
            }
          >
            Next
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="page-container">
        <h1 className="title">Instructions</h1>
        <div className="upload-box">
          <ul className="instructions">
            <li>There are exactly <b>5 questions</b> in this interview.</li>
            <li>Questions 1, 2, 3 are <b>technical</b> based on your selected role.</li>
            <li>Questions 4 and 5 are <b>HR / Behavioural</b> based.</li>
            <li>You must either <b>Answer</b> or <b>Skip</b> each question.</li>
            <li>If you click <b>Next</b> without typing, an error message will appear.</li>
            <li>Each skipped question will reduce your final score by <b>2 marks</b>.</li>
            <li>You can go <b>back and edit</b> any answer before finishing interview.</li>
            <li>After the last question, a <b>Review Page</b> will open.</li>
            <li>Answered questions will show ✅, skipped questions will show ⬜.</li>
          </ul>
          <div className="instruction-check">
            <input
              type="checkbox"
              id="read"
              checked={readInstructions}
              onChange={(e) => setReadInstructions(e.target.checked)}
            />
            <label htmlFor="read">
              I have read and understood all instructions.
            </label>
          </div>
          <div className="btn-row">
            <button
              className="btn secondary"
              onClick={() => {
                setReadInstructions(false);
                setStep(1);
              }}
            >
              Back
            </button>
            <button
              className="btn primary"
              onClick={generateQuestion}
              disabled={!readInstructions}
            >
              {loading ? "Loading..." : "Start Interview"}
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="page-container">
        <h1 className="title">Mock Interview</h1>
        <div className="interview-box">
          <div className="chat-bubble bot question-box">
            <div className="question-count">
              {currentIndex + 1} / {questions.length}
            </div>
            <Bot size={18} />
            <span>{question}</span>
          </div>
          <textarea
            className="input"
            rows={5}
            placeholder="Type your answer..."
            value={answer}
            onChange={handleAnswerChange}
          />
          <div className="btn-row">
            {currentIndex > 0 && (
              <button className="btn secondary" onClick={goPrevious}>
                Previous
              </button>
            )}
            <button className="btn warn" onClick={goSkip}>
              Skip
            </button>
            <button className="btn primary" onClick={goNext}>
              {currentIndex === questions.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="page-container">
      <h1 className="title">Review Answers</h1>
      <div className="upload-box">
        {questions.map((q, i) => (
          <div key={i} className="review-item">
            <input
              type="checkbox"
              checked={answers[i] && answers[i] !== "(Skipped)"}
              readOnly
            />
            <span>{q}</span>
          </div>
        ))}
        <div className="btn-row">
          <button className="btn secondary" onClick={goBackToLastQuestion}>
            Back to Interview
          </button>
          <button
            className="btn primary full"
            onClick={evaluateAnswer}
            disabled={loading}
          >
            {loading ? "Evaluating..." : "Show Result"}
          </button>
        </div>
        {copied && <p className="copied-text">Copied!</p>}
      </div>
      {feedback && (
        <div
          ref={resultRef}
          className={`result-panel ${showResult ? "show" : ""}`}
        >
          <h2 className="result-heading">Final Result</h2>
          <div
            className="result-content"
            dangerouslySetInnerHTML={{
              __html: feedback
                .replace(/Score:/g, '<span class="highlight score">Score:</span>')
                .replace(/Strengths:/g, '<span class="highlight">Strengths:</span>')
                .replace(/Weaknesses:/g, '<span class="highlight">Weaknesses:</span>')
                .replace(/Suggestions:/g, '<span class="highlight">Suggestions:</span>')
                .replace(/\n/g, "<br/>"),
            }}
          />
        </div>
      )}
    </div>
  );
};
export default MockInterview;