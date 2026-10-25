import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="underline">
        Go to your files
      </Link>
    </div>
  );
}
