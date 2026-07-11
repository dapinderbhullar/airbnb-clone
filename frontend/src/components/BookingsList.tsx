"use client";

import { useState } from "react";

type Booking = {
  id: number;
  listing_id: number;
  guest_name: string;
  check_in: string;
  check_out: string;
  total_price: number;
};

export default function BookingsList({
  initialBookings,
}: {
  initialBookings: Booking[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function cancelBooking(bookingId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancellingId(bookingId);
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Could not cancel booking");
        return;
      }

      setBookings((current) =>
        current.filter((booking) => booking.id !== bookingId)
      );

      setMessage("Booking cancelled successfully");
    } catch {
      setMessage("Could not connect to the backend");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <>
      {message && (
        <p className="mb-6 rounded-xl bg-white p-4 text-center font-medium shadow">
          {message}
        </p>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <article
            key={booking.id}
            className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-xl font-bold">
                {booking.guest_name}
              </h2>

              <p className="mt-1 text-gray-500">
                Listing #{booking.listing_id}
              </p>

              <p className="mt-2">
                {booking.check_in} → {booking.check_out}
              </p>

              <p className="mt-2 font-semibold">
                ₹{booking.total_price.toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => cancelBooking(booking.id)}
              disabled={cancellingId === booking.id}
              className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600 disabled:bg-gray-400"
            >
              {cancellingId === booking.id
                ? "Cancelling..."
                : "Cancel Booking"}
            </button>
          </article>
        ))}

        {bookings.length === 0 && (
          <p className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">
            You have no bookings.
          </p>
        )}
      </div>
    </>
  );
}