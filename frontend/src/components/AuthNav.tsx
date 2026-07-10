"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
      }
    }

    setLoaded(true);
  }, []);

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (!loaded) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {user?.role === "host" && (
        <Link
          href="/host"
          className="rounded-full border px-5 py-2 font-medium text-gray-700 hover:bg-gray-100"
        >
          Host
        </Link>
      )}

      <Link
        href="/wishlist"
        className="rounded-full border px-5 py-2 font-medium text-gray-700 hover:bg-gray-100"
      >
        Wishlist
      </Link>

      <Link
        href="/bookings"
        className="rounded-full border px-5 py-2 font-medium text-gray-700 hover:bg-gray-100"
      >
        My Bookings
      </Link>

      {user ? (
        <>
          <span className="font-medium text-gray-700">
            Hello, {user.name}
          </span>

          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-rose-500 px-5 py-2 font-medium text-white hover:bg-rose-600"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-full border px-5 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-rose-500 px-5 py-2 font-medium text-white hover:bg-rose-600"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}