
export const INITIAL_FINANCE_STATE = {
  budget: 10000,
  currentDay: 12,

  incomes: [],

  transactions: [
    {
      id: "expense-1",
      description: "Groceries",
      category: "Groceries",
      amount: 1180,
      day: 2,
      type: "expense",
      countsTowardPace: true,
    },
    {
      id: "expense-2",
      description: "Cafe and food",
      category: "Food",
      amount: 960,
      day: 4,
      type: "expense",
      countsTowardPace: true,
    },
    {
      id: "expense-3",
      description: "Transport",
      category: "Transport",
      amount: 360,
      day: 7,
      type: "expense",
      countsTowardPace: true,
    },
    {
      id: "expense-4",
      description: "Entertainment",
      category: "Entertainment",
      amount: 650,
      day: 10,
      type: "expense",
      countsTowardPace: true,
    },
  ],

  savingsGoal: {
    name: "Emergency fund",
    target: 1000,
    saved: 500,
  },

  commitments: [
    {
      id: "commitment-1",
      name: "Phone plan",
      amount: 399,
      dueDay: 16,
      status: "upcoming",
    },
    {
      id: "commitment-2",
      name: "Gym membership",
      amount: 699,
      dueDay: 20,
      status: "upcoming",
    },
    {
      id: "commitment-3",
      name: "Transport pass",
      amount: 700,
      dueDay: 24,
      status: "upcoming",
    },
  ],
};

export function createInitialFinanceState() {
  return {
    ...INITIAL_FINANCE_STATE,
    incomes: [],
    transactions: INITIAL_FINANCE_STATE.transactions.map(
      (transaction) => ({ ...transaction })
    ),
    savingsGoal: { ...INITIAL_FINANCE_STATE.savingsGoal },
    commitments: INITIAL_FINANCE_STATE.commitments.map(
      (commitment) => ({ ...commitment })
    ),
  };
}

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

export function calculateFinance(state) {
  const elapsedDays = clamp(state.currentDay, 1, 30);
  const daysRemaining = Math.max(0, 30 - state.currentDay);

  const totalIncome = state.incomes.reduce(
    (total, income) => total + income.amount,
    0
  );

  const paidExpenses = state.transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const savingsTransferred = state.savingsGoal.saved;

  const cashBalance =
    state.budget + totalIncome - paidExpenses - savingsTransferred;

  const upcomingCommitments = state.commitments
    .filter((commitment) => commitment.status === "upcoming")
    .reduce((total, commitment) => total + commitment.amount, 0);

  const remainingSavingsGoal = Math.max(
    0,
    state.savingsGoal.target - state.savingsGoal.saved
  );

  const safeToSpend =
    cashBalance - upcomingCommitments - remainingSavingsGoal;

  const dailyAllowance =
    daysRemaining > 0 ? safeToSpend / daysRemaining : 0;

  const historicalSpending = state.transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        transaction.countsTowardPace
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

  const averageDailySpend = historicalSpending / elapsedDays;

  const projectedClosingBalance =
    cashBalance -
    averageDailySpend * daysRemaining -
    upcomingCommitments -
    remainingSavingsGoal;

  const savingsProgress =
    state.savingsGoal.target > 0
      ? clamp(
          state.savingsGoal.saved / state.savingsGoal.target,
          0,
          1
        )
      : 1;

  const shortfallRisk =
    (Math.max(0, -projectedClosingBalance) /
      Math.max(1, state.budget)) *
    55;

  const paceRatio =
    dailyAllowance > 0
      ? averageDailySpend / dailyAllowance
      : averageDailySpend > 0
        ? 2
        : 0;

  const paceRisk = clamp((paceRatio - 1) * 20, 0, 25);
  const savingsRisk = savingsProgress < 0.5 ? 10 : 0;

  const riskScore = clamp(
    Math.round(20 + shortfallRisk + paceRisk + savingsRisk),
    0,
    100
  );

  const financialHealth = 100 - riskScore;

  const riskLabel =
    riskScore >= 65
      ? "High"
      : riskScore >= 40
        ? "Moderate"
        : "Low";

  return {
    totalIncome,
    paidExpenses,
    savingsTransferred,
    cashBalance,
    upcomingCommitments,
    remainingSavingsGoal,
    safeToSpend,
    daysRemaining,
    dailyAllowance,
    historicalSpending,
    averageDailySpend,
    projectedClosingBalance,
    savingsProgress,
    riskScore,
    riskLabel,
    financialHealth,
  };
}

export function applyScenarioToState(state, scenario) {
  const amount = Number(scenario.amount);

  if (
    ["purchase", "unexpectedExpense", "savings", "income"].includes(
      scenario.type
    ) &&
    (!Number.isFinite(amount) || amount <= 0)
  ) {
    return state;
  }

  const nextTransactionId = () =>
    `transaction-${state.transactions.length + 1}`;

  switch (scenario.type) {
    case "purchase":
    case "unexpectedExpense": {
      const transaction = {
        id: nextTransactionId(),
        description:
          scenario.description ||
          (scenario.type === "purchase"
            ? "New purchase"
            : "Unexpected expense"),
        category: scenario.category || "Other",
        amount,
        day: state.currentDay,
        type: "expense",
        // One-off decisions must not alter the historical daily pace.
        countsTowardPace: false,
      };

      return {
        ...state,
        transactions: [...state.transactions, transaction],
      };
    }

    case "income": {
      const income = {
        id: `income-${state.incomes.length + 1}`,
        description: scenario.description || "Additional income",
        amount,
        day: state.currentDay,
      };

      return {
        ...state,
        incomes: [...state.incomes, income],
      };
    }

    case "savings": {
      return {
        ...state,
        savingsGoal: {
          ...state.savingsGoal,
          saved: state.savingsGoal.saved + amount,
        },
      };
    }

    case "cancelCommitment": {
      const commitment = state.commitments.find(
        (item) =>
          item.id === scenario.commitmentId &&
          item.status === "upcoming"
      );

      if (!commitment) return state;

      return {
        ...state,
        commitments: state.commitments.map((item) =>
          item.id === scenario.commitmentId
            ? { ...item, status: "cancelled" }
            : item
        ),
      };
    }

    case "payCommitment": {
      const commitment = state.commitments.find(
        (item) =>
          item.id === scenario.commitmentId &&
          item.status === "upcoming"
      );

      if (!commitment) return state;

      const transaction = {
        id: nextTransactionId(),
        description: commitment.name,
        category: "Commitments",
        amount: commitment.amount,
        day: state.currentDay,
        type: "expense",
        countsTowardPace: false,
      };

      return {
        ...state,
        transactions: [...state.transactions, transaction],
        commitments: state.commitments.map((item) =>
          item.id === scenario.commitmentId
            ? { ...item, status: "paid" }
            : item
        ),
      };
    }

    default:
      return state;
  }
}

export function previewScenario(state, scenario) {
  const before = calculateFinance(state);
  const nextState = applyScenarioToState(state, scenario);

  return {
    before,
    after: calculateFinance(nextState),
    nextState,
    changed: nextState !== state,
  };
}
