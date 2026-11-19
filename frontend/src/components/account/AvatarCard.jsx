import { useRef, useState } from "react";
import * as authApi from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AvatarCard() {
  const { user, setUser } = useAuth();
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleChange(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      setUser(await authApi.uploadAvatar(file));
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
    e.target.value = "";
  }

  async function handleRemove() {
    setError(null);
    try {
      await authApi.deleteAvatar();
      setUser(await authApi.getMe());
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile picture</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.avatar_url} alt="" />
          <AvatarFallback className="text-xl">
            {user.first_name[0]}
          </AvatarFallback>
        </Avatar>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          hidden
          onChange={handleChange}
        />
        <Button onClick={() => inputRef.current.click()} disabled={busy}>
          {busy ? "Uploading..." : "Upload new"}
        </Button>
        {user.avatar_url && (
          <Button variant="outline" onClick={handleRemove}>
            Remove
          </Button>
        )}
      </CardContent>
      {error && <p className="px-4 text-sm text-destructive">{error}</p>}
    </Card>
  );
}
