"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type BookingFormProps = {
  listingId: number;
  price: number;
};

export default function BookingForm({
  listingId,
  price,
}: BookingFormProps) {
  const router = useRouter();

  const [guestName, setGuestName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setSuccess(false);
      setMessage("Please log in before making a booking.");

      setTimeout(() => {
        router.push("/login");
      }, 800);

      return;
    }

    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            listing_id: listingId,
            guest_name: guestName,
            check_in: checkIn,
            check_out: checkOut,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        setMessage("Your session expired. Please log in again.");

        setTimeout(() => {
          router.push("/login");
        }, 800);

        return;
      }

      if (!response.ok) {
        setMessage(data.detail || "Booking failed");
        return;
      }

      setSuccess(true);
      setMessage(
        `Booking successful! Total price: ₹${Number(
          data.total_price
        ).toLocaleString()}`
      );

      setGuestName("");
      setCheckIn("");
      setCheckOut("");
    } catch {
      setMessage("Could not connect to the backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-fit rounded-2xl border bg-white p-6 shadow-lg"
    >
      <p>
        <span className="text-2xl font-bold text-gray-900">
          ₹{price.toLocaleString()}
        </span>{" "}
        <span className="text-gray-500">/ night</span>
      </p>

      <label
        htmlFor="guest-name"
        className="mt-5 block text-sm font-semibold text-gray-900"
      >
        Guest name
      </label>

      <input
        id="guest-name"
        type="text"
        value={guestName}
        onChange={(event) => setGuestName(event.target.value)}
        required
        placeholder="Enter your name"
        className="mt-2 w-full rounded-xl border px-3 py-2 text-gray-900 outline-none focus:border-rose-500"
      />

      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border">
        <div className="border-r p-3">
          <label
            htmlFor="check-in"
            className="text-xs font-bold uppercase text-gray-700"
          >
            Check-in
          </label>

          <input
            id="check-in"
            type="date"
            value={checkIn}
            onChange={(event) => setCheckIn(event.target.value)}
            required
            className="mt-1 w-full text-sm text-gray-900 outline-none"
          />
        </div>

        <div className="p-3">
          <label
            htmlFor="check-out"
            className="text-xs font-bold uppercase text-gray-700"
          >
            Check-out
          </label>

          <input
            id="check-out"
            type="date"
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
            required
            className="mt-1 w-full text-sm text-gray-900 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-xl bg-rose-500 px-8 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loading ? "Booking..." : "Reserve"}
      </button>

      <p className="mt-3 text-center text-sm text-gray-500">
        You will not be charged yet
      </p>

      {message && (
        <p
          className={`mt-4 rounded-lg p-3 text-center text-sm font-medium ${
            success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}