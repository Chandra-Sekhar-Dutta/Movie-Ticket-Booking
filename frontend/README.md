# 🎬 BookMyShow Frontend - Modern React Application

A production-ready movie ticket booking frontend built with React 18, TypeScript, and Tailwind CSS. Features a professional dark mode, responsive design, and seamless user experience with real-time seat selection and booking management.

## ✨ Key Features

### User Experience
- **Browse & Search Movies** - Filter by genre, search by title
- **View Show Details** - See upcoming shows with date/time/pricing  
- **Interactive Seat Selection** - Visual seat layout with real-time availability tracking
- **Booking Management** - View booking history, status, and confirmations
- **User Authentication** - Secure sign up and login with JWT tokens
- **Responsive Design** - Optimized for mobile, tablet, and desktop screens

### Design & UI
- **Dark Mode** - Professional dark theme with light/dark mode toggle
- **Modern Components** - Clean, accessible UI components
- **Smooth Animations** - CSS transitions and visual feedback
- **Loading States** - Skeleton screens and loading indicators  
- **Error Handling** - User-friendly error messages and notifications
- **Accessibility** - ARIA labels, keyboard navigation, semantic HTML

### Technical Excellence
- **TypeScript** - Full type safety and IntelliSense
- **Vite** - Lightning-fast development and optimized production builds
- **State Management** - Context API for clean, maintainable state
- **API Integration** - Axios with error handling and interceptors
- **Code Quality** - Clean, well-organized component structure

## 🛠 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18 | UI library |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Build Tool** | Vite 5.4+ | Fast build & dev server |
| **Routing** | React Router v6 | Client-side navigation |
| **HTTP Client** | Axios | API requests with interceptors |
| **Icons** | lucide-react | Beautiful icon library |
| **State** | Context API | State management |
| **Hosting** | Vercel | Serverless deployment |

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Navigation with dark mode toggle
│   │   ├── MovieCard.tsx        # Movie display component
│   │   ├── ShowCard.tsx         # Show details component
│   │   ├── SeatLayout.tsx       # Interactive seat selection
│   │   └── ...                  # Other reusable components
│   ├── hooks/
│   │   ├── useDarkMode.ts       # Dark mode state management
│   │   └── ...                  # Custom hooks
│   ├── pages/
│   │   ├── Home.tsx             # Homepage with featured shows
│   │   ├── Movies.tsx           # Movies browse & search
│   │   ├── MovieDetails.tsx     # Movie information page
│   │   ├── Booking.tsx          # Seat selection interface
│   │   ├── BookingConfirmation.tsx # Order confirmation
│   │   ├── MyBookings.tsx       # User booking history
│   │   ├── Admin.tsx            # Admin management panel
│   │   ├── Profile.tsx          # User profile settings
│   │   ├── Login.tsx            # Login form
│   │   ├── Signup.tsx           # Registration form
│   │   └── PublicTicketView.tsx # Public ticket view
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication context
│   │   └── ...                  # Other contexts
│   ├── services/
│   │   └── apiClient.ts         # Axios instance with interceptors
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── styles/
│   │   └── globals.css          # Global styles & dark mode
│   ├── utils/
│   │   └── helpers.ts           # Utility functions
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config with dark mode
├── tsconfig.json                # TypeScript configuration
├── postcss.config.js            # PostCSS for Tailwind
├── package.json                 # Dependencies & scripts
└── .env.example                 # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:5000`

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16+ and npm/yarn
- **Backend API** running on http://localhost:5000 (for local development)

### Local Development Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   # Local development
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=BookMyShow
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app opens automatically at `http://localhost:5174` with hot module reloading enabled.

### Production Build

```bash
# Build optimized production version
npm run build

# Preview production build locally
npm run preview
```

The production build is created in `dist/` directory ready for deployment.

## 🌙 Dark Mode Implementation

### Features
- **Automatic Detection** - Detects system preference (prefers-color-scheme)
- **Manual Toggle** - Moon/Sun icon in header to switch themes
- **Persistent** - Theme choice saved to localStorage
- **Smooth Transitions** - 300ms CSS transitions between themes

### Color Scheme

**Light Mode:**
- Background: `#f8fafc` (Slate-50)
- Cards: `#ffffff` (White)
- Text: `#111827` (Gray-900)

**Dark Mode:**
- Background: `#111827` (Gray-900)
- Cards: `#1f2937` (Gray-800)
- Text: `#f3f4f6` (Gray-100)

For complete color reference, see [COLOR_SCHEME_REFERENCE.md](../COLOR_SCHEME_REFERENCE.md)

## 🎨 Design System & Accessibility

### Component Library
- Built with Tailwind CSS v4 for consistent styling
- Semantic HTML for better accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators for keyboard users
- Color contrast ratios exceed WCAG AA standards

### Layout
- **Mobile First** - Optimized for small screens first
- **Responsive Breakpoints:**
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px
## 🌐 API Integration

The frontend uses Axios to communicate with the backend API.

### Configuration

```typescript
// src/services/apiClient.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // Include cookies/auth tokens
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Authentication
- JWT tokens automatically injected in Authorization header
- Tokens stored in localStorage
- Auto-logout on 401 Unauthorized responses
- Protected routes require authentication

### Error Handling
- Global error interceptor for consistent handling
- User-friendly error messages
- Toast notifications for API errors
- Network error detection and retry logic

## 🚀 Deployment to Vercel

### Prerequisites
- Vercel account (free tier included)
- GitHub repository with this code
- Backend API deployed (with environment variables set)

### Step 1: Configure Environment Variables

Create `.env.production` in frontend root:

```env
VITE_API_BASE_URL=https://your-backend-api.vercel.app/api
VITE_APP_NAME=BookMyShow
```

### Step 2: Connect to Vercel

Option A - Using Vercel CLI:
```bash
npm install -g vercel
vercel
```

Option B - Using Vercel Dashboard:
1. Go to https://vercel.com/new
2. Import GitHub repository
3. Set environment variables
4. Deploy

### Step 3: Configure Build Settings

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Environment Variables:**
- `VITE_API_BASE_URL` = Your deployed backend URL
- `VITE_APP_NAME` = BookMyShow

### Step 4: Deploy

```bash
vercel --prod
```

Your frontend is now live at `https://your-app.vercel.app`

### Post-Deployment Verification

- ✅ App loads without errors
- ✅ Dark mode toggle works
- ✅ Login/Signup functional
- ✅ Movie browsing works
- ✅ Seat selection displays
- ✅ Booking confirmation shows
- ✅ API calls successful (check Network tab)

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start dev server with HMR

# Production
npm run build            # Build optimized production version
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Check for linting errors
npm run type-check       # TypeScript type checking

# Other
npm run clean            # Remove build artifacts
```

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new account
- [ ] Login with existing account
- [ ] Logout functionality
- [ ] Protected routes redirect to login

**Movies & Shows:**
- [ ] Browse all movies
- [ ] Search movies by title
- [ ] Filter by genre
- [ ] View movie details
- [ ] See upcoming shows

**Booking:**
- [ ] Select show
- [ ] View available seats
- [ ] Select/deselect seats
- [ ] See total price update
- [ ] Book seats (create booking)
- [ ] Confirm booking
- [ ] Booking confirmation page

**User Features:**
- [ ] View booking history
- [ ] View profile information
- [ ] Update profile
- [ ] View public ticket

**Admin Features:**
- [ ] Access admin panel
- [ ] Create new movie
- [ ] Create show for movie
- [ ] View all movies/shows
- [ ] Edit/delete movies

**Responsive Design:**
- [ ] Mobile (320px - 640px)
- [ ] Tablet (640px - 1024px)  
- [ ] Desktop (1024px+)
- [ ] Navigation responsive
- [ ] Forms readable on mobile

**Dark Mode:**
- [ ] Toggle dark mode
- [ ] All components visible in dark mode
- [ ] Theme persists on refresh
- [ ] Smooth transitions

**Performance:**
- [ ] Page loads quickly
- [ ] No console errors
- [ ] Images load properly
- [ ] Smooth animations

## 🔐 Security Practices

- **JWT Authentication** - Secure token-based authentication
- **localStorage** - Safe token storage (vulnerable to XSS, but acceptable for this app)
- **HTTPS** - Use HTTPS in production
- **Input Validation** - Validate all user inputs
- **XSS Protection** - React's built-in protection
- **CORS** - Backend configured for your domain
- **Error Messages** - No sensitive info in errors

## 📊 Performance Optimization

- **Code Splitting** - Route-based code splitting with React.lazy
- **Image Optimization** - Responsive images with proper sizing
- **CSS Optimization** - Tailwind's PurgeCSS removes unused styles
- **Bundle Size** - Vite optimizes and minifies production builds
- **Caching** - Vercel automatically caches assets
- **CDN** - Vercel's global CDN for fast delivery

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Frontend overview |
| `../COLOR_SCHEME_REFERENCE.md` | Complete color palette & design tokens |
| `../CORS_SETUP_GUIDE.md` | CORS configuration for API |
| `../README.md` | Project-wide documentation |

## 🆘 Troubleshooting

### Dev Server Won't Start
```bash
# Check port usage
netstat -ano | findstr :5174

# Kill process on port
taskkill /PID <PID> /F

# Try different port
npm run dev -- --port 3000
```

### API Connection Fails
- Verify backend is running: `http://localhost:5000/health`
- Check `VITE_API_BASE_URL` in `.env`
- Check browser console for CORS errors
- Verify backend CORS_ORIGIN includes your frontend URL

### Dark Mode Not Working
- Check localStorage: `localStorage.getItem('darkMode')`
- Check if 'dark' class on html element
- Clear cache and rebuild

### Styling Issues
```bash
# Rebuild Tailwind
npm run build

# Clear node_modules
rm -r node_modules
npm install
npm run dev
```

### Build Failures
```bash
# Check TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Clear cache
rm -r dist
npm run build
```

## 📄 License

ISC

---

**Status**: ✅ Production Ready  
**Last Updated**: December 12, 2025  
**Deployment**: Vercel (Recommended)  
**Backend**: Node.js + Express + PostgreSQL

- **Type Safety:** Full TypeScript coverage
- **Input Validation:** Client-side form validation
- **XSS Protection:** React's built-in XSS prevention
- **CORS:** Proper CORS headers from backend
- **JWT Tokens:** Secure token-based authentication
- **Error Handling:** Graceful error handling throughout

## 🎯 State Management

The app uses **Context API** for global state:

1. **AuthContext** - User authentication state
2. **MovieContext** - Movies data and filtering
3. **ShowContext** - Shows data and selection
4. **BookingContext** - Booking operations and history

Each context provides:
- State management
- Action handlers
- Error handling
- Loading states

## ✨ Key Features Implementation

### Interactive Seat Selection
- Visual seat grid with availability
- Premium and standard seat types
- Real-time selection with visual feedback
- Price calculation based on seat types
- Prevent double-booking with state management

### Search & Filter
- Debounced search for better performance
- Genre-based filtering
- Date-based filtering for shows
- View mode toggle (grid/list)

### Error Handling
- API error messages displayed to users
- Form validation with error messages
- Network error handling
- Graceful fallbacks for missing data

### Loading States
- Skeleton loaders for better UX
- Full-page loaders for critical operations
- Loading buttons with spinners
- Empty states with helpful messages

## 🚀 Deployment

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm run build
   # Upload dist/ folder to Netlify
   ```

3. **GitHub Pages**
   ```bash
   npm run build
   # Push dist/ to gh-pages branch
   ```

4. **Any Static Host**
   - Run `npm run build`
   - Upload `dist/` folder to your host

### Environment Variables for Production

Set these in your hosting platform:
```
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_APP_NAME=BookMyShow
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Use a different port
npm run dev -- --port 3000
```

### API connection issues
- Check backend is running on port 5000
- Verify `VITE_API_BASE_URL` in `.env`
- Check CORS headers in backend

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Build errors
```bash
# Clear cache and rebuild
npm run build -- --force
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)

## 👨‍💻 Contributing

When adding new features:
1. Create components in `src/components`
2. Add types in `src/types/index.ts`
3. Create context if needed in `src/context`
4. Follow the existing code style
5. Add proper error handling
6. Update README if needed

## 📄 License

ISC License - See LICENSE file for details

## 🎓 Learning Resources

This project demonstrates:
- React 18 with Hooks
- TypeScript interfaces and types
- Context API for state management
- Custom React hooks
- Form handling and validation
- API integration with error handling
- Responsive design with Tailwind CSS
- Component composition and reusability

---

**Created for the Modex Assessment**

For backend documentation, see the `backend/README.md` file.
