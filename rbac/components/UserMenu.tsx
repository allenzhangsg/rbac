"use client";

import { useState } from "react";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return null; // Don't render anything if user is not logged in
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <UserCircle className="h-6 w-6 text-gray-600" />
        <span className="text-sm font-medium">{user.username}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
