"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
};

type SavedUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();

  const listingId = Number(params.id);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadListing() {
      const token = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        router.replace("/login");
        return;
      }

      try {
        const user: SavedUser = JSON.parse(savedUser);

        if (user.role !== "host") {
          router.replace("/");
          return;
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/${listingId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.detail || "Could not load property");
          return;
        }

        const listing: Listing = data;

        setTitle(listing.title);
        setLocation(listing.location);
        setPrice(String(listing.price));
        setImage(listing.image);
      } catch {
        setMessage("Could not connect to the backend");
      } finally {
        setLoading(false);
      }
    }

    if (listingId) {
      loadListing();
    }
  }, [listingId, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMessage("Please log in as a host");
      setSuccess(false);
      router.push("/login");
      return;
    }

    setSaving(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${listingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            location,
            price: Number(price),
            image,
          }),
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
        setMessage("Only host accounts can edit properties");
        return;
      }

      if (!response.ok) {
        setMessage(data.detail || "Could not update property");
        return;
      }

      setSuccess(true);
      setMessage("Property updated successfully!");

      setTimeout(() => {
        router.push("/host");
        router.refresh();
      }, 800);
    } catch {
      setMessage("Could not connect to the backend");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Loading property...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">
            Edit Property
          </h1>

          <Link
            href="/host"
            className="font-medium text-rose-500 hover:text-rose-600"
          >
            ← Back
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-lg"
        >
          <label className="block font-semibold text-gray-700">
            Property title
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
          />

          <label className="mt-5 block font-semibold text-gray-700">
            Location
          </label>

          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
          />

          <label className="mt-5 block font-semibold text-gray-700">
            Price per night
          </label>

          <input
            type="number"
            min="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
          />

          <label className="mt-5 block font-semibold text-gray-700">
            Image URL
          </label>

          <input
            type="url"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
          />

          {image && (
            <img
              src={image}
              alt="Property preview"
              className="mt-5 h-64 w-full rounded-xl object-cover"
            />
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {saving ? "Updating..." : "Update Property"}
          </button>

          {message && (
            <p
              className={`mt-4 rounded-xl p-3 text-center font-medium ${
                success
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}