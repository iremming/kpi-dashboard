# Architecture

**Tech Stack:**
- Frontend: React 18, Vite, Recharts, CSS3
- Backend: Node.js (Vercel Serverless Functions), PostgreSQL
- Database Client: `pg`

**Project Structure:**
(Assuming a standard structure, please adapt if different)
- `/src`
    - `/components`: Reusable UI components
    - `/pages`: Page-level components
    - `/services`: API interaction logic
    - `/utils`: Utility functions
- `/api`: Serverless function definitions

**Data Flow:**
- User interactions on the frontend trigger API calls to the backend (Vercel Serverless Functions).
- The backend interacts with the PostgreSQL database to fetch or store data.
- Data is returned to the frontend and rendered using React components and Recharts for visualization.
