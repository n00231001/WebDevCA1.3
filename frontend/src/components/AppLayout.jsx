import { Link, Navigate, Outlet } from "react-router";
import { FolderOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// The header and layout for every page that needs a logged in user.
export default function AppLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <FolderOpen className="size-5 text-blue-600" />
            Dropbox
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/account" className="flex items-center gap-2 text-sm">
              <Avatar>
                <AvatarImage src={user.avatar_url} alt="" />
                <AvatarFallback>{user.first_name[0]}</AvatarFallback>
              </Avatar>
              {user.first_name}
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4">
        <Outlet />
      </main>
    </>
  );
}
