# Dropbox

A file storage web app for storing files in the Cloud. Users can register, log in, and upload, download, rename, star and delete their files.

- `backend/` is an Express API. It stores data in MySQL, and files on local disk or in Amazon S3.
- `frontend/` is a React app.

## Run it locally

You need Node 24 and Docker.

Start MySQL:

```sh
docker compose up -d
```

Then start the backend:

```sh
cd backend
cp .env.example .env
npm install

# Add the sample data
npm run db:seed

# Start the API on http://localhost:3000
npm run dev
```

The API restarts by itself when you change a file in `backend/`.

In another terminal, start the frontend:

```sh
cd frontend
cp .env.example .env
npm install

# Start the frontend on http://localhost:5173
npm run dev
```

Open http://localhost:5173 and log in as one of the sample users. You can check the API is running at http://localhost:3000/health.

`npm run db:seed` seeds the database with three sample users and sample files. They all have the password `password123`:

- `alice@example.com`
- `bob@example.com`
- `charlie@example.com`

## Scripts

Run these in `backend/`:

| Command                | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Starts the API, and restarts it when you change a file         |
| `npm start`            | Starts the API                                                 |
| `npm run db:seed`      | Deletes all data, creates the tables and adds the sample users |
| `npm run db:migrate`   | Runs any new migrations in `db/migrations`                     |
| `npm run db:generate`  | Writes a new migration after you change `src/schema.js`        |
| `npm run lint`         | Checks the code for mistakes with ESLint                       |
| `npm run format`       | Formats the code with Prettier                                 |
| `npm run format:check` | Checks the code is formatted, without changing it              |

Run these in `frontend/`:

| Command                | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Starts the frontend, and reloads the page when you change a file   |
| `npm run build`        | Builds the frontend into `dist/`, using `VITE_API_URL` from `.env` |
| `npm run preview`      | Serves the built frontend from `dist/`, to check it                |
| `npm run lint`         | Checks the code for mistakes with ESLint                           |
| `npm run format`       | Formats the code with Prettier                                     |
| `npm run format:check` | Checks the code is formatted, without changing it                  |

## Try the API

`backend/openapi.yaml` is an OpenAPI spec of all of the endpoints. Import it into a REST API client like Postman to get a request for each one.

If using Postman, in the import settings, set "Parameter generation" to "Example" so the requests use the sample users.

Most requests need you to be logged in. Send the "Log in" request, and copy the `token` from its response. Then open the collection's Authorization tab, choose "Bearer Token", and paste the token in. Every request in the collection then sends it. Tokens expire after 7 days.

## Code conventions

- Request and response bodies use snake_case, e.g. `first_name`. JavaScript variables use camelCase.
- Rows from the database keep their column names, e.g. `user.avatar_key`, but `req.user` uses camelCase, e.g. `req.user.avatarKey`.
- The frontend uses the API's field names as they are, e.g. `user.first_name`.
- The API sends each record's UUID as `id`. The numeric database id (`req.user.internalId`) is only used in SQL queries.

## AWS deployment

The Dropbox application is hosted on AWS using an EC2 instance which runs two separate Docker containers. The frontend container uses Nginx to serve the React application, while the backend container uses Node.js and Express to handle API requests.

Both containers communicate using an internal Docker network called dropbox-network. The Docker images are stored in Amazon ECR and downloaded by EC2 during deployment.

Amazon RDS provides the MySQL database for user information and file metadata, while Amazon S3 stores uploaded files. CloudFront provides HTTPS access, and Route 53 connects the application's custom domain to CloudFront.

## CI/CD deployment

GitHub Actions is used to automate code checks and deployments.

The project contains three main workflows:
Dropbox CI (checks.yml): Runs automated checks on the frontend and backend when code is pushed or a pull request is created.

Dropbox Publish (publish.yml): Builds and uploads Docker images to Amazon ECR after successful checks on the main branch, then triggers deployment to EC2.

Dropbox Rollback (rollback.yml): Allows an authorised developer to manually restore a previous application version.

## Rollback

During deployment, the deploy.sh script performs health checks to verify that the frontend and backend are responding. If the deployment fails these checks, the script attempts to restore the previous version.

Developers can also manually trigger the Dropbox Rollback workflow through GitHub Actions and restore a previous version using its Git commit SHA.