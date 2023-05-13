import React from "react";

export const ConfirmDeleteButton = () => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  return confirmDelete ? (
    <button
      key="delete-button"
      type="submit"
      className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
    >
      Are you sure?
    </button>
  ) : (
    <button
      key="confirm-delete-button"
      type={"button"}
      onClick={(e) => {
        e.preventDefault();
        setConfirmDelete(true);
      }}
      className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
    >
      Delete
    </button>
  );
};
