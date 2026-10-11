import { useEffect, useRef } from "react";

export function ResetDialog({ onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    cancelRef.current?.focus();

    const handleDialogKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = document.getElementById("reset-dialog");
      const focusable = dialog?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onCancel]);

  return (
    <div
      className="dialog-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        id="reset-dialog"
        className="reset-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        <p className="eyebrow">RESET DEMO</p>
        <h2 id="reset-dialog-title">Start fresh?</h2>
        <p id="reset-dialog-description">
          This restores the original ₹10,000 demo and clears the changes saved
          in this browser.
        </p>
        <div className="reset-dialog-actions">
          <button
            ref={cancelRef}
            type="button"
            className="button-secondary"
            onClick={onCancel}
          >
            Keep current data
          </button>
          <button type="button" className="button-primary" onClick={onConfirm}>
            Reset demo
          </button>
        </div>
      </section>
    </div>
  );
}
