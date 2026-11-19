import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/format";
import FileIcon from "@/components/FileIcon";

// Clicking a file selects it. The star button stars or unstars it.
export default function FileList({
  files,
  selectedId,
  onSelect,
  onToggleStar,
}) {
  return (
    <ul className="divide-y rounded-lg border">
      {files.map((file) => (
        <li
          key={file.id}
          className={`flex items-center gap-2 pr-2 ${file.id === selectedId ? "bg-muted" : ""}`}
        >
          <button
            className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left"
            onClick={() => onSelect(file.id)}
          >
            <FileIcon file={file} />
            <span className="flex-1 truncate">{file.name}</span>
            <span className="w-20 text-right text-sm text-muted-foreground">
              {formatBytes(file.size_bytes)}
            </span>
            <span className="hidden w-28 text-right text-sm text-muted-foreground sm:block">
              {formatDate(file.created_at)}
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={file.is_starred ? "Unstar" : "Star"}
            onClick={() => onToggleStar(file)}
          >
            <Star
              className={
                file.is_starred
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }
            />
          </Button>
        </li>
      ))}
    </ul>
  );
}
