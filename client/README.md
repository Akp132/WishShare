# WishShare Client

Frontend application for the WishShare collaborative wishlist platform.

## Features

- Beautiful, responsive design with Tailwind CSS
- Real-time collaboration with Socket.IO
- User authentication and authorization
- Wishlist creation and management
- Item management with images and pricing
- Member invitations and permissions
- Modern UI components with ShadCN/ui

## Tech Stack

- **Next.js 13** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ShadCN/ui** - UI components
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Sonner** - Toast notifications

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

3. Update the environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will run on `http://localhost:3000`

## Project Structure

```
client/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── wishlist/         # Wishlist pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # ShadCN/ui components
│   └── *.tsx             # Custom components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── hooks/                # Custom hooks
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   ├── socket.ts        # Socket.IO client
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

## Pages

### Landing Page (`/`)
- Marketing homepage with features showcase
- Call-to-action buttons for signup/login
- Beautiful gradient design

### Authentication
- `/login` - User login
- `/signup` - User registration
- JWT token-based authentication

### Dashboard (`/dashboard`)
- Overview of user's wishlists
- Statistics cards
- Quick actions
- Owned vs shared wishlists

### Wishlist (`/wishlist/[id]`)
- View and manage wishlist items
- Add new items
- Invite members
- Real-time updates
- Member management

## Key Features

### Real-time Collaboration
- Socket.IO integration for live updates
- Automatic reconnection handling
- Room-based event handling

### Beautiful UI
- Gradient backgrounds and glass-morphism effects
- Smooth animations and transitions
- Responsive design for all devices
- Custom color themes for wishlists

### User Experience
- Loading states and error handling
- Toast notifications for user feedback
- Optimistic updates
- Form validation

## API Integration

The client communicates with the backend through:
- REST API calls using Axios
- Real-time Socket.IO connections
- JWT token authentication
- Automatic token refresh

## Socket.IO Events

The client listens for these real-time events:
- `wishlist_updated` - Wishlist changes
- `item_added` - New items added
- `item_updated` - Item modifications
- `item_deleted` - Item removals
- `item_claimed` - Item claims
- `member_invited` - New member invitations

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom color palette
- Responsive breakpoints
- Animation utilities

### ShadCN/ui
- Modern component library
- Accessible by default
- Customizable themes
- Consistent design system

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables
4. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify
3. Set environment variables

### Manual Build
```bash
npm run build
npm start
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Ensure backend server is running
   - Verify CORS settings

2. **Socket.IO Connection Issues**
   - Check network connectivity
   - Verify backend Socket.IO server is running
   - Check browser console for errors

3. **Build Issues**
   - Clear `.next` folder and rebuild
   - Check for TypeScript errors
   - Verify all dependencies are installed