import html2pdf from 'html2pdf.js';
import { Booking } from '../types';

export const generateTicketPDF = (booking: Booking, movieName?: string, showDetails?: string) => {
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="
      font-family: Arial, sans-serif;
      padding: 20px;
      background: white;
      border-radius: 8px;
      max-width: 600px;
    ">
      <div style="
        text-align: center;
        border-bottom: 3px solid #1f2937;
        padding-bottom: 20px;
        margin-bottom: 20px;
      ">
        <h1 style="
          margin: 0;
          color: #ef4444;
          font-size: 28px;
          font-weight: bold;
        ">🎬 BookMyShow</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Your Digital Ticket</p>
      </div>

      <div style="
        background: #f3f4f6;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 20px;
        text-align: center;
      ">
        <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">BOOKING REFERENCE</p>
        <p style="
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          letter-spacing: 2px;
        ">${booking.bookingReference}</p>
      </div>

      <div style="
        border: 2px dashed #ccc;
        padding: 15px;
        margin-bottom: 20px;
      ">
        <div style="margin-bottom: 15px;">
          <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; font-weight: bold;">MOVIE</p>
          <p style="margin: 0; font-size: 16px; color: #1f2937; font-weight: bold;">${movieName || 'Movie TBD'}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; font-weight: bold;">SEATS BOOKED</p>
            <p style="margin: 0; font-size: 18px; color: #3b82f6; font-weight: bold;">${(booking.seats || []).join(', ')}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; font-weight: bold;">TOTAL SEATS</p>
            <p style="margin: 0; font-size: 18px; color: #3b82f6; font-weight: bold;">${booking.totalSeats}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; font-weight: bold;">SHOW DATE & TIME</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937;">${showDetails || 'TBD'}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 12px; font-weight: bold;">BOOKING DATE</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937;">${new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div style="
        background: #dcfce7;
        border-left: 4px solid #22c55e;
        padding: 12px;
        margin-bottom: 20px;
      ">
        <p style="margin: 0; color: #166534; font-size: 13px; font-weight: bold;">✓ ${booking.status}</p>
      </div>

      <div style="
        background: #fef3c7;
        border-left: 4px solid #eab308;
        padding: 12px;
        margin-bottom: 20px;
      ">
        <p style="margin: 0 0 10px 0; color: #854d0e; font-size: 12px; font-weight: bold;">IMPORTANT NOTES</p>
        <ul style="margin: 0; padding-left: 20px; color: #854d0e; font-size: 11px;">
          <li>Please arrive 15 minutes before the show</li>
          <li>Keep this ticket handy</li>
          <li>Entry is only with valid ticket & ID</li>
          <li>Cancellation allowed up to 1 hour before show</li>
        </ul>
      </div>

      <div style="
        border-top: 3px solid #1f2937;
        padding-top: 15px;
        text-align: center;
      ">
        <p style="margin: 0; color: #666; font-size: 12px;">Amount Paid: <span style="font-weight: bold; color: #1f2937;">₹${booking.totalAmount}</span></p>
        <p style="margin: 10px 0 0 0; color: #999; font-size: 10px;">Generated on ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  const options: any = {
    margin: [8, 8, 8, 8] as [number, number, number, number],
    filename: `ticket-${booking.bookingReference}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };

  html2pdf().set(options).from(element).save();
};
