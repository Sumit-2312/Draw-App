"use client"; // Required for client-side interactivity

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.refresh(); // Refresh the page to reflect the change
  };

  return isLoggedIn ? (
    <button
      onClick={handleLogout}
      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
    >
      Logout
    </button>
  ) : (
    <Link
      href="/signin"
      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
    >
      Sign In
    </Link>
  );
}
