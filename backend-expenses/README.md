# AI-Powered Expense Tracker Backend (MySQL + Gemini AI)

A production-oriented REST API for managing personal finances, built with **Node.js**, **Express**, **MySQL**, **Sequelize**, **JWT authentication**, and Google Gemini AI.

> This backend was migrated from MongoDB/Mongoose and Groq AI to MySQL/Sequelize and the `gemini-2.5-flash` model.

## ✨ Highlights

- 🔐 JWT-based authentication with HTTP-only cookies and bearer-token support
- 💰 Create, read, update, and delete income and expense transactions
- 📊 Financial summaries, category breakdowns, balances, and chart-ready data
- 🤖 Gemini-powered personal finance insights through the MoneyMate chatbot
- 🗄️ Sequelize ORM with automatic MySQL table synchronization
- 🧱 Centralized async error handling and protected routes

## 🧰 Technology Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| API | Express 5 |
| Database | MySQL |
| ORM | Sequelize |
| Authentication | JSON Web Tokens, bcrypt |
| AI | Google Gemini `gemini-2.5-flash` |
| Configuration | dotenv |

## 📁 Project Structure

```text
backend-expenses/
├── config/
│   └── connectDB.js             # Sequelize connection and table synchronization
├── controllers/
│   ├── chatController.js        # Gemini chatbot and conversation persistence
│   ├── transactionController.js # Transactions, statistics, and chart data
│   └── userController.js        # Registration, login, logout, and profile
├── middlewares/
│   ├── errorHandler.js          # Centralized API error responses
│   └── validateToken.js         # JWT authentication middleware
├── models/
│   ├── conversationSchema.js    # Conversation and JSON message history model
│   ├── transactionSchema.js     # Income and expense model
│   └── userSchema.js            # User model
├── routes/
│   ├── chatRoutes.js
│   ├── transactionRoutes.js
│   └── userRoutes.js
├── .env                         # Local secrets and database configuration
├── constant.js                  # HTTP status constants
├── package.json
└── server.js                    # Express application entry point
```

## ✅ Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- MySQL 8 or newer
- A MySQL database client such as DBeaver
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

## 🚀 Local Installation

### 1. Enter the backend directory

```bash
cd backend-expenses
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the MySQL database

Create an empty database in MySQL or DBeaver. For example:

```sql
CREATE DATABASE expense_tracker;
```

### 4. Configure environment variables

Create `backend-expenses/.env`:

```env
PORT=5000

DB_NAME=expense_tracker
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_DIALECT=mysql

JWT_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=your_google_ai_studio_key

CORS_ORIGIN=http://localhost:5173
```

Use the password configured for your local MySQL installation or the password you use to connect through DBeaver. Keep `.env` private and never commit real credentials.

### 5. Start the API

Development mode with automatic restarts:

```bash
npm run dev
```

Standard mode:

```bash
npm start
```

The API runs at `http://localhost:5000` by default. Verify it with:

```text
GET http://localhost:5000/ping
```

## 🗄️ Database Architecture

`config/connectDB.js` creates a Sequelize instance using the MySQL variables from `.env`. When the server starts, Sequelize authenticates the connection and calls:

```js
sequelize.sync({ alter: true })
```

This creates missing tables and updates table structure to match the Sequelize models. After the first successful startup, inspect the generated `Users`, `Transactions`, and `Conversations` tables in DBeaver.

> `alter: true` is convenient for local development. For production deployments, use reviewed migrations instead of automatically altering live tables.

Transactions and conversations use the `userId` foreign key to associate records with users. Conversation messages are stored as JSON in MySQL, allowing the chatbot history to remain in a single conversation record.

## 🔌 API Endpoints

Base URL: `http://localhost:5000`

### Authentication

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/user/register` | No | Create a user account |
| `POST` | `/user/login` | No | Authenticate and receive a JWT |
| `POST` | `/user/logout` | No | Clear the authentication cookie |
| `GET` | `/user/info` | JWT | Get the authenticated user's profile |

### Transactions and analytics

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/trans/transactions` | JWT | List the user's transactions |
| `POST` | `/trans/transactions` | JWT | Create an income or expense |
| `PUT` | `/trans/transactions/:id` | JWT | Update an owned transaction |
| `DELETE` | `/trans/transactions/:id` | JWT | Delete an owned transaction |
| `GET` | `/trans/stats` | JWT | Get totals and monthly category statistics |
| `GET` | `/trans/chart?range=7d` | JWT | Get chart data for 7 days, 30 days, or all time |
| `GET` | `/trans/cat` | JWT | Get category totals |

### Gemini AI insights

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/chat` | JWT | Ask Gemini for personalized budgeting advice |

Example chat request:

```json
{
  "message": "How can I reduce my monthly spending?",
  "context": {
    "income": 5000,
    "expenses": 3200,
    "balance": 1800,
    "savings": 1800,
    "monthCategories": []
  }
}
```

## 🔒 Security Notes

- Store `JWT_SECRET`, `DB_PASSWORD`, and `GEMINI_API_KEY` only in environment variables.
- Do not commit `.env` or expose the Gemini key in frontend code.
- Use HTTPS and secure cookie settings when deploying.
- Restrict `CORS_ORIGIN` to the deployed frontend URL in production.
- Replace `sequelize.sync({ alter: true })` with managed migrations before production use.

## 👤 Author

Built and maintained by **Rehans Pathak**.
