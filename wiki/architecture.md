# Architecture

## Tech Stack

- **Frontend:** React 18, Vite, Recharts
- **Backend:** Node.js (Vercel Serverless Functions)
- **Database:** PostgreSQL

## Project Structure


kpi-dashboard/
├── api/                    # Serverless API endpoints
│   ├── active-users.js
│   ├── churn-rate.js
│   ├── north-america-revenue.js
│   └── revenue-by-region.js
├── src/
│   ├── components/         # React components
│   ├── db/                 # Database utilities
│   ├── App.jsx            # Main application
│   └── index.css          # Global styles
├── scripts/               # Utility scripts
├── wiki/                  # Documentation
├── blog/                  # Technical blog posts
└── test-*.js             # API testing scripts


## Data Flow

1. **Frontend Request:** The React application makes a fetch request to a specific API endpoint (e.g., `/api/active-users`).
2. **Serverless Function Execution:** Vercel's serverless platform triggers the corresponding Node.js function (e.g., `api/active-users.js`).
3. **Database Interaction:** The serverless function connects to the PostgreSQL database, executes a query to retrieve the necessary data.
4. **Data Processing:** The function processes the query results, calculates any derived metrics (like growth percentages).
5. **API Response:** The serverless function returns a JSON response containing the fetched and processed data.
6. **Frontend Update:** The React component receives the API response and updates its state, re-rendering to display the new information.

