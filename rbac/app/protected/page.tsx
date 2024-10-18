"use client";

import { AuthWrapper } from "@/components/AuthWrapper";

export default function ProtectedPage() {
  return (
    <AuthWrapper>
      <div>Protected Page</div>
    </AuthWrapper>
  );
}
