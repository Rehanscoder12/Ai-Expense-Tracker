# AI-Powered Expense Tracker Frontend Dashboard

A polished React dashboard for tracking income and expenses, exploring financial trends, and receiving personalized budgeting guidance from Google Gemini AI.

The frontend connects to the migrated **Node.js + Express + MySQL + Sequelize** backend through a JWT-protected REST API.

## ✨ Features

- 📊 Interactive Recharts visualizations for income, expenses, balances, and categories
- 🥧 Pie-style category breakdowns and 📈 bar/trend graphs for spending analysis
- 💳 Add, edit, review, and delete income or expense transactions
- 🧮 Dashboard statistics for monthly totals, balance, savings, and top categories
- 🤖 Gemini AI budgeting chatbot interface for practical financial insights
- 🔐 Login, registration, protected routes, and persistent authentication state
- 📄 Exportable transaction and financial summary reports
- 📱 Responsive layouts for desktop and mobile screens

## 🧰 Technology Stack

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Build tool | Vite |
| Routing | React Router |
| API client | Axios |
| Charts | Recharts |
| Styling | CSS and Tailwind CSS |
| Icons | Lucide React |
| Reports | jsPDF and html2canvas |

## 📁 Project Structure

```text
frontend-expenses/
├── public/                       # Public static assets, if added
├── src/
│   ├── api/
│   │   └── axios.js              # Configured backend API client
│   ├── assets/                   # Images and imported visual assets
│   ├── components/
│   │   ├── ChatDrower.jsx        # Gemini budgeting chatbot panel
│   │   ├── ExportPDF.jsx         # Financial report export control
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── hooks/
│   │   ├── financialData.js      # Financial data fetching and state helpers
│   │   └── ScrollToTop.jsx       # Route navigation utility
│   ├── pages/
│   │   ├── Dashboard.jsx         # Analytics dashboard and charts
│   │   ├── GetStarted.jsx        # Entry and onboarding view
│   │   ├── Login.jsx             # Authentication screen
│   │   └── Transactions.jsx      # Transaction management view
│   ├── utilities/
│   │   └── pdfGenerator.js       # PDF report generation
│   ├── App.css                   # Application-level styles
│   ├── App.jsx                   # Routes and application shell
│   ├── index.css                 # Global styles
│   └── main.jsx                  # React application entry point
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

## ✅ Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- The backend running locally on `http://localhost:5000`
- A configured MySQL and Gemini-enabled backend environment

Check your versions:

```bash
node --version
npm --version
```

## 🚀 Local Installation

### 1. Enter the frontend directory

```bash
cd frontend-expenses
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API URL

Review `src/api/axios.js` and set its base URL to the running backend, normally:

```text
http://localhost:5000
```

Keep the Gemini API key on the backend. The frontend should call the `/chat` endpoint rather than exposing provider credentials in browser code.

### 4. Start the development server

```bash
npm run dev
```

Vite will print the local URL, normally `http://localhost:5173`.

### 5. Create a production build

```bash
npm run build
```

Preview the build locally with:

```bash
npm run preview
```

## 🔄 Typical User Flow

1. Register a new account or sign in.
2. Add income and expense transactions.
3. Review totals, balance, savings, and category distributions on the dashboard.
4. Switch chart ranges to inspect recent or all-time trends.
5. Open the Gemini chatbot and ask for budgeting recommendations based on current financial data.
6. Export a PDF report when a shareable summary is needed.

## 🔗 Backend Integration

The frontend communicates with these backend areas:

| Area | Backend routes |
| --- | --- |
| Authentication | `/user/register`, `/user/login`, `/user/logout`, `/user/info` |
| Transactions | `/trans/transactions` |
| Analytics | `/trans/stats`, `/trans/chart`, `/trans/cat` |
| Gemini insights | `/chat` |

Authentication requests use the JWT returned by the backend and/or its HTTP-only cookie. Ensure the backend `CORS_ORIGIN` matches the Vite URL when running locally.

## 🧹 Quality Checks

Run the linter before opening a pull request:

```bash
npm run lint
```

## 👤 Author

Built and maintained by **Rehans Pathak**.
