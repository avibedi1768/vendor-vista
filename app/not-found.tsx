import Link from "next/link";
import React from "react";

function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4 text-center bg-gray-50">
      <h1 className="text-5xl font-bold text-red-600 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-700 mb-2">
        Monsieur, galat page pe aagye ho 😅
      </p>
      <p className="text-gray-600 mb-6">Shayad yeh links help karein:</p>

      <ul className="space-y-3">
        <li>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline text-lg transition"
          >
            🏠 Home
          </Link>
        </li>
        <li>
          <Link
            href="/signin"
            className="text-blue-600 hover:text-blue-800 underline text-lg transition"
          >
            🔐 Sign In
          </Link>
        </li>
        <li>
          <Link
            href="/signup"
            className="text-blue-600 hover:text-blue-800 underline text-lg transition"
          >
            ✍️ Sign Up
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default NotFound;
