# TechFolio — Backend

Lightweight Express + MongoDB API for TechFolio.

## Quick start

1. Copy `.env.example` to `.env` (or create `.env`) and set values:

```
MONGODB_URI=mongodb://localhost:27017/techfolio
JWT_SECRET=your_jwt_secret
PORT=5000
```

2. Install dependencies and run server:

```bash
cd backend
npm install
npm run dev    # uses nodemon
```

3. API base URL:

- Development: `http://localhost:5000/api`

## Important endpoints

- `POST /api/auth/register` — register (body: name, email, password)
- `POST /api/auth/login` — login (body: email, password)
- `GET /api/auth/me` — current user (Authorization: Bearer <token>)
- `GET /api/users` — list public users
- `GET /api/users/:id` — get user profile
- `PUT /api/users/profile` — update own profile (protected)
- `GET /api/projects` — list public projects
- `GET /api/projects/:id` — project detail
- `POST /api/projects` — create project (protected, multipart/form-data, field `images` for files)
- `PUT /api/projects/:id` — update project (protected, supports additional images)
- `DELETE /api/projects/:id` — delete project (protected)
- `POST /api/projects/:id/rate` — add rating (protected)

## Uploads

- Uploaded images are stored under `backend/src/uploads` and served at `/uploads` (e.g. `http://localhost:5000/uploads/<filename>`).

## Notes & Next steps

- For production, consider moving image storage to cloud (S3) and using a CDN. Add image validation and resizing (e.g. `sharp`).
- See `postman_collection.json` at the repository root for example API calls.

## Troubleshooting

- If `npm install` fails for a package version, ensure your `npm` registry is `https://registry.npmjs.org/` and try `npm cache clean --force`.
