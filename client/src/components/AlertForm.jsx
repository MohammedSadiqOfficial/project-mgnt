import { CircleAlert } from "lucide-react";
import React, { useEffect, useRef } from "react";

const AlertForm = ({ setAlertForm, setConfirm }) => {
  const formRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target))
        setAlertForm(false);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setAlertForm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur">
      <div
        ref={formRef}
        className=" flex items-center justify-center gap-2 flex-col bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-lg w-full max-w-md p-6 text-zinc-900 dark:text-white "
      >
        <CircleAlert size={64} className="text-amber-400" />
        <h3 className="mb-5 text-md font-normal text-gray-500 dark:text-gray-400">
          Are you sure you want to delete the selected tasks?
        </h3>
        <div>
          <button
            type="button"
            className="rounded px-5 py-2 text-sm bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white dark:text-zinc-200 transition mx-2"
            onClick={() => setConfirm(true)}
          >
            Yes, I'm sure
          </button>
          <button
            type="button"
            className="rounded border border-zinc-300 dark:border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition mx-2"
            onClick={() => setAlertForm(false)}
          >
            No, cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertForm;
