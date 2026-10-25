import { FileText } from "lucide-react";

// A small preview for images, or an icon for other files
export default function FileIcon({ file, size = "size-10" }) {
  if (file.mime_type.startsWith("image/")) {
    return (
      <img src={file.url} alt="" className={`${size} rounded object-cover`} />
    );
  }
  return (
    <div
      className={`${size} flex items-center justify-center rounded bg-muted`}
    >
      <FileText className="size-1/2 text-muted-foreground" />
    </div>
  );
}
