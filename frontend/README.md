# TechFolio — Frontend

React-based frontend for TechFolio.

## Quick start

1. If the backend runs at a different URL, update the API base in `frontend/src/services/api.js` (default: `http://localhost:5000/api`).

2. Install and run:

```bash
cd frontend
npm install
npm start
```

3. Open the app in your browser: `http://localhost:3000`

## Key flows

- Register / Login: users create accounts and receive a token stored in `localStorage` under `token`.
- Profile: users can edit their profile and add skills/certifications.
- Add Project: on your own profile click `+ إضافة مشروع جديد`, fill the form and optionally upload images. The frontend sends a multipart `FormData` to the backend.
- Project Detail: shows images (or a default image), links, ratings and a Share modal (copy, social sharing, native share).

## Files of interest

- `src/services/api.js` — axios instance and grouped API helpers (`authAPI`, `usersAPI`, `projectsAPI`).
- `src/context/AuthContext.js` — auth state, login/register methods.
- `src/pages/Profile.js` — profile UI and project creation modal.
- `src/pages/ProjectDetail.js` — project detail, sharing and rating UI.
- `public/default-project.svg` — default image shown when a project has no images.

## Testing the API

- Import `postman_collection.json` from the repository root into Postman to test the backend endpoints (set `{{baseUrl}}` to your backend URL and add `{{token}}` after login).

## Production notes

- Build: `npm run build` will create optimized static assets.
- When deploying, ensure the frontend's API base URL points to the production backend and that `CORS` and HTTPS are configured on the backend.
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
