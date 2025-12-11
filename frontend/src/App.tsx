import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/Admin';
import PublicTicketView from './pages/PublicTicketView';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import { ShowProvider } from './context/ShowContext';
import { BookingProvider } from './context/BookingContext';
import { useDarkMode } from './hooks/useDarkMode';
import './styles/globals.css';

function AppContent() {
  const { isDarkMode } = useDarkMode();
  return (
    <Router>
      <AuthProvider>
        <MovieProvider>
          <ShowProvider>
            <BookingProvider>
              <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark' : ''}`}>
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/movies" element={<Movies />} />
                    <Route path="/movies/:id" element={<MovieDetails />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/booking/:id" element={<Booking />} />
                    <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
                    <Route path="/ticket/:bookingReference" element={<PublicTicketView />} />
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </BookingProvider>
          </ShowProvider>
        </MovieProvider>
      </AuthProvider>
    </Router>
  );
}

export default function App() {
  return <AppContent />;
}
