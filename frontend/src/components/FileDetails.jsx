import { useState } from "react";
import { Download, Pencil, Trash2, X } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/format";
import FileIcon from "@/components/FileIcon";
import RenameForm from "@/components/RenameForm";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// The panel for the selected file: a preview, its details, and its actions
export default function FileDetails({ file, onRename, onDelete, onClose }) {
  const [editing, setEditing] = useState(false);

  return (
    <aside className="space-y-4 rounded-lg border p-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>

      {file.mime_type.startsWith("image/") ? (
        <img
          src={file.url}
          alt=""
          className="max-h-64 w-full rounded object-contain"
        />
      ) : (
        <FileIcon file={file} size="size-24 mx-auto" />
      )}

      {editing ? (
        <RenameForm
          file={file}
          onRename={onRename}
          onDone={() => setEditing(false)}
        />
      ) : (
        <div className="flex items-center gap-1">
          <h2 className="truncate font-semibold">{file.name}</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Rename"
            onClick={() => setEditing(true)}
          >
            <Pencil />
          </Button>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-1 text-sm">
        <dt className="text-muted-foreground">Size</dt>
        <dd>{formatBytes(file.size_bytes)}</dd>
        <dt className="text-muted-foreground">Type</dt>
        <dd className="truncate">{file.mime_type}</dd>
        <dt className="text-muted-foreground">Uploaded</dt>
        <dd>{formatDate(file.created_at)}</dd>
      </dl>

      <div className="flex gap-2">
        {/* A link styled as a button. The API sends the file as a download. */}
        <a href={file.url} className={buttonVariants()}>
          <Download /> Download
        </a>

        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            <Trash2 /> Delete
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {file.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
