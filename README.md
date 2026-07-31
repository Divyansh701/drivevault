# DriveVault
A full-stack vehicle inventory and dealership management platform.
Under active development.

## Project Overview

**DriveVault** is a modern **full-stack Vehicle Inventory & Dealership Management Platform** designed to streamline dealership operations through a secure, scalable, and user-friendly web application. It provides a centralized system for managing vehicle inventory, dealership staff, customers, and public vehicle listings while enforcing **Role-Based Access Control (RBAC)** to ensure users only access features relevant to their assigned roles.
Built with a **React + TypeScript** frontend, **Node.js + Express + TypeScript** backend, and **MongoDB Atlas** for data persistence, DriveVault follows industry-standard software engineering practices including **Clean Architecture**, **SOLID principles**, and **Test-Driven Development (TDD)**. The application emphasizes maintainability, scalability, security, and code quality, making it suitable for real-world dealership environments.

### Key Features
- 🔐 Secure JWT-based Authentication & Authorization
- 👥 Role-Based Access Control (Administrator, Dealer, Staff, Customer, Viewer)
- 🚗 Complete Vehicle Inventory Management (Create, Read, Update, Delete)
- 🔍 Vehicle Search, Filtering, and Sorting
- 📸 Vehicle Image Management
- 📊 Dedicated Dashboards for Different User Roles
- ❤️ Customer Wishlist Functionality
- 📱 Responsive and Modern User Interface
- ☁️ Cloud Deployment using **Vercel**, **Render**, and **MongoDB Atlas**

### Project Goals
The primary objective of DriveVault is to provide dealerships with a secure, scalable, and maintainable inventory management solution while delivering a seamless browsing experience for customers. Beyond implementing business functionality, the project demonstrates modern full-stack development practices, clean software architecture, and production-ready deployment workflows.

## A Personal Note
This project is more than a coding assessment—it's a challenge to step outside my comfort zone.
Although this technology stack is new to me, I believe that a software engineer's ability to learn, adapt, and solve problems is just as important as prior experience. Over the next 48 hours, I'll be building this application while learning new concepts, making mistakes, improving the implementation, and documenting the entire process. The goal isn't just to finish the project, but to demonstrate curiosity, discipline, and continuous learning.

## About This Project
This project is being built for a company technical assessment with a target completion time of approximately 48 hours.
One of the goals of this challenge is to build a complete full-stack application using technologies that are new to me. While I have prior experience in backend development with Java and Spring Boot, this project requires a different technology stack. I have chosen to treat it as an opportunity to learn, adapt quickly, and apply sound software engineering practices under a tight deadline.
Throughout the development process, I will focus on:
- Learning unfamiliar technologies efficiently
- Following Test-Driven Development (TDD)
- Writing clean, maintainable code
- Using Git effectively with meaningful commits
- Documenting AI assistance transparently, as required by the assessment
This repository documents both the final solution and the learning journey behind it.

# My Journey
I'm starting this project today.
This repository is going to be a journal of my journey—from scratch to the finish line.
Every feature, every bug, every challenge, every lesson, and every breakthrough will be documented here as I build this application within a 48-hour deadline for a company technical assessment. I'm stepping into a tech stack that's new to me, but that's exactly what makes this challenge exciting. I hope that by the end of this journey, I'll not only have built a complete application but also become a better software engineer.

## Progress Update - I

About four hours into this coding session, I'm genuinely enjoying the process. With the help of Kiro AI, I managed to build the complete backend. One of the most challenging parts was designing effective prompts, and I used GPT extensively to refine them.

While reviewing the project, an important question came to mind:
> **Does the generated architecture actually follow the SOLID principles?**

To answer that, I asked GPT to review the backend architecture against the SOLID principles. The evaluation gave it a **75% compliance score**, highlighting several opportunities for improvement in maintainability and overall design.
Rather than moving straight to implementing more features, I decided to invest time in refactoring the existing codebase. Building software that works is important, but building software that remains maintainable and scalable is even more valuable.

### Current Refactoring Focus
- Reducing tight coupling between services
- Applying the Dependency Inversion Principle where appropriate
- Improving separation of concerns
- Splitting classes with multiple responsibilities
- Making the codebase easier to test and extend
- Improving overall architecture quality and maintainability

My goal is to complete these improvements within the next hour or so. Whether it takes a little longer isn't my primary concern—the objective is to leave the backend in a better state than I found it.

### Key Takeaway
This experience has reinforced an important lesson: AI is an excellent accelerator, but good software engineering still requires critical thinking, architectural review, and deliberate refactoring. My goal isn't just to build quickly—it's to build software that's maintainable, reliable, and easy to extend.

## Progress Update - II

The backend has now reached a much more stable state after the refactoring phase. I finished restructuring the project around Clean Architecture by separating the application, domain, infrastructure, and presentation layers. The codebase is now significantly easier to extend and maintain.
One of the biggest additions during this phase was implementing authentication and authorization. I introduced JWT-based authentication, password hashing, role-based access control, and middleware to protect secured endpoints. I also expanded the application layer by creating dedicated use cases for vehicle management, user registration, login, purchasing, restocking, updating, and deleting vehicles.
To improve confidence in the implementation, I invested time in writing both unit and integration tests. Instead of focusing only on making the application work, I wanted to ensure that the business logic remains reliable as the project evolves.

Current Progress:
- Completed Clean Architecture refactoring
- Implemented JWT authentication and authorization
- Added password hashing and token services
- Created repository abstractions and in-memory implementations
- Added request validation for authentication and vehicle operations
- Implemented CRUD operations for vehicles
- Added purchase and restock workflows
- Expanded unit and integration test coverage
- Improved project structure and maintainability

### Key Takeaway
The project has evolved from a working prototype into a structured backend that emphasizes maintainability, scalability, and testability. Spending additional time on architecture and testing has already made future feature development much easier, reinforcing that writing clean code is an investment rather than an overhead.

## Progress Update - III

The backend is now almost complete, and I'm really happy with how the project has evolved. What started as a basic scaffold has grown into a structured, testable backend following Clean Architecture principles.
At this stage, all core backend features have been implemented, including authentication, authorization, vehicle management, repository abstractions, validation, and business use cases. I also spent a significant amount of time improving the architecture, refactoring the codebase, and ensuring responsibilities are properly separated across layers.
One of the most satisfying milestones was reaching a point where all automated tests pass successfully. After multiple rounds of debugging, refactoring, and edge-case testing, I haven't encountered any outstanding backend bugs. This gives me confidence that the application is stable and provides a solid foundation for the remaining work.

### Current Progress
- Backend implementation is nearly complete
- Clean Architecture fully established
- Authentication and authorization implemented
- Business use cases completed
- Repository abstractions and services implemented
- Request validation and error handling completed
- Unit and integration tests passing
- No known backend bugs at this stage

### Remaining Work
- Build the frontend application
- Integrate a persistent database (currently using in-memory implementations)
- Connect the frontend with the backend APIs
- Perform end-to-end testing
- Final project polish and documentation review

### Key Takeaway
Reaching this stage reinforced that writing maintainable software takes far more than simply implementing features. Refactoring, testing, and validating every component required considerable effort, but the result is a backend that is reliable, extensible, and ready to support the frontend and database integration. The remaining work is primarily focused on completing the full-stack experience rather than fixing the backend itself.

## Progress Update - IV

The project has now reached one of its biggest milestones—the frontend is complete, and the application has evolved into a fully functional full-stack system.
The primary focus during this phase was building an intuitive and responsive user interface while integrating it seamlessly with the backend APIs developed earlier. Every major workflow was connected and tested to ensure smooth communication between the frontend and backend.
Authentication, protected routes, vehicle management, inventory operations, and user interactions are now fully operational through the UI. I also spent time refining the user experience, handling API responses gracefully, and improving the overall responsiveness of the application.
Rather than simply making the interface work, I focused on creating a frontend that complements the backend architecture and provides a clean, maintainable codebase.

### Current Progress
- Complete frontend implementation
- Backend and frontend fully integrated
- Authentication flow connected
- Protected routes implemented
- Vehicle management interface completed
- Inventory purchase and restock workflows integrated
- Responsive UI across major pages
- API integration completed
- Error handling and validation implemented
- Full-stack application functioning as expected

### Remaining Work
- ~~Replace in-memory repositories with a persistent database~~ ✅ **Completed - MongoDB Integration**
- Perform final end-to-end testing
- Polish UI and documentation
- Prepare the project for final submission

### Key Takeaway
Building the frontend highlighted how important a well-structured backend is. Because the backend followed Clean Architecture and exposed consistent APIs, integrating the frontend became much smoother than expected. Completing this phase reinforced the value of investing time in software architecture, testing, and maintainability early in the development process.

## Progress Update - V

The project has reached another major milestone—**MongoDB integration is complete**. The application has been migrated from in-memory repositories to a persistent MongoDB database using Mongoose.
This phase involved replacing Prisma/PostgreSQL with MongoDB and Mongoose, creating comprehensive schemas with validation, implementing MongoDB-specific repositories while maintaining the existing domain interfaces, and ensuring backward compatibility with all existing use cases.
The Clean Architecture approach made this migration remarkably smooth. Because the domain layer depends on repository interfaces rather than concrete implementations, swapping the database required zero changes to business logic, use cases, or controllers. This reinforced the value of the architectural decisions made earlier in the project.

### Database Migration Details
- **Database**: MongoDB with Mongoose ODM
- **Schemas**: User and Vehicle models with enums, validation rules, indexes, and query helpers
- **Repositories**: MongoDBUserRepository and MongoDBVehicleRepository implementing existing domain interfaces
- **Features**: Soft deletes, complex filtering, pagination, sorting, full-text search indexes
- **Seeding**: MongoDB seed script with admin/staff users and 10 sample vehicles
- **Connection Management**: Singleton MongoDB client with graceful shutdown

### Current Progress
- MongoDB integration completed
- Mongoose schemas created with comprehensive validation
- Repository pattern maintained (zero changes to use cases)
- Database seeding script implemented
- Connection lifecycle management established
- All existing features working with persistent storage
- Backend architecture remains clean and maintainable

### Technical Implementation
The migration from Prisma to MongoDB involved:
1. Replacing `@prisma/client` with `mongoose`
2. Creating Mongoose schemas matching the original Prisma schema
3. Implementing MongoDB repositories that fulfill the domain repository contracts
4. Updating configuration to accept MongoDB connection strings
5. Creating a MongoDB client singleton for connection management
6. Writing a seed script to populate initial data
7. Updating server startup to establish MongoDB connection

### Key Takeaway
This migration validated the architectural decisions made throughout the project. The dependency on abstractions (repository interfaces) rather than concrete implementations meant that replacing the entire database layer required no changes to the business logic. This is exactly what Clean Architecture promises—the ability to defer infrastructure decisions and swap implementations without impacting the core application.

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Testing**: Jest with Supertest
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, Presentation layers)

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Fetch API with custom hooks

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)
- **MongoDB** (v6.0 or higher)
  - You can install MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud-hosted)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd drivevault-main
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Configure Environment Variables

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
```

Update the `.env` file with your MongoDB connection string:

```env
# Database (MongoDB)
# Local MongoDB
DATABASE_URL="mongodb://localhost:27017/drivevault_dev"

# OR MongoDB Atlas (cloud)
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/drivevault_dev"

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_jwt_secret_at_least_32_characters_long
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_chars

# Other configuration
NODE_ENV=development
PORT=3000
BCRYPT_ROUNDS=10
```

**Generate secure JWT secrets** using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Set Up MongoDB

#### Option A: Local MongoDB Installation

**Windows:**
1. Download MongoDB from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install MongoDB and ensure the service is running
3. MongoDB will be available at `mongodb://localhost:27017`

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update the `DATABASE_URL` in `.env`

### 6. Seed the Database

Populate the database with initial admin/staff users and sample vehicles:

```bash
npm run seed
```

This will create:
- 1 Admin user: `admin@divi.com` / `Admin@DIVI2024!`
- 1 Staff user: `staff@divi.com` / `Staff@DIVI2024!`
- 10 sample vehicles across all categories

### 7. Start the Backend Server

```bash
npm run dev
```

The backend will start at `http://localhost:3000`

### 8. Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:5173`

## Default User Credentials

After seeding, you can log in with these accounts:

| Role | URL | Email | Password |
|------|-----|-------|----------|
| **Administrator** | `/login/admin` | `admin@divi.com` | `Admin@DIVI2024!` |
| **Staff/Dealer** | `/login/staff` | `staff@divi.com` | `Staff@DIVI2024!` |
| **Customer** | `/register` | Create your own | Min 8 chars + 1 upper + 1 number |

### Dashboards
- **Admin Dashboard**: `http://localhost:5173/admin`
- **Staff Dashboard**: `http://localhost:5173/staff`
- **Customer Showroom**: `http://localhost:5173/customer`
- **Landing Page**: `http://localhost:5173/`

## Available Scripts

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npm test             # Run all tests
npm run test:unit    # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:coverage     # Run tests with coverage report
npm run seed         # Seed database with initial data
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
```

### Frontend
```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build locally
```

## Project Structure

```
drivevault-main/
├── src/
│   ├── application/          # Use cases and business logic
│   │   └── usecases/
│   ├── domain/               # Domain entities and repository interfaces
│   │   ├── entities/
│   │   └── repositories/
│   ├── infrastructure/       # External dependencies (DB, services)
│   │   ├── database/
│   │   │   ├── schemas/      # Mongoose schemas
│   │   │   └── mongodb.client.ts
│   │   ├── repositories/     # MongoDB repository implementations
│   │   └── services/
│   ├── presentation/         # HTTP layer (routes, controllers, middleware)
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── shared/               # Shared utilities and types
│   │   └── utils/
│   ├── app.ts                # Express app composition root
│   └── server.ts             # HTTP server entry point
├── scripts/
│   └── seed.ts               # Database seeding script
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── ...
├── tests/                    # Backend tests
│   ├── unit/
│   └── integration/
├── .env                      # Environment variables (not committed)
├── .env.example              # Example environment variables
├── package.json
└── README.md
```

## API Documentation

The backend exposes a RESTful API. Documentation is available in:
- `docs/API.md` - Detailed API documentation
- `docs/openapi.yaml` - OpenAPI 3.0 specification

### Base URLs
- Development: `http://localhost:3000/api/v1`
- API also available at: `http://localhost:3000/api`

## Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

### Layers
1. **Domain Layer**: Pure business logic and interfaces (no dependencies)
2. **Application Layer**: Use cases that orchestrate domain entities
3. **Infrastructure Layer**: Database, external services, and implementations
4. **Presentation Layer**: HTTP controllers, routes, and middleware

### Key Principles
- **Dependency Inversion**: Inner layers don't depend on outer layers
- **Single Responsibility**: Each module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Interface Segregation**: Clients depend only on what they need
- **Liskov Substitution**: Implementations are interchangeable

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
```

### Test Structure
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test API endpoints end-to-end
- **Coverage Target**: >80% code coverage

## Database Schema

### User Collection
- `_id`: ObjectId (MongoDB ID)
- `name`: String (required)
- `email`: String (unique, required)
- `password`: String (bcrypt hash, required)
- `role`: Enum (ADMIN | STAFF | VIEWER)
- `isActive`: Boolean
- `createdAt`: Date
- `updatedAt`: Date
- `deletedAt`: Date (soft delete)

### Vehicle Collection
- `_id`: ObjectId (MongoDB ID)
- `make`: String (required)
- `model`: String (required)
- `year`: Number (required)
- `category`: Enum (SEDAN | SUV | TRUCK | HATCHBACK | CONVERTIBLE | COUPE | VAN | MOTORCYCLE)
- `powertrain`: Enum (PETROL | DIESEL | ELECTRIC | HYBRID | PHEV | HYDROGEN | OTHER)
- `price`: Number (required)
- `quantity`: Number (default: 1)
- `vin`: String (unique, optional)
- `color`: String (optional)
- `mileage`: Number (default: 0)
- `description`: String (optional)
- `status`: Enum (AVAILABLE | RESERVED | SOLD | MAINTENANCE)
- `imageUrls`: Array of strings
- `createdAt`: Date
- `updatedAt`: Date
- `deletedAt`: Date (soft delete)

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (ADMIN, STAFF, VIEWER)
- Password hashing with bcrypt
- Protected routes and endpoints

### Vehicle Management
- CRUD operations for vehicles
- Advanced filtering (make, model, category, powertrain, price range, year range)
- Pagination and sorting
- Search functionality
- Purchase workflow (decrements quantity)
- Restock workflow (increments quantity)
- Soft delete support

### User Management
- User registration
- User login with JWT tokens
- Role-based permissions
- User profile management

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoNetworkError: failed to connect to server"**
- Ensure MongoDB is running: `sudo systemctl status mongodb` (Linux) or check services (Windows)
- Verify the connection string in `.env` is correct
- Check if port 27017 is available and not blocked by firewall

**Error: "Authentication failed"**
- Verify MongoDB user credentials in connection string
- Ensure the database user has proper permissions

### Port Already in Use

**Backend (Port 3000)**
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Kill the process or change PORT in .env
```

**Frontend (Port 5173)**
- Vite will automatically use the next available port
- Or specify port in `frontend/vite.config.ts`

### Dependency Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Same for frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## License
This project is being developed as part of a company technical assessment.

# My AI Usage

## **AI Tools Used**

Throughout the development of this project, I used the following AI tools as development assistants:

- **ChatGPT (OpenAI)**
- **Kiro (powered by Claude)**
- **Antigravity (powered by Google Gemini Flash)**

## **How I Used AI**

### **ChatGPT**
I primarily used ChatGPT as a technical planning and engineering assistant. Specifically, I used it to:

- Break down project requirements into manageable implementation phases.
- Plan the overall application architecture.
- Generate and refine development prompts for AI-assisted coding.
- Review backend and frontend architecture for adherence to SOLID principles and Clean Architecture.
- Debug deployment issues related to Vercel, Render, MongoDB Atlas, and CORS configuration.
- Understand and resolve TypeScript, React, Express, and deployment errors.
- Improve documentation, commit messages, and project organization.
- Validate implementation decisions and discuss best practices before applying changes.

### **Kiro (powered by Claude)**
Kiro served as my primary AI-assisted development environment during implementation. I used it to:

- Generate backend boilerplate following Clean Architecture principles.
- Implement business logic, API endpoints, repositories, and services.
- Build frontend React components and pages.
- Generate and improve TypeScript interfaces and reusable components.
- Assist with refactoring while maintaining SOLID principles.
- Help create and organize tests following a Test-Driven Development (TDD) workflow.
- Review code structure and improve maintainability.

### **Antigravity (powered by Google Gemini Flash)**
I used Antigravity to accelerate repository management and development workflows, including:

- Assisting with structured project implementation.
- Helping reconstruct a meaningful Git commit history that reflected a realistic development process.
- Supporting code generation and iterative improvements during implementation.
- Assisting with repository organization and project refinement.

## **Reflection**
Using AI significantly improved my productivity by allowing me to spend more time understanding system design, architecture, debugging, and decision-making rather than writing repetitive boilerplate code. AI accelerated tasks such as project planning, code scaffolding, debugging, and documentation, while I remained responsible for reviewing, integrating, testing, and validating every generated solution.

Throughout the project, I treated AI as a collaborative development assistant rather than a replacement for software engineering judgment. Every AI-generated suggestion was reviewed, adapted where necessary, and integrated into the project only after ensuring it aligned with the project's architecture, coding standards, and functional requirements. This workflow enabled faster development while maintaining code quality, consistency, and a deeper understanding of the technologies used.

# Images

<img width="1917" height="933" alt="Screenshot 2026-07-31 080403" src="https://github.com/user-attachments/assets/b6f47dbd-7f28-4967-a0c0-c0b3c68edaf4" />
<img width="1636" height="711" alt="Screenshot 2026-07-30 215540" src="https://github.com/user-attachments/assets/8ac4558c-184e-458d-9d82-3c64cc4d00ef" />
<img width="1593" height="592" alt="Screenshot 2026-07-30 215530" src="https://github.com/user-attachments/assets/d16f04a5-e012-4af4-b053-ab68d33c76f1" />
<img width="1622" height="588" alt="Screenshot 2026-07-30 215524" src="https://github.com/user-attachments/assets/1c1dc392-1003-43d9-a6ae-6903356d74c0" />
<img width="1917" height="1078" alt="Screenshot 2026-07-30 215210" src="https://github.com/user-attachments/assets/93435e52-74a0-4a9b-9b42-5ac8c93baab2" />
<img width="1917" height="1077" alt="Screenshot 2026-07-30 215055" src="https://github.com/user-attachments/assets/e48d2d44-c3b6-48f9-849f-9215fe7edd12" />
