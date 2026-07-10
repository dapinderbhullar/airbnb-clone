"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
};

export default function HostListings({
  initialListings,
}: {
  initialListings: Listing[];
}) {
  const router = useRouter();

  const [listings, setListings] = useState(initialListings);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function deleteListing(listingId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMessage("Please log in as a host");
      setSuccess(false);
      router.push("/login");
      return;
    }

    setDeletingId(listingId);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/listings/${listingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        setMessage("Your session expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setMessage("Only host accounts can delete properties");
        return;
      }

      if (!response.ok) {
        setMessage(data.detail || "Could not delete property");
        return;
      }

      setListings((currentListings) =>
        currentListings.filter(
          (listing) => listing.id !== listingId
        )
      );

      setSuccess(true);
      setMessage("Property deleted successfully");
      router.refresh();
    } catch {
      setMessage("Could not connect to the backend");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {message && (
        <p
          className={`mt-6 rounded-xl p-4 text-center font-medium shadow ${
            success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {listings.map((listing) => (
          <article
            key={listing.id}
            className="flex flex-col gap-5 rounded-xl bg-white p-5 shadow sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={listing.image}
                alt={listing.title}
                className="h-24 w-24 rounded-xl object-cover"
              />

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {listing.title}
                </h2>

                <p className="text-gray-500">
                  {listing.location}
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  ₹{listing.price.toLocaleString()} / night
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/host/edit/${listing.id}`}
                className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
              >
                Edit
              </Link>

              <button
                type="button"
                onClick={() => deleteListing(listing.id)}
                disabled={deletingId === listing.id}
                className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {deletingId === listing.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </article>
        ))}

        {listings.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <p className="text-gray-500">
              No properties available.
            </p>

            <Link
              href="/host/add"
              className="mt-4 inline-block rounded-xl bg-rose-500 px-5 py-3 font-semibold text-white hover:bg-rose-600"
            >
              Add your first property
            </Link>
          </div>
        )}
      </div>
    </>
  );
}