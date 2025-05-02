# MediBridge

MediBridge is a comprehensive medical inventory and healthcare management system designed to connect patients, doctors, and medicine sellers in a unified platform.

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