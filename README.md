# Frontend - Authentication & Permission Management App

Next.js frontend application with authentication and permission management (groups, endpoints, and access control).

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Components:** ShadcnUI
- **Styling:** Tailwind CSS

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the `.env.test_` file to `.env`:

```bash
cp .env.test_ .env
```

The `.env` file contains:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start the Backend

Make sure the backend server is running on `http://localhost:3000` before starting the frontend.

From the project root:
```bash
cd backend
npm run start:dev
```

### 4. Start the Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:3001` (or the next available port).

## Features

### Pages

#### Authentication Pages
- **`/`** - Home page (redirects to signin or dashboard based on auth state)
- **`/signup`** - User registration page
- **`/signin`** - User login page
- **`/dashboard`** - Protected dashboard with navigation and signout functionality

#### Management Pages (Admin Only)
- **`/groups`** - Group management (create and delete groups)
- **`/endpoints`** - Endpoint management (create and delete API endpoints)
- **`/permissions`** - Permission management (manage user-group and endpoint-group relationships)

### Authentication Flow

1. **Sign Up**: Create a new account with email and password (first user becomes admin)
2. **Sign In**: Login with credentials, receive JWT tokens
3. **Dashboard**: View protected content with navigation to management pages
4. **Sign Out**: Logout and clear tokens

### Group Management

- Create new groups with unique names
- Delete groups (only if no users are assigned)
- View list of existing groups

### Endpoint Management

- Create new endpoints with:
  - Description
  - Path (e.g., `/api/users`)
  - HTTP Method (GET, POST, PUT, DELETE, PATCH)
  - Public flag (if endpoint is accessible to everyone)
- Delete endpoints (only if not assigned to any groups)
- View list of existing endpoints

### Permission Management

**Endpoint-Group Permissions:**
- Add endpoints to groups (grants group members access to endpoint)
- Remove endpoints from groups (revokes group access to endpoint)

**User-Group Permissions:**
- Add users to groups (grants users access to group's endpoints)
- Remove users from groups (revokes user access to group's endpoints)

### Key Components

- **AuthContext** (`src/contexts/AuthContext.tsx`): Global authentication state management
- **AuthService** (`src/services/authService.ts`): Authentication API calls
- **GroupService** (`src/services/groupService.ts`): Group management API calls
- **EndpointService** (`src/services/endpointService.ts`): Endpoint management API calls
- **ProtectedRoute** (`src/components/ProtectedRoute.tsx`): Route guard for authenticated pages

### Token Storage

- Access tokens and refresh tokens are stored in `localStorage`
- Tokens are automatically included in API requests
- Tokens are cleared on signout

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Protected dashboard with navigation
│   │   ├── groups/
│   │   │   └── page.tsx          # Groups management page
│   │   ├── endpoints/
│   │   │   └── page.tsx          # Endpoints management page
│   │   ├── permissions/
│   │   │   └── page.tsx          # Permissions management page
│   │   ├── signin/
│   │   │   └── page.tsx          # Sign in page
│   │   ├── signup/
│   │   │   └── page.tsx          # Sign up page
│   │   ├── layout.tsx            # Root layout with AuthProvider
│   │   ├── page.tsx              # Home page (redirects)
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── ui/                   # ShadcnUI components
│   │   └── ProtectedRoute.tsx   # Route protection component
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   └── services/
│       ├── authService.ts       # Authentication API service
│       ├── groupService.ts      # Group management API service
│       └── endpointService.ts   # Endpoint management API service
├── .env.test_                    # Environment template
└── package.json
```

## Usage Notes

### Getting Resource IDs

To use the permissions page, you'll need IDs for users, groups, and endpoints:

- **Group IDs**: Created groups display their IDs in the Groups page table
- **Endpoint IDs**: Created endpoints display their IDs in the Endpoints page table
- **User IDs**: Available in the JWT token payload after signin (decode the accessToken)

### Admin Requirements

All management pages (groups, endpoints, permissions) require admin authentication. The first user to sign up automatically becomes an admin.

## Coding Standards

- **One dot per line**: All method chains use one dot per line
- **Semantic naming**: Complete, descriptive variable and function names in camelCase
- **KISS principle**: Simple, clean code prioritized over complex patterns
