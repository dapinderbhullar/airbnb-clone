import Link from "next/link";

import AuthNav from "@/components/AuthNav";
import ListingsGrid from "@/components/ListingsGrid";

type Listing = {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
};

async function getListings(): Promise<Listing[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is missing");
}

  const response = await fetch(`${apiUrl}/listings`, {
    cache: "no-store",
});

  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  return response.json();
}

export default async function Home() {
  const listings = await getListings();

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-3xl font-bold text-rose-500"
          >
            Airbnb Clone
          </Link>

          <AuthNav />
        </div>
      </nav>

      <ListingsGrid listings={listings} />
    </main>
  );
}