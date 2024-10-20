# rbac

A monolithic repo for Role-Based Access Control Application Coding Challenge

## Product

The website is live at https://main.dy16qbtn08zme.amplifyapp.com/.

You can sign in with an admin user: `user1`. After signing in, you can create new users and assign roles/permissions to them, and you can also edit or delete existing users. Different roles and permissions will be reflected in the user interface. There are already some users with different permissions created for testing.

For security reasons, the password will be shared in the email only.

## Technologies and Services

| Framework          | Description                                           |
| ------------------ | ----------------------------------------------------- |
| AWS Lambda         | Serverless computing service for backend API services |
| API Gateway        | API management service for backend API services       |
| Next.js and shadcn | Frontend framework for static site generation         |
| AWS Amplify        | Hosting service for Next.js static site               |
| DynamoDB           | NoSQL database service                                |
| CloudWatch         | Monitoring service                                    |
| GitHub Actions     | CI/CD pipeline service                                |

## Breakdown

### Frontend

The frontend is a static site built with Next.js (a React framework) and shadcn/ui. Hosted on AWS Amplify, it features a login page, a main page, and a protected example page. The user badge in the top-right corner of the header dynamically updates to reflect the currently logged-in user. Authentication is managed using a custom Auth context and hook. State management is handled efficiently through React's useContext, useState, and useEffect hooks. The user interface is meticulously crafted using shadcn/ui components, ensuring a polished and consistent user experience.

To run the frontend locally, change directory to `rbac` and run `npm install` to install the dependencies, then `npm run dev` to start the development server.

### Backend

The backend is powered by AWS Lambda functions triggered by API Gateway. CRUD operations for users, roles, and permissions are implemented using Python-based Lambda functions, with data persistently stored in DynamoDB. The endpoints for user CRUD includes:

- `GET api/v1/users` for getting all users
- `POST api/v1/users` for creating a new user
- `PUT api/v1/users` for updating an existing user
- `DELETE api/v1/users` for deleting an existing user

The endpoints for authentication includes:

- `POST api/v1/auth/login` for user login
- `GET api/v1/auth/check` for checking if the user is logged in
- `POST api/v1/auth/logout` for user logout

JWT tokens are generated using the jose library, with a fixed expiration time in 30 minutes. Passwords are securely hashed before storage in the database. The system adopts cookie-based authentication. Since the API Gateway is on a different host, appropriate CORS configurations have been added. Cookies are set with the `Secure`, `SameSite=None`, and `HttpOnly` flags for the CORS purpose.

In addition to client-side access checks, all CRUD operations are safeguarded by user permission verification on the backend, ensuring a robust, multi-layered security approach.

### Database

The database is DynamoDB. The users table has a global secondary index on the username field for efficient querying. The table schema is as follows:

| Field Name    | Data Type | Description                       |
| ------------- | --------- | --------------------------------- |
| id            | Number    | Unique identifier for the user    |
| name          | String    | Name of the user                  |
| username      | String    | Unique username for the user      |
| email         | String    | Email address of the user         |
| phone         | String    | Phone number of the user          |
| website       | String    | Website of the user               |
| role          | String    | Role of the user (Admin or Staff) |
| password_hash | String    | Hashed password of the user       |
| permissions   | List      | List of permissions for the user  |

### CI/CD

The frontend deployment is powered by Amplity. The CI/CD pipeline is configured in the `amplify.yml` file. Any push to the `main` branch will trigger the pipeline to deploy the frontend to AWS Amplify. This should be changed to only the tagged commit triggering the deployment in the future.

The backend deployment is powered by GitHub Actions. The workflow is configured in the `.github/workflows/deploy-lambda.yml` file. Any tag push to the `main` branch will trigger the pipeline to deploy the backend to AWS Lambda.

### Future Work

- Add unit tests
- Use AWS Cognito for authentication, instead of handling it manually
- Add monitoring and observability using AWS CloudWatch
- Add more comprehensive CI/CD pipeline
- Add more comprehensive error handling and logging
- Use the same domain for frontend and backend, so that the cookies can be shared
- Separate the repo into multiple smaller repos
