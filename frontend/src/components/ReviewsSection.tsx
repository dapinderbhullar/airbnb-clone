"use client";

import { FormEvent, useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useRouter } from "next/navigation";

type Review = {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment: string;
};

export default function ReviewsSection({
  listingId,
}: {
  listingId: number;
}) {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}/reviews`
        );

        if (!response.ok) {
          setMessage("Could not load reviews");
          return;
        }

        const data: Review[] = await response.json();
        setReviews(data);
      } catch {
        setMessage("Could not connect to the backend");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [listingId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMessage("Please log in to add a review.");
      setSuccess(false);

      setTimeout(() => {
        router.push("/login");
      }, 800);

      return;
    }

    setSubmitting(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing_id: listingId,
          rating: Number(rating),
          comment,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        setMessage("Your session expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setMessage(data.detail || "Could not add review");
        return;
      }

      setReviews((currentReviews) => [...currentReviews, data]);
      setComment("");
      setRating("5");
      setSuccess(true);
      setMessage("Review added successfully!");
    } catch {
      setMessage("Could not connect to the backend");
    } finally {
      setSubmitting(false);
    }
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      : 0;

  return (
    <section className="mt-12 border-t pt-10">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Reviews
        </h2>

        {reviews.length > 0 && (
          <span className="flex items-center gap-1 font-medium">
            <FaStar className="text-yellow-500" />
            {averageRating.toFixed(1)} ({reviews.length})
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <label className="block font-semibold text-gray-700">
          Rating
        </label>

        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
        >
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Fair</option>
          <option value="1">1 - Poor</option>
        </select>

        <label className="mt-5 block font-semibold text-gray-700">
          Comment
        </label>

        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          rows={4}
          placeholder="Share your experience..."
          className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-rose-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600 disabled:bg-gray-400"
        >
          {submitting ? "Submitting..." : "Add Review"}
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

      <div className="mt-8 space-y-4">
        {loading && <p className="text-gray-500">Loading reviews...</p>}

        {!loading && reviews.length === 0 && (
          <p className="text-gray-500">
            No reviews yet. Be the first to review this property.
          </p>
        )}

        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border bg-white p-5"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <FaStar
                  key={index}
                  className={
                    index < review.rating
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>

            <p className="mt-3 text-gray-700">{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}