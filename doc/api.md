# Backend API Reference

Base URL: `http://localhost:3000`

All request and response bodies are JSON. Protected endpoints require an `Authorization: Bearer <token>` header.

## Authentication

### POST /api/auth/register

Register a new user account.

**Request body:**

```json
{
  "email": "user@example.com",
  "username": "player1",
  "password": "mypassword"
}
```

**Validation:**
- `email` - must be a valid email format
- `username` - must be non-empty
- `password` - must be at least 6 characters

**Success response (201):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "player1"
}
```

**Error responses:**
- `400` - validation failed (missing or invalid fields)
- `409` - email or username already taken

---

### POST /api/auth/login

Login with an existing account.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```

**Success response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "player1"
}
```

**Error responses:**
- `400` - email or password missing
- `401` - invalid email or password

---

### GET /api/auth/me

Get the current authenticated user's info.

**Auth:** Required

**Success response (200):**

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0e",
  "email": "user@example.com",
  "username": "player1",
  "avatarUrl": "/assets/avatars/avatar1.svg",
  "createdAt": "2026-02-18T12:00:00.000Z"
}
```

**Error responses:**
- `401` - not authenticated
- `404` - user not found

---

## Scores

### POST /api/scores

Submit a game score.

**Auth:** Required

**Request body:**

```json
{
  "score": 42
}
```

**Validation:**
- `score` - must be a non-negative integer

**Success response (201):**

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0f",
  "userId": "665a1b2c3d4e5f6a7b8c9d0e",
  "username": "player1",
  "score": 42,
  "createdAt": "2026-02-18T12:05:00.000Z"
}
```

**Error responses:**
- `400` - invalid score value
- `401` - not authenticated

---

### GET /api/scores/leaderboard

Get the top scores across all users.

**Auth:** Not required

**Query parameters:**
- `limit` - number of results (default: 10, max: 100)

**Example:** `GET /api/scores/leaderboard?limit=5`

**Success response (200):**

```json
[
  {
    "_id": "665a...",
    "userId": "665a...",
    "username": "player1",
    "score": 99,
    "createdAt": "2026-02-18T12:05:00.000Z"
  },
  {
    "_id": "665b...",
    "userId": "665b...",
    "username": "player2",
    "score": 85,
    "createdAt": "2026-02-18T11:30:00.000Z"
  }
]
```

---

### GET /api/scores/me

Get the current user's score history, sorted by score descending.

**Auth:** Required

**Success response (200):**

```json
[
  {
    "_id": "665a...",
    "userId": "665a...",
    "username": "player1",
    "score": 42,
    "createdAt": "2026-02-18T12:05:00.000Z"
  }
]
```

**Error responses:**
- `401` - not authenticated

---

## Users

### GET /api/users/:id

Get a user's public profile.

**Auth:** Not required

**Success response (200):**

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0e",
  "username": "player1",
  "avatarUrl": "/assets/avatars/avatar1.svg",
  "createdAt": "2026-02-18T12:00:00.000Z"
}
```

Note: `email` and `passwordHash` are excluded from the response.

**Error responses:**
- `400` - invalid user ID format
- `404` - user not found

---

### PUT /api/users/me

Update the current user's profile.

**Auth:** Required

**Request body (all fields optional):**

```json
{
  "username": "newname",
  "avatarUrl": "/assets/avatars/avatar3.svg"
}
```

**Validation:**
- `username` - must be non-empty if provided, must not be taken by another user
- At least one field must be provided

**Success response (200):**

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0e",
  "email": "user@example.com",
  "username": "newname",
  "avatarUrl": "/assets/avatars/avatar3.svg",
  "createdAt": "2026-02-18T12:00:00.000Z"
}
```

**Error responses:**
- `400` - no fields to update, or username empty
- `401` - not authenticated
- `409` - username already taken

---

### GET /api/users/:id/scores

Get a user's top 10 scores.

**Auth:** Not required

**Success response (200):**

```json
[
  {
    "_id": "665a...",
    "userId": "665a...",
    "username": "player1",
    "score": 42,
    "createdAt": "2026-02-18T12:05:00.000Z"
  }
]
```

**Error responses:**
- `400` - invalid user ID format

---

## Database Collections

### `users`

| Field          | Type     | Description                          |
|----------------|----------|--------------------------------------|
| `_id`          | ObjectId | Auto-generated                       |
| `email`        | string   | Unique, validated format             |
| `username`     | string   | Unique, trimmed                      |
| `passwordHash` | string   | bcrypt hash (never returned in APIs) |
| `avatarUrl`    | string   | Path to avatar image, or `null`      |
| `createdAt`    | Date     | Account creation timestamp           |

Indexes: unique on `email`, unique on `username`

### `scores`

| Field       | Type     | Description                        |
|-------------|----------|------------------------------------|
| `_id`       | ObjectId | Auto-generated                     |
| `userId`    | string   | References `users._id` (as string) |
| `username`  | string   | Denormalized for display           |
| `score`     | number   | Non-negative integer               |
| `createdAt` | Date     | Score submission timestamp         |

Indexes: descending on `score`, ascending on `userId`
