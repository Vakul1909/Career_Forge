import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JobFinder.css";

export default function JobFinder() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [remote, setRemote] = useState("");
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
  const handleSearch = async () => {
    if (
      query.trim() === "" ||
      location.trim() === "" ||
      experience === "" ||
      remote === ""
    ) {
      setError("Please fill all fields before searching.");
      setTimeout(() => {
        setError("");
      }, 3000);
      return;
    }
    setError("");
    setShowResults(true);
    setLoading(true);
    try {
      const url = `https://jsearch.p.rapidapi.com/search?query=${query}+in+${location}&page=1&num_pages=1`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
      });
      const json = await res.json();
      let data = json.data || [];
      if (experience !== "any") {
        data = data.filter((job) =>
          (job.job_required_experience?.experience_level || "")
            .toLowerCase()
            .includes(experience)
        );
      }
      if (remote !== "any") {
        data = data.filter((job) =>
          remote === "remote"
            ? job.job_is_remote === true
            : job.job_is_remote === false
        );
      }
      setJobs(data);
    } catch (err) {
      setError("Failed to fetch jobs. Try again.");
      setTimeout(() => {
        setError("");
      }, 2000);
    }
    setLoading(false);
  };
  return (
    <div className="jf-root">
      {!showResults && (
        <div className="home-btn-wrapper">
          <button className="home-btn" onClick={() => navigate("/")}>
             Home
          </button>
        </div>
      )}
      {!showResults && (
        <>
          <h2 className="jf-heading">Job Finder</h2>
          <div className="jf-main-box">
            <div className="jf-grid-box">
              <div className="jf-field full-width">
                <input
                  className="jf-input jf-blue-box"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Job Title"
                />
              </div>
              <div className="jf-field full-width">
                <input
                  className="jf-input jf-blue-box"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                />
              </div>
              <div className="jf-field">
                <div className="jf-label">Experience</div>
                <select
                  className="jf-input"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="internship">Internship</option>
                  <option value="entry level">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div className="jf-field">
                <div className="jf-label">Mode</div>
                <select
                  className="jf-input"
                  value={remote}
                  onChange={(e) => setRemote(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="any">Any</option>
                </select>
              </div>
            </div>
            {error && <p className="jf-error">{error}</p>}
            <button className="jf-btn" onClick={handleSearch}>
              Search Jobs
            </button>
          </div>
        </>
      )}
      {showResults && (
        <div className="jf-results-root">
          <h2 className="jf-heading">Job Results</h2>
          {loading ? (
            <p className="jf-loading">Loading...</p>
          ) : jobs.length === 0 ? (
            <>
              <div className="jf-nojobs-center">
                <p className="jf-nojobs">No jobs found. Select other fields.</p>
              </div>
              <button
                className="jf-btn jf-back-bottom"
                onClick={() => setShowResults(false)}
              >
                Back
              </button>
            </>
          ) : (
            <>
              <div className="jf-list">
                {jobs.map((job, i) => (
                  <div className="jf-card" key={i}>
                    <h3>{job.job_title}</h3>
                    <p className="jf-company">{job.employer_name}</p>
                    <p>{job.job_city}, {job.job_country}</p>
                    <p>{job.job_employment_type}</p>
                    <a
                      href={job.job_apply_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <button className="jf-apply-btn">Apply Now</button>
                    </a>
                  </div>
                ))}
              </div>
              <button
                className="jf-btn jf-back-bottom"
                onClick={() => setShowResults(false)}
              >
                Back
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}