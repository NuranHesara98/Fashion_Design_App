# Fashion Design App - User Profile & Design History Module

## Overview
This module handles user authentication, profile management, and design history tracking for the Fashion Design App. It provides secure endpoints for user registration, login, and profile management with design portfolio capabilities.

## Features
- User Authentication (Register/Login)
- Secure Profile Management
- Design History Tracking
- JWT-based Authentication

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User Profile
- `GET /api/users/profile` - Get user profile and design history

## Tech Stack
- Node.js & Express
- TypeScript
- MongoDB
- JWT Authentication

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB service

3. Start the server:
```bash
npm run dev
```

Server will run on port 5004: http://localhost:5004

## Environment Variables
Create a `.env` file with:
```
PORT=5004
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://localhost:27017/fashion_app
```

## Security Features
- Password Hashing
- JWT Token Authentication
- Protected Routes
- Input Validation
- Error Handling

## Contributing
This is part of the Fashion Design App project. Please follow the team's coding standards and commit guidelines.
