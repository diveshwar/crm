# Xeno Mini CRM Platform

A modern CRM platform that enables customer segmentation, personalized campaign delivery, and intelligent insights.

## Features

- 🔐 Google OAuth 2.0 Authentication
- 📊 Customer Data Management
- 🎯 Dynamic Audience Segmentation
- 📨 Campaign Management
- 🤖 AI-Powered Features
- 📈 Campaign Analytics

## Tech Stack

### Backend
- Node.js with Express
- MySQL Database
- Redis for caching and pub/sub
- Google OAuth 2.0

### Frontend
- Next.js 14
- Tailwind CSS
- React Query
- NextAuth.js

### AI Integration
- OpenAI GPT-4 for natural language processing
- Vertex AI for campaign insights

## Project Structure

```
crm/
├── backend/           # Node.js Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
├── frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
└── docs/            # Documentation
```

## Local Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Redis
- npm or yarn

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=crm_db
   REDIS_URL=redis://localhost:6379
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

API documentation is available at `/api-docs` when running the backend server.

## Architecture

The application follows a microservices architecture with the following components:

1. **API Layer**
   - RESTful APIs for data ingestion
   - Authentication middleware
   - Request validation

2. **Message Broker**
   - Redis pub/sub for async processing
   - Batch processing for campaign delivery

3. **Database Layer**
   - MySQL for persistent storage
   - Redis for caching

4. **AI Integration**
   - OpenAI for natural language processing
   - Vertex AI for campaign insights

## Known Limitations

1. Campaign delivery is simulated with a dummy vendor API
2. AI features require valid API keys
3. Local development requires manual setup of OAuth credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 