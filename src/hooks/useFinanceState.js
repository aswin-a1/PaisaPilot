import { useEffect, useState } from "react";
import {
  createInitialFinanceState,
  calculateFinance,
  previewScenario,
  advanceFinanceDay,
} from "../utils/financeCalculations";

const STORAGE_KEY = "paisapilot-finance-v1";

function loadFinanceState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return createInitialFinanceState();

    const parsed = JSON.parse(saved);

    // Basic shape validation before accepting saved state.
    if (
      !parsed ||
      !Array.isArray(parsed.transactions) ||
      !Array.isArray(parsed.incomes) ||
      !Array.isArray(parsed.commitments) ||
      !parsed.savingsGoal
    ) {
      return createInitialFinanceState();
    }

    return parsed;
  } catch {
    return createInitialFinanceState();
  }
}

export function useFinanceState() {
  const [financeState, setFinanceState] = useState(loadFinanceState);
  const [activeScenario, setActiveScenario] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(financeState)
      );
    } catch {
      // The app remains usable if browser storage is unavailable.
    }
  }, [financeState]);

  const metrics = calculateFinance(financeState);

  const scenarioPreview = activeScenario
    ? previewScenario(financeState, activeScenario)
    : null;

  function previewDecision(scenario) {
    setActiveScenario(scenario);
  }

  function applyDecision() {
    if (!activeScenario) return false;

    const preview = previewScenario(financeState, activeScenario);

    if (!preview.changed) return false;

    setFinanceState(preview.nextState);
    setActiveScenario(null);

    return true;
  }

  function discardDecision() {
    setActiveScenario(null);
  }

  function deleteTransaction(transactionId) {
    setFinanceState((current) => ({
      ...current,
      transactions: current.transactions.filter(
        (item) => item.id !== transactionId
      ),
    }));
  }

  function deleteIncome(incomeId) {
    setFinanceState((current) => ({
      ...current,
      incomes: current.incomes.filter((income) => income.id !== incomeId),
    }));
  }

  function advanceDay() {
    setFinanceState((current) => advanceFinanceDay(current));
    setActiveScenario(null);
  }

  function resetDemo() {
    setFinanceState(createInitialFinanceState());
    setActiveScenario(null);
  }

  return {
    financeState,
    metrics,
    activeScenario,
    scenarioPreview,
    previewDecision,
    applyDecision,
    discardDecision,
    deleteTransaction,
    deleteIncome,
    advanceDay,
    resetDemo,
  };
}