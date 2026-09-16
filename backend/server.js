const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const grants = [
  { id: 1, title: "Youth STEM Education Grant", funder: "Future Learning Foundation", location: "National" },
  { id: 2, title: "Community Health Initiative", funder: "Healthy Communities Fund", location: "National" },
  { id: 3, title: "Workforce Development Grant", funder: "Career Futures Foundation", location: "Midwest" },
  { id: 4, title: "Nonprofit Technology Grant", funder: "Digital Impact Foundation", location: "National" },
  { id: 5, title: "Youth Mentorship Grant", funder: "Community Growth Fund", location: "National" },
  { id: 6, title: "Education Access Grant", funder: "Opportunity Foundation", location: "National" }
];

// API route
app.get("/api/grants", (req, res) => {
  res.json(grants);
});

// Serve React production build
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

// Send index.html for frontend routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});