import { useEffect } from "react";
import * as authApi from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import AvatarCard from "@/components/account/AvatarCard";
import NameCard from "@/components/account/NameCard";
import PasswordCard from "@/components/account/PasswordCard";
import StorageCard from "@/components/account/StorageCard";

export default function AccountPage() {
  const { setUser } = useAuth();

  // Load the user again, so the storage used includes any new uploads
  useEffect(() => {
    async function refreshUser() {
      setUser(await authApi.getMe());
    }
    refreshUser();
  }, [setUser]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Your account</h1>
      <AvatarCard />
      <NameCard />
      <PasswordCard />
      <StorageCard />
    </div>
  );
}
