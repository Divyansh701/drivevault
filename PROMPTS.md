# Prompts -
I want you to act as a Principal Software Architect and Senior Full Stack Engineer with 20+ years of experience.
I am building a company coding assessment called DriveVault (Vehicle Inventory & Dealership Management Platform).
Your task is NOT to build the application.
Instead, create a complete prompt library for Kiro AI.
Requirements:
- Create 20 sequential prompts.
- Each prompt should build on the previous one.
- Each prompt must be copy-paste ready.
- Kiro should never regenerate the whole project.
- Kiro should continue from the existing codebase.
- Every prompt must enforce:
  - Test Driven Development (Red → Green → Refactor)
  - SOLID Principles
  - Clean Architecture
  - Repository Pattern
  - Dependency Injection
  - Domain Layer
  - Service Layer
  - Controllers
  - Prisma Repository implementation
  - Enterprise folder structure
  - JWT Authentication
  - Role Based Access Control
  - Zod Validation
  - Centralized Error Handling
  - Logging
  - Jest + Supertest
  - React + TypeScript + Tailwind
  - Responsive UI
  - Production-quality code
  - Meaningful Git commit suggestions
  - AI usage reminders for PROMPTS.md

The prompts should follow the exact order of a professional software development lifecycle.

Do not skip any architectural step.

At the end of every prompt:
- Suggest the Git commit.
- Tell Kiro to stop and wait for the next prompt.

Do not generate all prompts in one message.

Generate only Prompt 1 and wait for me to ask for Prompt 2.

Prompt 1 – Understand the Assessment
You are a Senior Full Stack Engineer and Software Architect.

We are building a production-quality Car Dealership Inventory System for a coding assessment.

Requirements:

- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Frontend: React + TypeScript + TailwindCSS
- Authentication: JWT
- Password Hashing: bcrypt
- Validation: Zod
- Testing: Jest + Supertest
- Architecture: SOLID + Clean Architecture
- Follow Test Driven Development (Red → Green → Refactor)
- Generate meaningful Git commit messages
- Never generate the whole project at once.
- Build one feature at a time.
- Explain every decision briefly.
- Stop after every completed feature and wait for my approval.

First, analyze the project requirements and create a development roadmap only.

Prompt 2 – Backend Setup
Now initialize the backend.

Use:

Node.js
Express
TypeScript
Prisma
PostgreSQL
Jest
Supertest
Zod
bcrypt
jsonwebtoken

Create a professional folder structure.

Install all required dependencies.

Configure TypeScript.

Configure Prisma.

Configure Jest.

Create environment variables.

Do not implement business logic yet.

Prompt 3 – Database Design
Design the PostgreSQL database.

Create Prisma schema.

Tables:

User

id
name
email
password
role

Vehicle

id
make
model
category
price
quantity

Explain every field.

Generate Prisma migrations.

Seed one admin user.

Seed 10 vehicles.

Do not implement APIs yet.


Prompt 4 – Authentication Tests
Follow TDD.

Write failing tests first for:

User Registration

User Login

Validation

Duplicate Email

Password Hashing

JWT Generation

Use Jest and Supertest.

Do not implement the APIs until all tests are written.

Prompt 5 – Authentication APIs
Implement only enough code to make all authentication tests pass.

Implement:

POST /api/auth/register

POST /api/auth/login

Use:

bcrypt

JWT

Zod validation

Return proper status codes.

Refactor if needed.

Suggest a Git commit message.

Prompt 6 – JWT Middleware
Implement JWT middleware.

Protect private routes.

Create role-based authorization.

Roles:

USER

ADMIN

Write tests first.

Then implement middleware.

Refactor after tests pass.

Prompt 7 – Vehicle CRUD Tests
Write tests first for:

Add Vehicle

Get Vehicles

Update Vehicle

Delete Vehicle

Validation

Unauthorized Access

Admin Authorization

Search

Do not implement APIs yet.

Prompt 8 – Vehicle CRUD APIs
Implement the Vehicle APIs.

POST /vehicles

GET /vehicles

PUT /vehicles/:id

DELETE /vehicles/:id

Use clean architecture.

Make all tests pass.

Refactor if necessary.

Suggest a Git commit.

Prompt 9 – Search Feature
Write tests first.

Implement vehicle search.

Support:

make

model

category

minimum price

maximum price

multiple filters together

Pagination

Sorting

Return proper responses.

Refactor.

Suggest Git commit.

Prompt 10 – Purchase Feature
Follow TDD.

Write tests first.

Implement:

POST /vehicles/:id/purchase

Rules:

Quantity decreases.

Cannot purchase when quantity is zero.

Return appropriate errors.

Make tests pass.

Refactor.

Suggest Git commit.

Prompt 11 – Restock Feature
Follow TDD.

Write tests first.

Implement:

POST /vehicles/:id/restock

Admin only.

Increase quantity.

Validate input.

Refactor.

Suggest Git commit.

Prompt 12 – Backend Cleanup
Review the backend.

Remove duplicate code.

Improve folder structure.

Improve naming.

Improve error handling.

Improve logging.

Improve validation.

Ensure SOLID principles.

Ensure production readiness.

Generate API documentation.

Prompt 13 – React Setup
Initialize React.

Use:

React

TypeScript

TailwindCSS

React Router

Axios

Create a professional folder structure.

Configure routing.

Configure API service.

Do not create pages yet.

Prompt 14 – Authentication UI
Build:

Login Page

Register Page

Professional UI.

Responsive.

Validation.

Connect to backend.

Store JWT securely.

Redirect after login.

Prompt 15 – Dashboard
Build Dashboard.

Fetch all vehicles.

Display cards.

Each card should contain:

Make

Model

Category

Price

Quantity

Purchase Button

Responsive UI.

Loading state.

Error handling.

Prompt 16 – Search UI
Build search and filters.

Support:

Make

Model

Category

Price Range

Debounced search.

Reset filters.

Connect to backend.

Prompt 17 – Admin Panel
Create Admin Dashboard.

Features:

Add Vehicle

Update Vehicle

Delete Vehicle

Restock Vehicle

Admin-only access.

Modern UI.

Validation.

Confirmation dialogs.

Prompt 18 – Purchase UI
Implement purchase functionality.

Disable Purchase button when quantity equals zero.

Show success notifications.

Refresh inventory after purchase.

Handle loading and errors.

Prompt 19 – Integration Testing
Review the entire application.

Find bugs.

Fix all issues.

Ensure backend and frontend integrate correctly.

Improve performance.

Improve security.

Improve validation.

Generate missing tests.

Prompt 20 – Final Submission
Prepare the project for submission.

Generate:

README.md

Installation Guide

API Documentation

Project Structure

Environment Variables

Testing Instructions

Deployment Instructions

AI Usage section

PROMPTS.md template

Git commit history suggestions

Final project checklist.

Verify that every assessment requirement is satisfied. 

Prompt
I want to improve the user experience of my DriveVault landing page by allowing visitors to browse vehicle listings without signing in.
Requirements
Implement a guest browsing mode with the following rules:
Goal
Users should be able to visit the website, browse available cars, open a car's details page, view all public information, and navigate the site without authentication.
Guests should be able to:
View the landing page.
Browse all available vehicle listings.
Search, filter, and sort cars.
Open any car's detail page.

View:
Car images
Brand
Model
Year
Price
Mileage
Fuel type
Transmission
Location
Description
Seller name (if already public)
Any other non-sensitive vehicle information.
Navigate freely between listings.
Guests must NOT be able to:

Add a car to favourites.
Contact the seller.
Book a test drive.
Buy or reserve a vehicle.
Add, edit, or delete listings.
Access the dashboard.
Access profile pages.
View chat/messages.
Leave reviews.
Upload images.
Perform any action that modifies data.
Access any authenticated API endpoint.
Authentication behaviour
If a guest clicks any protected action (Favourite, Contact Seller, Buy Now, Dashboard, Profile, etc.):

Prevent the action.
Open the Login/Register modal (or redirect to Login if no modal exists).
Preserve the current page so that after successful login the user returns to the same car detail page.
Routing
Make these routes public:
/

/cars

/cars/:id
Keep routes such as these protected:

/dashboard

/profile

/favorites

/messages

/sell

/bookings

Any admin routes
Backend security
Do NOT weaken backend security.
Keep all existing authentication and authorization middleware intact.
Only expose the GET endpoints necessary for:

Fetch all cars

Fetch a single car by ID
Every POST, PUT, PATCH, and DELETE endpoint must remain authenticated.
UI
For guests:

Display a small badge such as "Browsing as Guest".

Show a subtle CTA like:

"Sign in to save favourites, contact sellers, and book test drives."
Protected buttons should remain visible but clearly indicate that login is required.
Important
Do not modify or break:

Existing authentication flow

JWT/session handling

Protected APIs

Role-based authorization

Dashboard functionality

Seller features

Admin features

Existing business logic
This should be an enhancement only, introducing guest browsing while preserving all current authenticated functionality.
The final implementation should be clean, maintainable, secure, and should not introduce regressions or break any existing feature.

# Links 
# ChatGpt - https://chatgpt.com/share/6a6b83d9-9a0c-83ee-a796-c373983f6bcc
#       https://chatgpt.com/share/6a6b850c-f76c-83e8-8190-8bab5f0cb732

# AntiGravity - (Gemini Flash 3.6 , Claude Sonnet 4.6)
 DriveVault Codebase Audit Report Chat ID - 10171a9f-8fff-40c9-b602-0c9e071403f1 , 1b9af86c-ebdd-49d4-8d8c-4420bd90023e , b47993b5-27cf-46d8-b6fe-0378187f6647 , ccfb7428-d4a7-430c-9f10-0cea414bc4b1 , f2ca67d9-7b76-43ea-bd8d-2e0bba04288f

# Kiro - 
 sess_1dec6455-f46f-40de-b325-2865dc272a16 , sess_f9abb2f8-ef0d-4ab4-a97c-86682648b5f8 , 
