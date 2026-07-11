"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function HostLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState(
    "Checking host access..."
  );

  useEffect(() => {
    async function verifyHost() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");

          router.replace("/login");
          return;
        }

        if (!response.ok) {
          setMessage("Could not verify your account");
          return;
        }

        const user: User = await response.json();

        localStorage.setItem("user", JSON.stringify(user));

        if (user.role !== "host") {
          router.replace("/");
          return;
        }

        setAuthorized(true);
      } catch {
        setMessage("Could not connect to the backend");
      }
    }

    verifyHost();
  }, [router]);

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          {message}
        </p>
      </main>
    );
  }

  return <>{children}</>;
}