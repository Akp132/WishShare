# WishShare - Collaborative Wishlist App

A beautiful, real-time collaborative wishlist application built with modern web technologies. Share your wishes with friends and family, and make gift-giving more meaningful.

[Live Demo](https://wish-share.vercel.app/) | [GitHub Repo](https://github.com/Akp132/WishShare)



## ✨ Features

- **Real-time Collaboration** - See updates instantly as items are added, edited, or claimed
- **Beautiful Design** - Modern UI with gradient backgrounds and smooth animations
- **User Authentication** - Secure JWT-based authentication system
- **Wishlist Management** - Create, edit, and delete wishlists with custom colors
- **Item Management** - Add items with images, prices, and descriptions
- **Member Invitations** - Invite friends and family via email (mocked for demo)(no email sent but feature works)
- **Attribution** - See who added each item
- **Comments & Emoji Reactions** - Real-time comments and reactions on wishlist items
- **Responsive Design** - Works perfectly on all devices
- **Socket.IO Integration** - Real-time updates and notifications

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN/ui** - Modern component library (Radix UI-based)
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet, CORS** - Security

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Akp132/WishShare.git
cd WishShare
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Setup Frontend
```bash
cd ../client
npm install
cp .env.example .env.local
# Edit .env.local with your API URL (e.g., http://localhost:5001)
npm run dev
```

### 4. Open the Application
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5001](http://localhost:5001)

## 🔧 Environment Variables

### Backend (`server/.env`)
```
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
PORT=5001
CLIENT_URL=http://localhost:3000
```

### Frontend (`client/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

## 📚 API Overview

- `POST /api/auth/signup` – Register new user
- `POST /api/auth/login` – Login user
- `GET /api/auth/me` – Get current user
- `GET/POST/PUT/DELETE /api/wishlists` – CRUD for wishlists
- `GET/POST/PUT/DELETE /api/wishlists/:id/items` – CRUD for wishlist items
- `POST /api/wishlists/:id/invite` – Invite member (mocked)
- `POST /api/wishlists/:id/items/:itemId/comments` – Add comment
- `POST /api/wishlists/:id/items/:itemId/reactions` – Add emoji reaction

## ⚡ Assumptions & Limitations

- **Invitations** are mocked (no real email sending in demo).
- **Authentication** uses JWT; no OAuth/social login.
- **Images** are by URL only (no file uploads).
- **No payment or checkout integration** (wishlist only).
- **Scaling**: Designed for small/medium groups; for high scale, add pagination, rate limiting, and cloud storage.
- **Security**: Basic protections (JWT, bcrypt, CORS, Helmet); not penetration-tested for production.

## 📱 Screenshots

- **Landing Page** – Modern, gradient design with feature highlights
- **Dashboard** – All wishlists, quick actions, and stats
- **Wishlist View** – Real-time item, comment, and reaction updates

## 🗂️ Project Structure

```
wishshare/
├── server/                 # Backend API
│   ├── models/            # MongoDB models
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
├── client/                # Frontend application
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities and API
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Helmet for security headers

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [ShadCN/ui](https://ui.shadcn.com/) for the beautiful component library
- [Socket.IO](https://socket.io/) for real-time communication
- [Unsplash](https://unsplash.com/) for beautiful stock images

---

Made with ❤️ by the WishShare Team