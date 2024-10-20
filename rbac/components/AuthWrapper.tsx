import { useEffect, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthWrapperProps {
  children: ReactNode;
  requiredPermission?: string;
}

export function AuthWrapper({
  children,
  requiredPermission = "CanViewProtectedRoute",
}: AuthWrapperProps) {
  const { user, loading, hasPermission } = useAuth();
  const router = useRouter();
  const [showPermissionDenied, setShowPermissionDenied] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!hasPermission(requiredPermission)) {
        setShowPermissionDenied(true);
      }
    }
  }, [user, loading, hasPermission, requiredPermission, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (showPermissionDenied) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Permission Denied</AlertTitle>
        <AlertDescription>
          You do not have the required permissions to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
