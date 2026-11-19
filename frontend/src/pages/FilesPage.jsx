import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import * as filesApi from "@/api/files";
import FileList from "@/components/FileList";
import FileDetails from "@/components/FileDetails";
import UploadButton from "@/components/UploadButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  // Set when an upload, star or delete fails
  const [actionError, setActionError] = useState(null);
  // Changing this loads the files again
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadFiles() {
      try {
        const result = await filesApi.listFiles(search, starredOnly);
        if (!ignore) {
          setFiles(result);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadFiles();

    return () => {
      ignore = true;
    };
  }, [search, starredOnly, reloadKey]);

  function reload() {
    setReloadKey(reloadKey + 1);
  }

  // The selected file, if it's still in the list
  const selectedFile = files.find((file) => file.id === selectedId);

  async function handleUpload(fileList) {
    setActionError(null);
    try {
      await filesApi.uploadFiles(fileList);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleToggleStar(file) {
    setActionError(null);
    try {
      await filesApi.updateFile(file.id, { is_starred: !file.is_starred });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleRename(name) {
    await filesApi.updateFile(selectedFile.id, { name });
    reload();
  }

  async function handleDelete() {
    setActionError(null);
    try {
      await filesApi.deleteFile(selectedFile.id);
      setSelectedId(null);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search your files"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={starredOnly ? "outline" : "secondary"}
          onClick={() => setStarredOnly(false)}
        >
          All
        </Button>
        <Button
          variant={starredOnly ? "secondary" : "outline"}
          onClick={() => setStarredOnly(true)}
        >
          Starred
        </Button>
        <UploadButton onUpload={handleUpload} />
      </div>

      {actionError && <p className="mb-4 text-destructive">{actionError}</p>}

      <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
        <div>
          {loading && <p>Loading...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && files.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              {search || starredOnly
                ? "No files match."
                : "You don't have any files yet."}
            </p>
          )}
          {files.length > 0 && (
            <FileList
              files={files}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onToggleStar={handleToggleStar}
            />
          )}
        </div>

        {selectedFile && (
          <FileDetails
            key={selectedFile.id}
            file={selectedFile}
            onRename={handleRename}
            onDelete={handleDelete}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}
