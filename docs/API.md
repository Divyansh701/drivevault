# DriveVault Backend API Documentation

Welcome to the DriveVault REST API reference manual.

Base URL: `http://localhost:5000/api` (also supported: `http://localhost:5000/api/v1`)

---

## Authentication & Security

All protected endpoints require a JWT Access Token passed in the `Authorization` header:

```http
Authorization: Bearer <your_access_token>
```

### Roles & Access Matrix

| Endpoint | Method | Path | Allowed Roles |
|---|---|---|---|
| Health | `GET` | `/health` | Public |
| Auth Register | `POST` | `/auth/register` | Public (default role: `VIEWER`) |
| Auth Login | `POST` | `/auth/login` | Public |
| List Vehicles | `GET` | `/vehicles` | `ADMIN`, `STAFF`, `VIEWER` |
| Search Vehicles | `GET` | `/vehicles/search` | `ADMIN`, `STAFF`, `VIEWER` |
| Get Vehicle | `GET` | `/vehicles/:id` | `ADMIN`, `STAFF`, `VIEWER` |
| Add Vehicle | `POST` | `/vehicles` | `ADMIN`, `STAFF` |
| Update Vehicle | `PUT` | `/vehicles/:id` | `ADMIN`, `STAFF` |
| Partial Update | `PATCH` | `/vehicles/:id` | `ADMIN`, `STAFF` |
| Delete Vehicle | `DELETE` | `/vehicles/:id` | `ADMIN` only |
| Purchase Unit | `POST` | `/vehicles/:id/purchase` | `ADMIN`, `STAFF`, `VIEWER` |
| Restock Stock | `POST` | `/vehicles/:id/restock` | `ADMIN` only |

---

## Endpoints Detail

### 1. Auth Endpoints

#### `POST /auth/register`
Create a new user account.
- **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "password": "SecurePass1!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "id": "usr-123",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "role": "VIEWER"
      },
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    }
  }
  ```

#### `POST /auth/login`
Authenticate user credentials.
- **Response (200 OK)**: Returns user payload and tokens.

---

### 2. Vehicle CRUD Endpoints

#### `POST /vehicles`
Create a new vehicle record.
- **Request Body**:
  ```json
  {
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "category": "SEDAN",
    "powertrain": "PETROL",
    "price": "28500.00",
    "quantity": 5
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "status": "success",
    "data": {
      "vehicle": {
        "id": "uuid-v1",
        "make": "Toyota",
        "model": "Camry",
        "year": 2023,
        "category": "SEDAN",
        "price": "28500.00",
        "quantity": 5,
        "createdAt": "2026-07-29T12:00:00.000Z"
      }
    }
  }
  ```

#### `GET /vehicles` & `GET /vehicles/search`
Query vehicles with multi-criteria filters, pagination, and sorting.
- **Query Parameters**:
  - `make` (string)
  - `model` (string)
  - `category` (`SEDAN`, `SUV`, `TRUCK`, etc.)
  - `powertrain` (`PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID`, etc.)
  - `minPrice` / `maxPrice` (decimal strings)
  - `year` (integer)
  - `page` (integer, default `1`)
  - `limit` (integer, min `1`, max `100`, default `10`)
  - `sortBy` (`price`, `year`, `make`, `model`, `createdAt`, `updatedAt`)
  - `sortOrder` (`asc`, `desc`)
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "vehicles": [...],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 42,
        "totalPages": 5
      }
    }
  }
  ```

#### `GET /vehicles/:id`
Fetch a single active vehicle record.

#### `PUT /vehicles/:id`
Full replace update for a vehicle record.

#### `PATCH /vehicles/:id`
Partial update for specific fields of a vehicle record.

#### `DELETE /vehicles/:id`
Soft-delete a vehicle (Admin only). Returns `204 No Content`.

---

### 3. Inventory Management Endpoints

#### `POST /vehicles/:id/purchase`
Purchase a single unit of a vehicle.
- **Rules**: Decrements `quantity` by 1. Throws `409 Conflict` if quantity is `0`.
- **Response (200 OK)**: Returns updated vehicle record with new quantity.

#### `POST /vehicles/:id/restock` (Admin Only)
Increase vehicle inventory stock.
- **Request Body**:
  ```json
  {
    "quantity": 10
  }
  ```
- **Response (200 OK)**: Returns updated vehicle record with increased quantity.
