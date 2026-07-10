import Link from "next/link";

import HostListings from "@/components/HostListings";

type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
};

async function getListings(): Promise<Listing[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  return response.json();
}

export default async function HostDashboard() {
  const listings = await getListings();

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Host Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your properties
            </p>

            <Link
              href="/"
              className="mt-3 inline-block font-medium text-rose-500 hover:text-rose-600"
            >
              ← Back to homepage
            </Link>
          </div>

          <Link
            href="/host/add"
            className="rounded-xl bg-rose-500 px-5 py-3 text-center font-semibold text-white transition hover:bg-rose-600"
          >
            + Add Property
          </Link>
        </div>

        <HostListings initialListings={listings} />
      </div>
    </main>
  );
}