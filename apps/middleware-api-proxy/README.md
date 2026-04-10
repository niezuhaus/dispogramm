# API Proxy Server

This project sets up a simple Express.js server that acts as an API proxy to avoid CORS errors in the browser. It forwards requests to a specified target API and returns the responses back to the client.

## Project Structure

```
api-proxy-server
├── src
│   ├── app.js               # Entry point of the application
│   ├── routes
│   │   └── proxy.js         # Defines proxy routes for the API
│   └── middlewares
│       └── cors.js          # Middleware for handling CORS requests
├── package.json              # npm configuration file
├── .env                      # Environment variables for server configuration
└── README.md                 # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd api-proxy-server
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and specify the target API URL:
   ```
   TARGET_API_URL=<your-target-api-url>
   ```

## Usage

To start the server, run:
```
npm start
```

The server will be running on `http://localhost:3000` by default. You can now make requests to the proxy server, which will forward them to the target API.

## License

This project is licensed under the MIT License.