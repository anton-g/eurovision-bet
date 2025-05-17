import { Link } from "@remix-run/react";

export default function ResultPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <Link to="/pools/result/2023">2023</Link>
      <Link to="/pools/result/2024">2024</Link>
      <Link to="/pools/result/2025">2025</Link>
    </div>
  );
}
