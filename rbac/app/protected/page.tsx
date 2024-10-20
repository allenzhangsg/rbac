"use client";

import { AuthWrapper } from "@/components/AuthWrapper";

export default function ProtectedPage() {
  return (
    <AuthWrapper requiredPermission="CanViewProtectedRoute">
      <div className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            🎉 Congratulations!
          </h1>
          <p className="text-xl text-gray-600">
            You have access to this very important page.
          </p>
        </div>
      </div>
    </AuthWrapper>
  );
}
