import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

// A button that opens the file picker. onUpload is given the chosen files.
export default function UploadButton({ onUpload }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e) {
    const files = e.target.files;
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    await onUpload(files);
    setUploading(false);
    e.target.value = ""; // so choosing the same file again still works
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={handleChange}
      />
      <Button onClick={() => inputRef.current.click()} disabled={uploading}>
        <Upload /> {uploading ? "Uploading..." : "Upload"}
      </Button>
    </>
  );
}
