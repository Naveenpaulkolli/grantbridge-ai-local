import { useEffect, useState } from "react";
import "./App.css";

const emptyProfile = {
  organizationName: "",
  mission: "",
  programs: "",
  geography: "",
  populationServed: "",
  annualBudget: "",
  fundingInterests: "",
};

function App() {
  const [page, setPage] = useState("grants");
  const [grants, setGrants] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(emptyProfile);

  const [selectedGrantId, setSelectedGrantId] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [shortlist, setShortlist] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/grants")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load grants.");
        }
        return response.json();
      })
      .then((data) => setGrants(data))
      .catch(() =>
        setError(
          "Unable to load grants. Make sure the backend is running on port 5001."
        )
      );

    const savedProfile =
      localStorage.getItem("grantbridgeProfile") ||
      localStorage.getItem("organizationProfile") ||
      localStorage.getItem("profile");

    if (savedProfile) {
      try {
        setProfile({ ...emptyProfile, ...JSON.parse(savedProfile) });
      } catch {
        console.log("Could not read saved profile.");
      }
    }

    const savedShortlist = localStorage.getItem("grantbridgeShortlist");
    if (savedShortlist) {
      setShortlist(JSON.parse(savedShortlist));
    }

    const savedFeedback = localStorage.getItem("grantbridgeFeedback");
    if (savedFeedback) {
      setFeedback(JSON.parse(savedFeedback));
    }
  }, []);

  const saveProfile = (event) => {
    event.preventDefault();

    if (
      !profile.organizationName ||
      !profile.mission ||
      !profile.geography
    ) {
      alert("Please complete Organization Name, Mission, and Geography.");
      return;
    }

    localStorage.setItem("grantbridgeProfile", JSON.stringify(profile));
    localStorage.setItem("organizationProfile", JSON.stringify(profile));

    alert("Profile saved successfully!");
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const runAnalysis = () => {
    const grant = grants.find(
      (item) => String(item.id) === String(selectedGrantId)
    );

    if (!grant) {
      alert("Please select a grant.");
      return;
    }

    if (!profile.organizationName) {
      alert("Please complete the Organization Profile first.");
      setPage("profile");
      return;
    }

    let score = 50;
    const strengths = [];
    const gaps = [];
    const disqualifiers = [];
    const evidence = [];

    const profileText = `
      ${profile.mission}
      ${profile.programs}
      ${profile.fundingInterests}
    `.toLowerCase();

    const grantText = `
      ${grant.title}
      ${grant.funder}
      ${grant.location}
    `.toLowerCase();

    if (grant.location.toLowerCase() === "national") {
      score += 15;
      strengths.push("The grant is available nationally.");
      evidence.push(
        `The grant geography is listed as ${grant.location}.`
      );
    } else if (
      profile.geography
        .toLowerCase()
        .includes(grant.location.toLowerCase()) ||
      grant.location
        .toLowerCase()
        .includes(profile.geography.toLowerCase())
    ) {
      score += 20;
      strengths.push("The organization matches the grant geography.");
      evidence.push(
        `Organization geography (${profile.geography}) aligns with the grant location (${grant.location}).`
      );
    } else {
      score -= 35;
      disqualifiers.push(
        `Possible geographic mismatch: organization is in ${profile.geography}, while the grant is listed for ${grant.location}.`
      );
    }

    const keywords = [
      "youth",
      "stem",
      "education",
      "health",
      "technology",
      "workforce",
      "mentorship",
      "community",
    ];

    let matches = 0;

    keywords.forEach((keyword) => {
      if (
        profileText.includes(keyword) &&
        grantText.includes(keyword)
      ) {
        matches += 1;
        strengths.push(
          `Program alignment found for "${keyword}".`
        );
      }
    });

    score += matches * 10;

    if (matches === 0) {
      score -= 15;
      gaps.push(
        "Limited direct alignment was found between the organization profile and the grant title."
      );
    }

    score = Math.max(0, Math.min(100, score));

    let recommendation = "Review";
    let eligibility = "Potentially Eligible";

    if (disqualifiers.length > 0 && score < 50) {
      recommendation = "Pass";
      eligibility = "Potentially Ineligible";
    } else if (score >= 70) {
      recommendation = "Pursue";
      eligibility = "Eligible / Strong Match";
    }

    setAnalysis({
      grant,
      score,
      recommendation,
      eligibility,
      strengths,
      gaps,
      disqualifiers,
      evidence,
    });
  };

  const saveToShortlist = () => {
    if (!analysis) return;

    const alreadyExists = shortlist.some(
      (item) => item.id === analysis.grant.id
    );

    if (alreadyExists) {
      alert("This grant is already in the shortlist.");
      return;
    }

    const updated = [
      ...shortlist,
      {
        ...analysis.grant,
        fitScore: analysis.score,
        status: "Reviewing",
      },
    ];

    setShortlist(updated);
    localStorage.setItem(
      "grantbridgeShortlist",
      JSON.stringify(updated)
    );

    alert("Grant saved to shortlist!");
  };

  const changeStatus = (id, status) => {
    const updated = shortlist.map((item) =>
      item.id === id ? { ...item, status } : item
    );

    setShortlist(updated);
    localStorage.setItem(
      "grantbridgeShortlist",
      JSON.stringify(updated)
    );
  };

  const recordFeedback = (value) => {
    if (!analysis) return;

    const newEntry = {
      id: Date.now(),
      grant: analysis.grant.title,
      response: value,
    };

    const updated = [...feedback, newEntry];

    setFeedback(updated);
    localStorage.setItem(
      "grantbridgeFeedback",
      JSON.stringify(updated)
    );

    alert(`Feedback recorded: ${value}`);
  };

  const filteredGrants = grants.filter((grant) =>
    `${grant.title} ${grant.funder}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header>
        <h1>GrantBridge AI</h1>
        <p>AI-Powered Grant Matching & Eligibility Analysis</p>
      </header>

      <nav>
        <button onClick={() => setPage("grants")}>
          Grant Opportunities
        </button>

        <button onClick={() => setPage("profile")}>
          Organization Profile
        </button>

        <button onClick={() => setPage("analysis")}>
          Grant Fit Analysis
        </button>

        <button onClick={() => setPage("shortlist")}>
          Shortlist ({shortlist.length})
        </button>

        <button onClick={() => setPage("feedback")}>
          Feedback
        </button>
      </nav>

      <main>
        {page === "grants" && (
          <>
            <h2>Grant Opportunities</h2>

            {error && <p className="error">{error}</p>}

            <input
              className="search"
              type="text"
              placeholder="Search grants by title or funder..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className="grant-grid">
              {filteredGrants.map((grant) => (
                <div className="card" key={grant.id}>
                  <h3>{grant.title}</h3>
                  <p>
                    <strong>Funder:</strong> {grant.funder}
                  </p>
                  <p>
                    <strong>Location:</strong> {grant.location}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {page === "profile" && (
          <section className="profile-section">
            <h2>Organization Profile</h2>

            <form onSubmit={saveProfile}>
              <label>Organization Name *</label>
              <input
                name="organizationName"
                value={profile.organizationName}
                onChange={handleProfileChange}
              />

              <label>Mission *</label>
              <textarea
                name="mission"
                value={profile.mission}
                onChange={handleProfileChange}
              />

              <label>Programs</label>
              <textarea
                name="programs"
                value={profile.programs}
                onChange={handleProfileChange}
              />

              <label>Geography *</label>
              <input
                name="geography"
                value={profile.geography}
                onChange={handleProfileChange}
              />

              <label>Population Served</label>
              <input
                name="populationServed"
                value={profile.populationServed}
                onChange={handleProfileChange}
              />

              <label>Annual Budget</label>
              <input
                name="annualBudget"
                type="text"
                placeholder="$500,000-$1,000,000"
                value={profile.annualBudget}
                onChange={handleProfileChange}
              />

              <label>Funding Interests</label>
              <textarea
                name="fundingInterests"
                value={profile.fundingInterests}
                onChange={handleProfileChange}
              />

              <button className="primary" type="submit">
                Save Profile
              </button>
            </form>
          </section>
        )}

        {page === "analysis" && (
          <section className="analysis-section">
            <h2>Grant Fit Analysis</h2>

            <label>Select a Grant</label>

            <select
              value={selectedGrantId}
              onChange={(event) => {
                setSelectedGrantId(event.target.value);
                setAnalysis(null);
              }}
            >
              <option value="">-- Select a Grant --</option>

              {grants.map((grant) => (
                <option key={grant.id} value={grant.id}>
                  {grant.title}
                </option>
              ))}
            </select>

            <button
              className="primary"
              onClick={runAnalysis}
              disabled={!selectedGrantId}
            >
              Analyze Fit
            </button>

            {analysis && (
              <div className="analysis-result">
                <h3>{analysis.grant.title}</h3>

                <div className="score">
                  {analysis.score}/100
                </div>

                <h3>{analysis.eligibility}</h3>

                <p>
                  <strong>Recommendation:</strong>{" "}
                  {analysis.recommendation}
                </p>

                <h4>Strengths</h4>
                <ul>
                  {analysis.strengths.length ? (
                    analysis.strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>No strong alignment identified.</li>
                  )}
                </ul>

                <h4>Gaps</h4>
                <ul>
                  {analysis.gaps.length ? (
                    analysis.gaps.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>No major gaps identified.</li>
                  )}
                </ul>

                <h4>Potential Disqualifiers</h4>
                <ul>
                  {analysis.disqualifiers.length ? (
                    analysis.disqualifiers.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>No major disqualifiers identified.</li>
                  )}
                </ul>

                <h4>Supporting Evidence</h4>
                <ul>
                  {analysis.evidence.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <div className="actions">
                  <button
                    className="primary"
                    onClick={saveToShortlist}
                  >
                    Save to Shortlist
                  </button>

                  <button
                    onClick={() => recordFeedback("Relevant")}
                  >
                    Relevant
                  </button>

                  <button
                    onClick={() =>
                      recordFeedback("Not Relevant")
                    }
                  >
                    Not Relevant
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {page === "shortlist" && (
          <section>
            <h2>Shortlist</h2>

            {shortlist.length === 0 ? (
              <p>No grants have been saved yet.</p>
            ) : (
              <div className="grant-grid">
                {shortlist.map((grant) => (
                  <div className="card" key={grant.id}>
                    <h3>{grant.title}</h3>

                    <p>
                      <strong>Fit Score:</strong>{" "}
                      {grant.fitScore}/100
                    </p>

                    <p>
                      <strong>Funder:</strong> {grant.funder}
                    </p>

                    <label>Status</label>

                    <select
                      value={grant.status}
                      onChange={(event) =>
                        changeStatus(
                          grant.id,
                          event.target.value
                        )
                      }
                    >
                      <option>Reviewing</option>
                      <option>Interested</option>
                      <option>Applying</option>
                      <option>Not Pursuing</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "feedback" && (
          <section>
            <h2>Feedback Log</h2>

            {feedback.length === 0 ? (
              <p>No feedback recorded yet.</p>
            ) : (
              feedback.map((item) => (
                <div className="card" key={item.id}>
                  <strong>{item.grant}</strong>
                  <p>{item.response}</p>
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;