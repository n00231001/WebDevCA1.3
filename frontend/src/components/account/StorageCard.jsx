import { useAuth } from "@/context/AuthContext";
import { formatBytes } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StorageCard() {
  const { user } = useAuth();
  const percent = Math.min(
    100,
    (user.storage_used_bytes / user.storage_quota_bytes) * 100,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-blue-600"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatBytes(user.storage_used_bytes)} of{" "}
          {formatBytes(user.storage_quota_bytes)} used
        </p>
      </CardContent>
    </Card>
  );
}
