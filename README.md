# Express Prisma JWT Auth

A simple authentication API built with Node.js, Express, Prisma, and JWT.

## Technologies

- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [JWT](https://jwt.io/)
- [PostgreSQL](https://www.postgresql.org/)

# Setup

1. Install dependencies
    ```bash
    npm install
    ```
   
2. Create a PostgreSQL database

3. Create a `.env` file in the root directory and add the environment variables listed in the `.env.example` file

4. Run the migrations
    ```bash
    npx prisma migrate dev
    ```

5. Run the server
    ```bash
    npm run dev
    ```
