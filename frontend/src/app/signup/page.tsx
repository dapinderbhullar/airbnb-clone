"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guest");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Signup failed");
        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
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
          Create Account
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Join Airbnb Clone
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <label className="block font-semibold text-gray-700">
            Full name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
          />

          <label className="mt-5 block font-semibold text-gray-700">
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
            minLength={8}
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
          />

          <label className="mt-5 block font-semibold text-gray-700">
            Account type
          </label>

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
          >
            <option value="guest">Guest</option>
            <option value="host">Host</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600 disabled:bg-gray-400"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {message && (
            <p className="mt-4 text-center font-medium">
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-rose-500"
          >
            Login
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