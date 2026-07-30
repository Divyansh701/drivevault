# MongoDB Migration Guide

This document details the migration from Prisma/PostgreSQL to MongoDB/Mongoose for the DriveVault project.

## Migration Overview

The DriveVault application has been successfully migrated from Prisma with PostgreSQL to Mongoose with MongoDB while maintaining full backward compatibility with existing use cases, controllers, and business logic.

## What Changed

### 1. Dependencies
**Removed:**
- `@prisma/client` (v5.22.0)
- `prisma` (v5.22.0)
- All Prisma-related scripts

**Added:**
- `mongoose` (v8.8.4)

### 2. Database Layer

#### Before (Prisma)
```
src/infrastructure/database/
└── prisma.client.ts
```

#### After (MongoDB)
```
src/infrastructure/database/
├── mongodb.client.ts          # MongoDB connection singleton
└── schemas/
    ├── index.ts               # Schema exports
    ├── User.schema.ts         # User Mongoose schema
    └── Vehicle.schema.ts      # Vehicle Mongoose schema
```

### 3. Repository Implementations

#### Before
- `InMemoryUserRepository` (development/testing)
- `InMemoryVehicleRepository` (development/testing)
- Prisma repositories were planned but not implemented

#### After
- `MongoDBUserRepository` (production-ready)
- `MongoDBVehicleRepository` (production-ready)
- In-memory repositories remain available for testing

### 4. Configuration
**`.env` and `.env.example`:**
```diff
- DATABASE_URL="postgresql://user:password@localhost:5432/drivevault_dev?schema=public"
+ DATABASE_URL="mongodb://localhost:27017/drivevault_dev"
```

**`src/shared/utils/config.ts`:**
```diff
- DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string')
+ DATABASE_URL: z.string().min(1).refine(
+   (url) => url.startsWith('mongodb://') || url.startsWith('mongodb+srv://'),
+   'DATABASE_URL must be a valid MongoDB connection string'
+ )
```

### 5. Server Startup
**`src/server.ts`:**
- Added MongoDB connection before server startup
- Replaced Prisma disconnect with MongoDB disconnect
- Added error handling for connection failures

### 6. Seed Script
**Before:**
```
prisma/seed.ts  # Used Prisma Client
npm run prisma:seed
```

**After:**
```
scripts/seed.ts  # Uses Mongoose models
npm run seed
```

## Architecture Benefits

### Clean Architecture Preserved
The migration demonstrated the power of Clean Architecture:

1. **Zero Changes to:**
   - Domain layer (entities, interfaces)
   - Application layer (use cases)
   - Presentation layer (controllers, routes)
   - Business logic

2. **Only Changed:**
   - Infrastructure layer (repository implementations)
   - Database connection management
   - Environment configuration

### Dependency Inversion Principle
The domain layer depends on `IUserRepository` and `IVehicleRepository` interfaces, not concrete implementations. This allowed swapping databases without touching business logic.

## MongoDB Schema Design

### User Schema
```typescript
{
  _id: ObjectId,              // Auto-generated
  name: String,               // Required, 2-100 chars
  email: String,              // Unique, lowercase, indexed
  password: String,           // Bcrypt hash
  role: Enum,                 // ADMIN | STAFF | VIEWER
  isActive: Boolean,          // Default: true
  createdAt: Date,            // Auto-managed
  updatedAt: Date,            // Auto-managed
  deletedAt: Date | null      // Soft delete
}
```

**Indexes:**
- `email` (unique)
- `role, deletedAt` (compound)
- `email, deletedAt` (compound)

### Vehicle Schema
```typescript
{
  _id: ObjectId,
  make: String,               // Required, indexed
  model: String,              // Required
  year: Number,               // Required, indexed, 1900-2100
  category: Enum,             // SEDAN | SUV | TRUCK | etc.
  powertrain: Enum,           // PETROL | DIESEL | ELECTRIC | etc.
  price: Number,              // Required, indexed, 2 decimal places
  quantity: Number,           // Default: 1, min: 0
  vin: String,                // Unique, sparse, uppercase, 17 chars
  color: String,              // Optional
  mileage: Number,            // Default: 0, min: 0
  description: String,        // Optional, max 5000 chars
  status: Enum,               // AVAILABLE | RESERVED | SOLD | MAINTENANCE
  imageUrls: [String],        // Array of HTTP/HTTPS URLs
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null
}
```

**Indexes:**
- `make` (single)
- `year` (single)
- `price` (single)
- `category` (single)
- `powertrain` (single)
- `status` (single)
- `deletedAt` (single)
- `make, model` (compound)
- `category, deletedAt` (compound)
- `make, model, description` (text index for search)

## Repository Features

Both MongoDB repositories implement the full domain interface contracts with:

### MongoDBUserRepository
- `findById` - Find active user by ID
- `findByEmail` - Case-insensitive email lookup
- `findAll` - Paginated user list
- `count` - Total active users
- `create` - Create new user
- `update` - Partial update
- `softDelete` - Set deletedAt timestamp

### MongoDBVehicleRepository
- `findAll` - Complex filtering with pagination and sorting
  - Filter by: make, model, category, powertrain, status
  - Range filters: price (min/max), year (min/max, exact)
  - Sorting: price, year, make, model, createdAt, updatedAt
- `findById` - Find active vehicle by ID
- `findByVin` - Find by VIN (case-insensitive)
- `count` - Count matching filters
- `create` - Create new vehicle
- `update` - Partial update
- `softDelete` - Set deletedAt timestamp

## Query Helpers

Mongoose schemas include query helpers for common patterns:

```typescript
// Find only active (non-deleted) records
Vehicle.find().active()

// Find available vehicles
Vehicle.find().available()

// Find vehicles in stock
Vehicle.find().inStock()
```

## Instance Methods

Schemas include helper methods:

```typescript
// Users
user.isDeleted()
user.softDelete()

// Vehicles
vehicle.isDeleted()
vehicle.softDelete()
vehicle.isInStock()
vehicle.decrementQuantity(amount)
vehicle.incrementQuantity(amount)
```

## Connection Management

### Singleton Pattern
The `mongoDBClient` singleton manages the MongoDB connection lifecycle:

```typescript
// Connect (idempotent - safe to call multiple times)
await mongoDBClient.connect();

// Disconnect (during shutdown)
await mongoDBClient.disconnect();

// Check connection status
if (mongoDBClient.connected) { ... }

// Drop database (testing only)
await mongoDBClient.dropDatabase();
```

### Features
- Connection pooling (min: 2, max: 10)
- Automatic reconnection
- Debug logging in development
- Event listeners for errors and disconnection
- Graceful shutdown handling

## Migration Steps Summary

1. ✅ Updated `package.json` dependencies
2. ✅ Created MongoDB client singleton
3. ✅ Created Mongoose schemas for User and Vehicle
4. ✅ Implemented MongoDBUserRepository
5. ✅ Implemented MongoDBVehicleRepository
6. ✅ Updated config validation for MongoDB URLs
7. ✅ Updated app.ts to use MongoDB repositories
8. ✅ Updated environment files
9. ✅ Created MongoDB seed script
10. ✅ Updated server.ts for MongoDB connection
11. ✅ Updated README with MongoDB setup instructions

## Running the Application

### 1. Install MongoDB
Choose one:
- **Local**: Install MongoDB Community Server
- **Cloud**: Use MongoDB Atlas (free tier available)

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and set DATABASE_URL
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed the Database
```bash
npm run seed
```

### 5. Start the Server
```bash
npm run dev
```

## Testing

The migration maintains full compatibility with existing tests. To run tests with MongoDB:

1. Set up a test database
2. Update test configuration if needed
3. Run tests as normal:
```bash
npm test
npm run test:unit
npm run test:integration
```

## Rollback Plan

If needed, the project can be rolled back to Prisma by:

1. Restore `package.json` dependencies
2. Restore Prisma schema and client
3. Update `app.ts` to use Prisma or in-memory repositories
4. Restore original `config.ts` validation
5. Restore original `server.ts`
6. Restore `.env` with PostgreSQL URL

**Note:** Domain and application layers require no changes during rollback.

## Performance Considerations

### Indexing
All frequently queried fields are indexed:
- User: email, role, deletedAt
- Vehicle: make, category, powertrain, status, year, price, deletedAt

### Query Optimization
- Compound indexes for common filter combinations
- Text indexes for search functionality
- Sparse indexes for optional unique fields (VIN)

### Connection Pooling
- Configured for optimal connection reuse
- Min pool size: 2 connections
- Max pool size: 10 connections

## Future Enhancements

Potential improvements:
1. **Caching**: Add Redis for frequently accessed data
2. **Aggregation**: Implement MongoDB aggregation pipelines for analytics
3. **Transactions**: Add multi-document transaction support where needed
4. **Sharding**: Plan for horizontal scaling if needed
5. **Monitoring**: Add MongoDB performance monitoring

## Conclusion

The migration to MongoDB/Mongoose was completed successfully with:
- ✅ Zero breaking changes to business logic
- ✅ Full feature parity with Prisma implementation
- ✅ Improved flexibility with document-based storage
- ✅ Comprehensive indexing for performance
- ✅ Production-ready repository implementations
- ✅ Proper error handling and connection management

The Clean Architecture approach proved its value by enabling a complete database migration affecting only the infrastructure layer.
