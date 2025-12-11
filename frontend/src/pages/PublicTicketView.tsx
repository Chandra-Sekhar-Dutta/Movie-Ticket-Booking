import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Download, Share2, Copy } from 'lucide-react';
import { Loading } from '../components/UIElements';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import { generateTicketPDF } from '../utils/pdfGenerator';
import { apiClient } from '../services/api';
import { Booking } from '../types';

export const PublicTicketView: React.FC = () => {
  const { bookingReference } = useParams<{ bookingReference: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [movieTitle, setMovieTitle] = useState<string>('');
  const [showDetails, setShowDetails] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        if (!bookingReference) {
          setError('Invalid booking reference');
          setIsLoading(false);
          return;
        }

        // Fetch booking by reference
        const response = await apiClient.getBookingByReference(bookingReference);
        const bookingData = response.data;
        
        if (!bookingData) {
          setError('Booking not found');
          setIsLoading(false);
          return;
        }
        
        setBooking(bookingData);

        // Fetch show details
        const showResponse = await apiClient.getShowWithSeats(bookingData.showId);
        const showData = showResponse.data;
        
        if (showData) {
          setShowDetails(formatDateTime(showData.date, showData.showTime));

          // Fetch movie details
          if (showData.movieId) {
            const movieResponse = await apiClient.getMovieById(showData.movieId);
            const movieData = movieResponse.data;
            if (movieData) {
              setMovieTitle(movieData.title);
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading ticket:', err);
        setError('Ticket not found. Please check the booking reference.');
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingReference]);

  const copyToClipboard = () => {
    if (booking?.bookingReference) {
      navigator.clipboard.writeText(booking.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <Loading text="Loading ticket details..." />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-light dark:bg-gray-900 flex items-center justify-center">
        <div className="container max-w-2xl text-center">
          <div className="card p-8">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Ticket Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The ticket you are looking for does not exist.'}</p>
            <a href="/" className="btn btn-primary">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-gray-900">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12">
        <div className="container text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Booking Details</h1>
          <p className="text-blue-100 mt-2">View shared ticket information</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Ticket Card */}
          <div className="card p-8 mb-8">
            {/* Booking Reference */}
            <div className="text-center mb-8 pb-8 border-b border-gray-200">
              <p className="text-gray-600 mb-2">Booking Reference</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-3xl font-bold text-primary">{booking.bookingReference}</p>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {copied && <p className="text-sm text-green-600 mt-2">✓ Copied to clipboard</p>}
              <p className="text-sm text-gray-500 mt-2">Save this for your records</p>
            </div>

            {/* Movie Info */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="font-bold text-lg text-primary mb-4">Booking Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Movie</p>
                  <p className="font-semibold text-primary">{movieTitle || 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-primary">{showDetails || 'Loading...'}</p>
                </div>
              </div>
            </div>

            {/* Seats */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="font-bold text-lg text-primary mb-4">Seats Booked</h3>
              <div className="flex gap-3 flex-wrap">
                {booking.seats.map((seat) => (
                  <div
                    key={seat}
                    className="px-4 py-3 bg-secondary text-white rounded-lg font-semibold text-center"
                  >
                    {seat}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="font-bold text-lg text-primary mb-4">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>{booking.totalSeats} Seats</span>
                  <span>{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Convenience Fee</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-primary border-t border-gray-200 pt-2 mt-2">
                  <span>Total Amount</span>
                  <span>{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Status</p>
              <div className={`inline-block px-4 py-2 rounded-full font-semibold ${
                booking.status === 'CONFIRMED' 
                  ? 'bg-green-100 text-green-800' 
                  : booking.status === 'FAILED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.status === 'CONFIRMED' ? '✓' : '!'} {booking.status}
              </div>
            </div>

            {/* Important Notes */}
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-900 mb-2">Important Notes</p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Please arrive 15 minutes before the show</li>
                <li>• Keep your booking reference handy</li>
                <li>• Entry is only with valid ticket & ID</li>
                <li>• Cancellation is allowed up to 1 hour before show</li>
              </ul>
            </div>

            {/* Booking Date */}
            <div className="mb-8 text-sm text-gray-600">
              <p>Booked on: {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}</p>
            </div>

            {/* Actions - Download only for confirmed bookings */}
            {booking.status === 'CONFIRMED' && (
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    generateTicketPDF(booking, movieTitle || 'Movie', showDetails || 'Show TBD');
                  }}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Ticket (PDF)
                </button>
                <button 
                  onClick={() => {
                    const shareUrl = window.location.href;
                    if (navigator.share) {
                      navigator.share({
                        title: 'BookMyShow Ticket',
                        text: `Check out my booking! Booking Reference: ${booking.bookingReference}`,
                        url: shareUrl,
                      }).catch(() => {
                        navigator.clipboard.writeText(shareUrl);
                        alert('Link copied to clipboard!');
                      });
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      alert('Shareable link copied to clipboard!');
                    }
                  }}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            )}

            {/* Message for non-confirmed bookings */}
            {booking.status !== 'CONFIRMED' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800">
                  {booking.status === 'PENDING' 
                    ? 'Your booking is being processed. Please wait...'
                    : 'This booking is not available for download.'}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-center">
            <a href="/" className="btn btn-secondary btn-lg">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicTicketView;
