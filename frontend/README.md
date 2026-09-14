# GrantBridge AI

GrantBridge AI is a full-stack application designed to help small and midsize nonprofit organizations evaluate grant opportunities before deciding whether to apply. The application provides tools for managing organization profiles, exploring grant opportunities, analyzing grant fit, and maintaining a shortlist of relevant grants.

---

## Purpose

GrantBridge AI empowers nonprofits by:
- Simplifying the process of finding and evaluating grant opportunities.
- Providing a structured way to analyze grant fit based on organizational profiles.
- Offering tools to save and manage grant opportunities for future reference.

---

## Core Features

1. **Organization Profile**:
   - Manage organization details such as name, mission, programs, geography, population served, annual budget, and funding interests.

2. **Grant Opportunities**:
   - View a list of available grants with details such as title, funder, and location.
   - Search and filter grants to find the most relevant opportunities.

3. **Grant Fit Analysis**:
   - Compare a selected grant with the saved organization profile.
   - Display a fit score (0–100), eligibility result, recommendation (Pursue/Review/Pass), strengths, gaps, potential disqualifiers, and supporting evidence.

4. **Shortlist**:
   - Save grants for future reference and update their status.

5. **Feedback Controls**:
   - Mark grants as relevant or not relevant.

---

## Technology Stack

### Frontend
- **Framework**: React (with Vite for development)
- **Styling**: CSS
- **State Management**: React hooks and localStorage for persistence

### Backend
- **Framework**: Node.js with Express
- **API**: RESTful endpoints for fetching grant data
- **Data**: Mock data stored in-memory for classroom purposes

---

## Project Structure
