import Link from "next/link";
import { notFound } from "next/navigation";
import { FaStar } from "react-icons/fa";

import BookingForm from "@/components/BookingForm";
import ReviewsSection from "@/components/ReviewsSection";

type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
};

async function getListing(id: string): Promise<Listing | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is missing");
  }

  const response = await fetch(
    `${apiUrl}/listings/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}
export default async function ListingDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-2xl font-bold text-rose-500"
          >
            Airbnb Clone
          </Link>

          <Link
            href="/"
            className="font-medium text-gray-700 hover:text-rose-500"
          >
            ← Back to listings
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-bold text-gray-900">
          {listing.title}
        </h1>

        <div className="mt-3 flex items-center gap-4">
          <span className="flex items-center gap-1 text-gray-900">
            <FaStar className="text-yellow-500" />
            4.9
          </span>

          <span className="text-gray-500">
            {listing.location}
          </span>
        </div>

        <img
          src={listing.image}
          alt={listing.title}
          className="mt-6 h-[500px] w-full rounded-3xl object-cover"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              About this property
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Enjoy a comfortable and relaxing stay at this beautiful
              property in {listing.location}. This property offers a
              welcoming atmosphere and everything you need for a
              memorable trip.
            </p>

            <hr className="my-8" />

            <h3 className="text-xl font-semibold text-gray-900">
              What this place offers
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-4 text-gray-600">
              <p>Free Wi-Fi</p>
              <p>Air conditioning</p>
              <p>Kitchen</p>
              <p>Free parking</p>
              <p>Smart TV</p>
              <p>Swimming pool</p>
            </div>
          </div>

          <BookingForm
            listingId={listing.id}
            price={listing.price}
          />
        </div>

        <ReviewsSection listingId={listing.id} />
      </section>
    </main>
  );
}