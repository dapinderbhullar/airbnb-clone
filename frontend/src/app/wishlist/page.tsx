"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaHeart, FaStar } from "react-icons/fa";

type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
};

export default function WishlistPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      try {
        const savedWishlist = JSON.parse(
          localStorage.getItem("wishlist") || "[]"
        );

        setWishlist(savedWishlist);

        const response = await fetch("http://127.0.0.1:8000/listings");
        const allListings: Listing[] = await response.json();

        setListings(
          allListings.filter((listing) =>
            savedWishlist.includes(listing.id)
          )
        );
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, []);

  function removeFromWishlist(listingId: number) {
    const updatedWishlist = wishlist.filter((id) => id !== listingId);

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

    setListings((currentListings) =>
      currentListings.filter((listing) => listing.id !== listingId)
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-3xl font-bold text-rose-500">
            Airbnb Clone
          </Link>

          <Link href="/" className="font-medium hover:text-rose-500">
            Back to home
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-bold">My Wishlist</h1>

        {loading && <p className="mt-8">Loading...</p>}

        {!loading && listings.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-500">
              Your wishlist is empty.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white"
            >
              Explore properties
            </Link>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="overflow-hidden rounded-2xl bg-white shadow"
            >
              <div className="relative">
                <Link href={`/listings/${listing.id}`}>
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-64 w-full object-cover"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => removeFromWishlist(listing.id)}
                  className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
                >
                  <FaHeart className="text-rose-500" />
                </button>
              </div>

              <Link href={`/listings/${listing.id}`}>
                <div className="p-4">
                  <div className="flex justify-between">
                    <h2 className="font-bold">{listing.title}</h2>

                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      4.9
                    </span>
                  </div>

                  <p className="mt-1 text-gray-500">{listing.location}</p>

                  <p className="mt-3 font-semibold">
                    ₹{listing.price.toLocaleString()} / night
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}