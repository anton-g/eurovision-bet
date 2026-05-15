import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  deleteParticipantIfUnused,
  getParticipantsForAdmin,
  updateParticipantHidden,
} from "~/models/participant.server";
import { requireUser } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  if (!user.admin) {
    throw new Response("Forbidden", { status: 403 });
  }

  const participants = await getParticipantsForAdmin();

  return json({ participants });
};

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  if (!user.admin) {
    throw new Response("Forbidden", { status: 403 });
  }

  const formData = await request.formData();
  const action = formData.get("action");
  const participantId = formData.get("participantId");

  if (typeof action !== "string" || action.length === 0) {
    return json({ error: "Action is required" }, { status: 400 });
  }

  if (typeof participantId !== "string" || participantId.length === 0) {
    return json({ error: "Participant is required" }, { status: 400 });
  }

  if (action === "toggleHidden") {
    const hidden = formData.get("hidden") === "true";
    await updateParticipantHidden(participantId, hidden);
    return json({ success: true });
  }

  if (action === "delete") {
    const result = await deleteParticipantIfUnused(participantId);
    if (!result.deleted) {
      return json({ error: result.reason }, { status: 400 });
    }

    return json({ success: true });
  }

  invariant(false, "Unsupported action");
};

export default function ParticipantsAdminPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Manage participants</h2>
        <p className="text-sm text-gray-600">
          Hide participants from suggestions or delete entries with no bets.
        </p>
      </div>
      {actionData && "error" in actionData ? (
        <p className="text-sm text-red-600">{actionData.error}</p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Bets</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">Open</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.participants.map((participant) => (
              <tr key={participant.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{participant.name}</td>
                <td className="px-4 py-3">{participant._count.bets}</td>
                <td className="px-4 py-3">
                  {participant.hidden ? "Hidden" : "Visible"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    className="text-blue-600 underline"
                    to={`/participants/${participant.id}`}
                  >
                    View history
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Form method="post">
                      <input type="hidden" name="action" value="toggleHidden" />
                      <input
                        type="hidden"
                        name="participantId"
                        value={participant.id}
                      />
                      <input
                        type="hidden"
                        name="hidden"
                        value={participant.hidden ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                      >
                        {participant.hidden
                          ? "Show in suggestions"
                          : "Hide from suggestions"}
                      </button>
                    </Form>
                    <Form method="post">
                      <input type="hidden" name="action" value="delete" />
                      <input
                        type="hidden"
                        name="participantId"
                        value={participant.id}
                      />
                      <button
                        type="submit"
                        className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={participant._count.bets > 0}
                      >
                        Delete
                      </button>
                    </Form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
