# zlagoda-client

This app forms the frontend of the zlagoda project. Built with React, TypeScript, and Vite.

## Requirements

- Node.js 18+
- npm or yarn

## Getting Started

1. Install Dependencies

    ```bash
    npm install
    # or
    yarn install
    ```

2. Start Development Server

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    The application will be available at `http://localhost:3000`

3. Build for Production

    ```bash
    npm run build
    # or
    yarn build
    ```

4. To update api client & schemas based on backend OpenAPI spec, run:

    ```bash
    npm run generate:api
    # or
    yarn generate:api
    ```

    Generated results will be in `./src/generated/api.ts`
