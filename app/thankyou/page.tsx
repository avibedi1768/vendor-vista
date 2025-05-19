"use client";

import { useRouter } from "next/navigation";

export default function ThankYou() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300 px-4">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full text-center">
        {/* Big Checkmark */}
        <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-green-500 text-white text-5xl">
          ✓
        </div>

        <h1 className="text-3xl font-semibold mb-2 text-green-800">Thank You!</h1>
        <p className="text-gray-700 mb-6">
          Your order has been successfully placed. We appreciate your business!
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
