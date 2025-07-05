# WishShare Server

Backend API for the WishShare collaborative wishlist application.

## Features

- User authentication with JWT tokens
- Wishlist creation and management
- Item management within wishlists
- Real-time updates with Socket.IO
- Member invitations and permissions
- Secure API endpoints with rate limiting

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update the environment variables:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure secret for JWT tokens
   - `CLIENT_URL` - Your frontend URL (for CORS)

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Wishlists
- `GET /api/wishlists` - Get all wishlists for current user
- `POST /api/wishlists` - Create a new wishlist
- `GET /api/wishlists/:id` - Get specific wishlist
- `PUT /api/wishlists/:id` - Update wishlist
- `DELETE /api/wishlists/:id` - Delete wishlist
- `POST /api/wishlists/:id/invite` - Invite user to wishlist

### Items
- `GET /api/wishlists/:wishlistId/items` - Get all items in wishlist
- `POST /api/wishlists/:wishlistId/items` - Add item to wishlist
- `PUT /api/wishlists/:wishlistId/items/:itemId` - Update item
- `DELETE /api/wishlists/:wishlistId/items/:itemId` - Delete item
- `POST /api/wishlists/:wishlistId/items/:itemId/claim` - Claim item

## Real-time Events

The server emits the following Socket.IO events:
- `wishlist_created` - When a new wishlist is created
- `wishlist_updated` - When wishlist is modified
- `wishlist_deleted` - When wishlist is deleted
- `item_added` - When item is added to wishlist
- `item_updated` - When item is modified
- `item_deleted` - When item is deleted
- `item_claimed` - When item is claimed
- `member_invited` - When new member is invited

## Database Schema

### User
- `email` - Unique email address
- `password` - Hashed password
- `displayName` - User's display name
- `avatarUrl` - Profile picture URL
- `createdAt` - Account creation date
- `updatedAt` - Last update date

### Wishlist
- `name` - Wishlist name
- `description` - Optional description
- `ownerId` - Reference to User who owns the wishlist
- `members` - Array of members with roles
- `isPublic` - Public visibility flag
- `color` - Theme color
- `createdAt` - Creation date
- `updatedAt` - Last update date

### Item
- `wishlistId` - Reference to Wishlist
- `name` - Item name
- `description` - Optional description
- `imageUrl` - Item image URL
- `price` - Item price
- `currency` - Price currency
- `url` - External URL
- `priority` - Priority level (low, medium, high)
- `status` - Item status (available, claimed, purchased)
- `claimedBy` - Reference to User who claimed item
- `addedBy` - Reference to User who added item
- `editedBy` - Reference to User who last edited item
- `createdAt` - Creation date
- `updatedAt` - Last update date

## Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS configuration
- Input validation
- Helmet for security headers

## Deployment

### MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in your environment variables

### Heroku
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables
4. Deploy automatically

## Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests