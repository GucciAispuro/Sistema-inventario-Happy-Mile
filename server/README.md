
# Happy Mile Inventory System Backend

This is the Node.js backend for the Happy Mile Inventory System. It replaces the previous Supabase Edge Functions implementation.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and update the environment variables
4. Start the development server:
   ```
   npm run dev
   ```

## Available Endpoints

### Low Stock Alerts
- `POST /api/low-stock/send-alert` - Send low stock alert emails

### Users
- `POST /api/users/check-users-table` - Check if the users table exists
- `POST /api/users/create-users-table` - Create the users table if it doesn't exist

## Environment Variables

- `DATABASE_URL` - PostgreSQL database connection string
- `JWT_SECRET` - Secret for JWT authentication
- `RESEND_API_KEY` - API key for Resend email service
- `PORT` - Port for the server to listen on (default: 3001)
