import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, isAdmin } from "./firebase";

export function withAuth(Component: any, adminOnly = false) {
  return function ProtectedRoute(props: any) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push("/login"); // Redirect to login if not logged in
        } else {
          setUser(user);
          if (adminOnly) {
            const isAdminUser = await isAdmin(user.uid);
            setIsAdminUser(isAdminUser);
            if (!isAdminUser) {
              router.push("/"); // Redirect if not admin
            }
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) return <div className="text-white text-center">Loading...</div>;
    if (adminOnly && !isAdminUser) return null; // Hide admin page if not admin

    return <Component {...props} />;
  };
}
