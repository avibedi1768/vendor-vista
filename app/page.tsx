import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center px-6 py-12">
      <section className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Vendor Vista
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Launch, customize, and manage your online store – all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white text-lg font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/signin"
            className="px-6 py-3 rounded-xl border border-blue-600 text-blue-600 text-lg font-medium hover:bg-blue-50 transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      <footer className="mt-16 text-sm text-gray-400 text-center">
        &copy; {new Date().getFullYear()} Vendor Vista. All rights reserved.
        <br />
        Made by Arshpreet Singh Bedi
      </footer>
    </main>
  );
}
