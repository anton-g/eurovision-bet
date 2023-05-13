import { Link } from "@remix-run/react";

export default function PoolIndexPage() {
  return (
    <p>
      No pool selected. Select a pool on the left, or{" "}
      <Link to="new" className="text-violet-500 underline">
        create a new betting pool.
      </Link>
    </p>
  );
}
