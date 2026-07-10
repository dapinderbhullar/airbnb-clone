"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data: LoginResponse | { detail?: string } =
        await response.json();

      if (!response.ok) {
        setMessage(
          "detail" in data && data.detail
            ? data.detail
            : "Login failed"
        );
        return;
      }

      if (!("access_token" in data)) {
        setMessage("Invalid login response");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login successful!");

      setTimeout(() => {
        if (data.user.role === "host") {
          router.push("/host");
        } else {
          router.push("/");
        }

        router.refresh();
      }, 800);
    } catch {
      setMessage("Could not connect to the backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Log in to Airbnb Clone
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <label className="block font-semibold text-gray-700">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
          />

          <label className="mt-5 block font-semibold text-gray-700">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600 disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {message && (
            <p className="mt-4 text-center font-medium">
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-rose-500"
          >
            Sign up
          </Link>
        </p>

        <Link
          href="/"
          className="mt-4 block text-center text-sm text-gray-500"
        >
          ← Back to homepage
        </Link>
      </div>
    </main>
  );
}