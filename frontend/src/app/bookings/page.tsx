"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  listing_id: number;
  guest_name: string;
  check_in: string;
  check_out: string;
  total_price: number;
};

export default function BookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          setMessage(data.detail || "Could not load bookings");
          return;
        }

        setBookings(data);
      } catch {
        setMessage("Could not connect to the backend");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [router]);

  async function cancelBooking(bookingId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    setCancellingId(bookingId);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setMessage(data.detail || "Could not cancel booking");
        return;
      }

      setBookings((currentBookings) =>
        currentBookings.filter(
          (booking) => booking.id !== bookingId
        )
      );

      setSuccess(true);
      setMessage("Booking cancelled successfully");
    } catch {
      setMessage("Could not connect to the backend");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              My Bookings
            </h1>

            <p className="mt-2 text-gray-500">
              View and manage your reservations
            </p>
          </div>

          <Link
            href="/"
            className="font-medium text-rose-500 hover:text-rose-600"
          >
            ← Home
          </Link>
        </div>

        {message && (
          <p
            className={`mb-6 rounded-xl p-4 text-center font-medium ${
              success
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        {loading ? (
          <p className="text-center text-lg text-gray-500">
            Loading bookings...
          </p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {booking.guest_name}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    Property #{booking.listing_id}
                  </p>

                  <p className="mt-2 text-gray-700">
                    {booking.check_in} → {booking.check_out}
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
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
              <div className="rounded-xl bg-white p-10 text-center shadow">
                <p className="text-gray-500">
                  You have no bookings.
                </p>

                <Link
                  href="/"
                  className="mt-4 inline-block rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600"
                >
                  Explore properties
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}