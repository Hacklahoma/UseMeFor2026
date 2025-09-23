# Hacklahoma 2026 Website

A full-stack web application for the Hacklahoma 2026 hackathon, featuring separate interfaces for participants (hackers) and event staff (exec).

## Project Overview

This project consists of a React TypeScript frontend and a Node.js backend server, designed to provide a comprehensive platform for managing and participating in the Hacklahoma 2026 hackathon.

## Project Structure

```
HacklahomaSite2026/
├── frontend/                 # React TypeScript frontend application
│   ├── src/
│   │   ├── App.tsx          # Main application component
│   │   ├── index.tsx        # Application entry point
│   │   ├── backend/         # Frontend backend integration
│   │   │   ├── api/         # API service layer
│   │   │   ├── controllers/ # Frontend controllers
│   │   │   └── models/      # Frontend data models
│   │   ├── routes/          # Frontend routing configuration
│   │   └── ui/              # User interface components
│   │       ├── common/      # Shared UI components
│   │       │   ├── assets/  # Static assets (images, icons, etc.)
│   │       │   └── components/ # Reusable UI components
│   │       └── pages/       # Page-level components
│   │           ├── exec/    # Executive/Staff interface
│   │           ├── hacker/  # Participant interface
│   │           ├── landing/ # Landing page
│   │           └── login/   # Authentication pages
│   │               ├── login/    # Login form
│   │               └── register/ # Registration form
│   ├── package.json         # Frontend dependencies and scripts
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── tsconfig.json        # TypeScript configuration
│
└── server/                  # Node.js backend server
    ├── models/
    │   └── User.js          # User data model (MongoDB/Mongoose)
    └── package.json         # Backend dependencies and scripts
```

## Features

### User Roles
- **Hackers**: Event participants with access to hacker-specific features
- **Staff/Exec**: Event organizers and staff with administrative capabilities

### Core Pages
- **Landing Page**: Public homepage with event information
- **Authentication**: Login and registration system
- **Hacker Dashboard**: Participant-focused interface
- **Executive Dashboard**: Staff and organizer interface

### Technology Stack

#### Frontend
- **React 19.1.1** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **React Scripts** - Development and build tooling

#### Backend
- **Node.js** - JavaScript runtime environment
- **MongoDB/Mongoose** - Database and ODM
- **JWT (jsonwebtoken)** - Authentication tokens
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - HTTP cookie parsing
- **dotenv** - Environment variable management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- MongoDB database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HacklahomaSite2026
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

### Development Setup

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   The server will run on `http://localhost:5001`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000` and proxy API requests to the backend

### Environment Configuration

Create a `.env` file in the server directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/hacklahoma2026
JWT_SECRET=your-secret-key-here
PORT=5001
```

## User Model

The application uses a comprehensive user model with the following fields:
- **Personal Information**: firstName, lastName, email, password
- **Academic Information**: school, major, grade
- **Role Management**: hacker or staff role assignment
- **Profile**: profilePicture, socialLinks (GitHub, LinkedIn, Discord, Instagram)
- **Timestamps**: Automatic creation and update timestamps

## Development Notes

- The frontend is configured to proxy API requests to `http://localhost:5001`
- Tailwind CSS is configured to scan all TypeScript/JavaScript files in the src directory
- The project uses strict TypeScript configuration for type safety
- User authentication is handled via JWT tokens

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions about the Hacklahoma 2026 website, please contact the development team.
