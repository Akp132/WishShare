# WishShare - Collaborative Wishlist App

A beautiful, real-time collaborative wishlist application built with modern web technologies. Share your wishes with friends and family, and make gift-giving more meaningful.

![WishShare](https://source.unsplash.com/1200x600/?wishlist,gifts)

## ✨ Features

- **Real-time Collaboration** - See updates instantly as items are added, edited, or claimed
- **Beautiful Design** - Modern UI with gradient backgrounds and smooth animations
- **User Authentication** - Secure JWT-based authentication system
- **Wishlist Management** - Create, edit, and delete wishlists with custom colors
- **Item Management** - Add items with images, prices, and descriptions
- **Member Invitations** - Invite friends and family via email
- **Responsive Design** - Works perfectly on all devices
- **Socket.IO Integration** - Real-time updates and notifications

## 🛠️ Tech Stack

### Frontend
- **Next.js 13** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN/ui** - Modern component library
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/wishshare.git
cd wishshare
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
# Edit .env.local with your API URL
npm run dev
```

### 4. Open the Application
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 📱 Screenshots

### Landing Page
Beautiful gradient design with clear call-to-action buttons and feature showcase.

### Dashboard
Overview of all wishlists with statistics and quick actions.

### Wishlist View
Detailed view of wishlist items with real-time collaboration features.

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

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/wishlist-app
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Backend Deployment (Heroku/Render)
1. Create account on Heroku or Render
2. Connect your GitHub repository
3. Set environment variables
4. Deploy automatically

### Frontend Deployment (Vercel/Netlify)
1. Push your code to GitHub
2. Connect repository to Vercel or Netlify
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy automatically

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Wishlist Endpoints
- `GET /api/wishlists` - Get all wishlists
- `POST /api/wishlists` - Create wishlist
- `GET /api/wishlists/:id` - Get specific wishlist
- `PUT /api/wishlists/:id` - Update wishlist
- `DELETE /api/wishlists/:id` - Delete wishlist
- `POST /api/wishlists/:id/invite` - Invite member

### Item Endpoints
- `GET /api/wishlists/:id/items` - Get wishlist items
- `POST /api/wishlists/:id/items` - Add item
- `PUT /api/wishlists/:id/items/:itemId` - Update item
- `DELETE /api/wishlists/:id/items/:itemId` - Delete item
- `POST /api/wishlists/:id/items/:itemId/claim` - Claim item

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6) - Main brand color
- **Secondary**: Purple (#8B5CF6) - Accent color
- **Success**: Emerald (#10B981) - Success states
- **Warning**: Amber (#F59E0B) - Warning states
- **Error**: Red (#EF4444) - Error states

### Typography
- **Font**: Inter - Clean, modern font family
- **Sizes**: Responsive scale from 14px to 48px
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Helmet for security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [ShadCN/ui](https://ui.shadcn.com/) for the beautiful component library
- [Socket.IO](https://socket.io/) for real-time communication
- [Unsplash](https://unsplash.com/) for beautiful stock images

## 📧 Contact

For questions or support, please contact:
- Email: support@wishshare.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/wishshare/issues)

---

Made with ❤️ by the WishShare Team