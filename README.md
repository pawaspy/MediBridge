# MediBridge - Healthcare Platform

MediBridge is a comprehensive healthcare platform that connects patients, doctors, and medical suppliers in one integrated ecosystem. The platform includes various features like medicine ordering, doctor consultations, and an AI-powered medical assistant called Healia.

## Components

The project consists of two main components:

1. **Frontend** - React-based user interface
2. **MediBridge AI** - Node.js backend for the Healia AI assistant

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Go language runtime (for the main backend)

## Setup Instructions

### 1. Frontend Setup

Navigate to the Frontend directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend should now be running at http://localhost:5173

### 2. MediBridge AI Setup

Navigate to the MediBridge AI directory:

```bash
cd medibridge-ai
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `medibridge-ai` root directory with the following content:

```
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

Start the AI server:

```bash
npm run dev
```

The AI server should now be running at http://localhost:3000

## Using Healia AI

Once both the frontend and AI server are running:

1. Navigate to the MediBridge homepage
2. Click on the "Healia AI" button in the navigation bar
3. You can now interact with the AI assistant by typing questions about medical symptoms, first aid, and health advice

## Features

- **Real-time communication**: Uses Socket.IO for real-time chat with the AI
- **Fallback to REST API**: Automatically falls back to REST API if WebSocket connection is unavailable
- **Medical knowledge base**: Includes first aid information and common condition advice
- **OpenAI integration**: Uses GPT-3.5 for complex medical queries

## Technical Architecture

- **Frontend**: React, TailwindCSS, Three.js for 3D backgrounds
- **AI Backend**: Express.js, Socket.IO, OpenAI API
- **Communication**: WebSockets (primary) with REST API fallback

## Troubleshooting

If you encounter connection issues with the AI:

1. Ensure both servers are running
2. Check that the port (3000) is not being used by another application
3. Verify that your OpenAI API key is valid and has sufficient credits
4. Check the browser console and server logs for any error messages

## License

MIT

## Overview

MediBridge offers a complete solution for managing medical inventory, patient profiles, doctor appointments, and pharmaceutical needs. The system includes:

- **User Management**: Separate authentication flows for patients, doctors, and medicine sellers
- **Medicine Inventory**: Complete medicine management with expiry tracking
- **Cart System**: Shopping cart functionality for medicine purchases
- **Doctor Directory**: Searchable doctor listings by specialization
- **AI Assistant**: "Aliza" - an AI agent to help users find medicines and doctors
- **Secure API**: Token-based authentication with secure access control

## Technology Stack

- **Backend**: Go (Golang) with Gin web framework
- **Database**: PostgreSQL with sqlc for type-safe SQL
- **Authentication**: PASETO tokens for secure authentication
- **Email**: Integrated email notifications for medicine expiry
- **Docker**: Containerization for easy deployment

## Getting Started

### Prerequisites

- Go 1.16+
- Docker and Docker Compose
- PostgreSQL
- migrate CLI tool for database migrations

### Setup

1. Clone the repository
```
git clone https://github.com/your-username/MediBridge.git
cd MediBridge
```

2. Start the PostgreSQL container
```
make postgres
```

3. Create the database
```
make createdb
```

4. Run database migrations
```
make migrateup
```

5. Generate SQL code
```
make sqlc
```

6. Start the server
```
make server
```

The server will start at `http://localhost:8080` by default.

## Database Schema

The database is structured with the following main entities:
- Users (Patients, Doctors, Sellers)
- Medicines
- Cart Items
- Patient Profiles

### Migrations

Database migrations are managed using the `migrate` tool. To create a new migration:

```
make migration name=add_new_feature
```

To apply migrations:
```
make migrateup    # Apply all pending migrations
make migrateup1   # Apply only the next pending migration
```

To rollback migrations:
```
make migratedown   # Rollback all migrations
make migratedown1  # Rollback only the last applied migration
```

## API Documentation

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

### Main Endpoints

#### User Management
- `POST /api/patients`: Register a new patient
- `POST /api/loginpatient`: Patient login
- `POST /api/doctors`: Register a new doctor
- `POST /api/logindoctor`: Doctor login
- `POST /api/sellers`: Register a new medicine seller
- `POST /api/loginseller`: Seller login

#### Medicine Management
- `GET /api/medicines/:id`: Get medicine details
- `GET /api/medicines/search`: Search medicines
- `POST /api/medicines`: Add new medicine (Seller only)
- `PUT /api/medicines`: Update medicine (Seller only)
- `DELETE /api/medicines/:id`: Delete medicine (Seller only)

#### Cart System
- `POST /api/cart`: Add item to cart
- `GET /api/cart`: Get cart items
- `PUT /api/cart/:id`: Update cart item quantity
- `DELETE /api/cart/:id`: Remove item from cart
- `DELETE /api/cart`: Clear cart
- `GET /api/cart/count`: Get cart item count

#### Doctor Management
- `GET /api/doctors/:username`: Get doctor details
- `PUT /api/doctors`: Update doctor profile (Doctor only)

#### Aliza AI Agent
- `POST /api/aliza/query`: Query the AI agent

## Aliza AI Agent

Aliza is an AI assistant integrated into MediBridge that helps users with:

1. Finding suitable medicines based on described conditions and allergies
2. Locating doctors based on specialization

Aliza uses pattern matching to understand user queries and provide relevant responses using the MediBridge database.

### Using Aliza

Send a natural language query to Aliza:

```json
POST /api/aliza/query
{
  "query": "What medicine is good for headache?"
}
```

## Project Structure

```
MediBridge/
├── api/               # API handlers and server setup
├── db/                # Database related code
│   ├── migration/     # SQL migrations
│   ├── query/         # SQL queries
│   └── sqlc/          # Generated Go code from SQL
├── ai_agent/          # Aliza AI agent implementation
├── mail/              # Email notification system
├── token/             # Authentication token handling
├── util/              # Utility functions and configurations
├── app.env            # Environment configuration file
├── Makefile           # Project commands
└── main.go            # Application entry point
```

## Development

### Make Commands

The project includes several make commands for common tasks:

- `make postgres`: Start PostgreSQL container
- `make createdb`: Create the database
- `make migration name=x`: Create a new migration
- `make migrateup/migratedown`: Apply or rollback all migrations
- `make migrateup1/migratedown1`: Apply or rollback a single migration
- `make sqlc`: Generate Go code from SQL queries
- `make server`: Run the development server
- `make db_docs`: Generate database documentation
- `make db_schema`: Generate SQL schema from DBML 
