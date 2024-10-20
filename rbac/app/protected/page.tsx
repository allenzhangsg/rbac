"use client";

import { AuthWrapper } from "@/components/AuthWrapper";

export default function ProtectedPage() {
  return (
    <AuthWrapper requiredPermission="CanViewProtectedRoute">
      <div>Congratulations! You have access to this very important page.</div>
    </AuthWrapper>
  );
}
