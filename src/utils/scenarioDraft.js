import { money } from "./formatMoney.js";

export const SCENARIO_TYPES = [
  { value: "purchase", label: "Purchase" },
  { value: "unexpectedExpense", label: "Emergency" },
  { value: "savings", label: "Save more" },
  { value: "income", label: "Extra income" },
  { value: "cancelCommitment", label: "Cancel a bill" },
  { value: "payCommitment", label: "Pay a bill" },
];

export const EXPENSE_CATEGORIES = [
  "Shopping",
  "Food",
  "Transport",
  "Entertainment",
  "Health",
  "Other",
];

export const remainingSavingsGoalAmount = (state) =>
  Math.max(0, state.savingsGoal.target - state.savingsGoal.saved);

export const firstUpcomingCommitmentId = (state) =>
  state.commitments.find((item) => item.status === "upcoming")?.id || "";

export function createScenarioDraft(type, state, commitmentIdOverride = "") {
  const remaining = remainingSavingsGoalAmount(state);
  const defaults = {
    purchase: {
      description: "New headphones",
      amount: "799",
      category: "Shopping",
    },
    unexpectedExpense: {
      description: "Unexpected expense",
      amount: "1500",
      category: "Health",
    },
    savings: {
      description: "Extra savings",
      amount: String(Math.min(300, Math.max(1, remaining || 0))),
      category: "Savings",
    },
    income: {
      description: "Additional income",
      amount: "1000",
      category: "Income",
    },
    cancelCommitment: {
      description: "Cancel upcoming bill",
      amount: "0",
      category: "Other",
    },
    payCommitment: {
      description: "Pay upcoming bill",
      amount: "0",
      category: "Commitments",
    },
  };
  const chosen = defaults[type] || defaults.purchase;

  return {
    ...chosen,
    type: defaults[type] ? type : "purchase",
    commitmentId: commitmentIdOverride || firstUpcomingCommitmentId(state),
  };
}

export function toScenarioPayload(draft) {
  return {
    type: draft.type,
    description: String(draft.description || "").trim(),
    category: draft.category,
    amount: Number(draft.amount),
    commitmentId: draft.commitmentId,
  };
}

export function validateScenarioDraft(draft, state) {
  const isCommitment =
    draft.type === "cancelCommitment" || draft.type === "payCommitment";

  if (isCommitment) {
    const commitment = state.commitments.find(
      (item) => item.id === draft.commitmentId && item.status === "upcoming"
    );
    if (!commitment) {
      return {
        ok: false,
        message: "No upcoming unpaid commitments remain.",
      };
    }
    return { ok: true, message: "" };
  }

  const amount = Number(draft.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      message: "Enter an amount greater than zero.",
    };
  }

  if (!String(draft.description || "").trim()) {
    return {
      ok: false,
      message: "Add a short description so this decision is identifiable.",
    };
  }

  if (draft.type === "savings") {
    const remaining = remainingSavingsGoalAmount(state);
    if (remaining === 0) {
      return {
        ok: false,
        message: "This savings goal is already complete.",
      };
    }
    if (amount > remaining) {
      return {
        ok: false,
        message: `Only ${money(remaining)} remains before this savings goal is reached. Lower the amount to continue.`,
      };
    }
  }

  return { ok: true, message: "" };
}
