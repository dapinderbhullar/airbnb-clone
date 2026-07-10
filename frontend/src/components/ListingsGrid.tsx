"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";

type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
};

export default function ListingsGrid({
  listings,
}: {
  listings: Listing[];
}) {
  const router = useRouter();

  const highestPrice =
    listings.length > 0
      ? Math.max(...listings.map((listing) => listing.price))
      : 50000;

  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(highestPrice);
  const [sortBy, setSortBy] = useState("default");
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");

    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        localStorage.removeItem("wishlist");
      }
    }
  }, []);

  function toggleWishlist(
    event: React.MouseEvent<HTMLButtonElement>,
    listingId: number
  ) {
    event.stopPropagation();

    const updatedWishlist = wishlist.includes(listingId)
      ? wishlist.filter((id) => id !== listingId)
      : [...wishlist, listingId];

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );
  }

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = listings.filter((listing) => {
      const matchesSearch =
        listing.title.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query);

      const matchesPrice = listing.price <= maxPrice;

      return matchesSearch && matchesPrice;
    });

    if (sortBy === "price-low") {
      return [...filtered].sort(
        (first, second) => first.price - second.price
      );
    }

    if (sortBy === "price-high") {
      return [...filtered].sort(
        (first, second) => second.price - first.price
      );
    }

    if (sortBy === "name") {
      return [...filtered].sort((first, second) =>
        first.title.localeCompare(second.title)
      );
    }

    return filtered;
  }, [listings, search, maxPrice, sortBy]);

  function resetFilters() {
    setSearch("");
    setMaxPrice(highestPrice);
    setSortBy("default");
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-semibold text-gray-700"
              >
                Search
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Property or location..."
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label
                htmlFor="max-price"
                className="block text-sm font-semibold text-gray-700"
              >
                Maximum price: ₹{maxPrice.toLocaleString()}
              </label>

              <input
                id="max-price"
                type="range"
                min="0"
                max={highestPrice}
                step="500"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(Number(event.target.value))
                }
                className="mt-5 w-full accent-rose-500"
              />
            </div>

            <div>
              <label
                htmlFor="sort"
                className="block text-sm font-semibold text-gray-700"
              >
                Sort by
              </label>

              <select
                id="sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
              >
                <option value="default">Recommended</option>
                <option value="price-low">
                  Price: Low to High
                </option>
                <option value="price-high">
                  Price: High to Low
                </option>
                <option value="name">Property Name</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredListings.length} properties found
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="font-medium text-rose-500 hover:text-rose-600"
            >
              Reset filters
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredListings.map((listing) => (
          <article
            key={listing.id}
            onClick={() =>
              router.push(`/listings/${listing.id}`)
            }
            className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative">
              <img
                src={listing.image}
                alt={listing.title}
                className="h-64 w-full object-cover"
              />

              <button
                type="button"
                onClick={(event) =>
                  toggleWishlist(event, listing.id)
                }
                aria-label="Toggle wishlist"
                className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
              >
                {wishlist.includes(listing.id) ? (
                  <FaHeart className="text-rose-500" />
                ) : (
                  <FaRegHeart className="text-gray-600" />
                )}
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-gray-900">
                  {listing.title}
                </h2>

                <span className="flex items-center gap-1">
                  <FaStar className="text-yellow-500" />
                  4.9
                </span>
              </div>

              <p className="mt-1 text-gray-500">
                {listing.location}
              </p>

              <p className="mt-3 font-semibold text-gray-900">
                ₹{listing.price.toLocaleString()} / night
              </p>
            </div>
          </article>
        ))}

        {filteredListings.length === 0 && (
          <div className="col-span-full rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg text-gray-500">
              No properties match your filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}