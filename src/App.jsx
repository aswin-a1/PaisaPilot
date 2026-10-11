import { useMemo, useState } from "react";
import { useFinanceState } from "./hooks/useFinanceState";
import { AppChrome } from "./components/AppChrome.jsx";
import { GoalsBillsView } from "./components/GoalsBillsView.jsx";
import { MoneyLab } from "./components/MoneyLab.jsx";
import { Notice } from "./components/ui.jsx";
import { OverviewDashboard } from "./components/OverviewDashboard.jsx";
import { ResetDialog } from "./components/ResetDialog.jsx";
import { TransactionsView } from "./components/TransactionsView.jsx";
import {
  createScenarioDraft,
  toScenarioPayload,
} from "./utils/scenarioDraft.js";
import "./App.css";

export default function App() {
  const {
    financeState,
    metrics,
    scenarioPreview,
    previewDecision,
    applyDecision,
    discardDecision,
    deleteTransaction,
    deleteIncome,
    advanceDay,
    resetDemo,
  } = useFinanceState();
  const [view, setView] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [draft, setDraft] = useState(() =>
    createScenarioDraft("purchase", financeState)
  );

  const startScenario = (type = "purchase", commitmentIdOverride = "") => {
    const nextDraft = createScenarioDraft(
      type,
      financeState,
      commitmentIdOverride
    );
    setDraft(nextDraft);
    previewDecision(toScenarioPayload(nextDraft));
    setView("Money Lab");
    setNotice("");
  };

  const openMoneyLab = () => {
    setView("Money Lab");
    setNotice("");
    previewDecision(toScenarioPayload(draft));
  };

  const updateDraft = (nextDraft) => {
    setDraft(nextDraft);
    previewDecision(toScenarioPayload(nextDraft));
  };

  const applyCurrentScenario = () => {
    const applied = applyDecision();
    if (applied) {
      setNotice("Decision applied. Your financial overview has been updated.");
    } else {
      setNotice(
        "This decision could not be applied. Check the scenario details."
      );
    }
  };

  const discardCurrentScenario = () => {
    discardDecision();
    setNotice("Simulation discarded. Your committed finances are unchanged.");
  };

  const advanceSimulationDay = () => {
    if (financeState.currentDay >= 30) return;
    const nextDay = Math.min(30, financeState.currentDay + 1);
    advanceDay();
    setView("Overview");
    setNotice(
      nextDay === 30
        ? "Day 30 reached. This 30-day simulation is complete."
        : `Advanced to Day ${nextDay} of 30. Forecasts updated.`
    );
  };

  const transactions = useMemo(
    () =>
      [
        ...financeState.transactions,
        ...financeState.incomes.map((income) => ({
          ...income,
          category: "Income",
          type: "income",
        })),
      ].sort((a, b) => b.day - a.day),
    [financeState.transactions, financeState.incomes]
  );

  const confirmReset = () => {
    resetDemo();
    setNotice("Demo reset to its original state.");
    setView("Overview");
    setResetDialogOpen(false);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <AppChrome
        view={view}
        currentDay={financeState.currentDay}
        onNavigate={(name) => {
          setView(name);
          setNotice("");
        }}
        onOpenMoneyLab={openMoneyLab}
        onReset={() => setResetDialogOpen(true)}
      >
        <Notice message={notice} onDismiss={() => setNotice("")} />
        {view === "Overview" && (
          <OverviewDashboard
            financeState={financeState}
            metrics={metrics}
            transactions={transactions}
            onOpenLab={startScenario}
            onAdvanceDay={advanceSimulationDay}
            onViewTransactions={() => setView("Transactions")}
            onViewGoals={() => setView("Goals & bills")}
          />
        )}
        {view === "Money Lab" && (
          <MoneyLab
            draft={draft}
            setDraft={updateDraft}
            preview={scenarioPreview}
            state={financeState}
            onApply={applyCurrentScenario}
            onDiscard={discardCurrentScenario}
            onQuickScenario={startScenario}
          />
        )}
        {view === "Transactions" && (
          <TransactionsView
            transactions={transactions}
            onDeleteIncome={(item) => {
              deleteIncome(item.id);
              setNotice("Income entry deleted.");
            }}
            onDeleteExpense={(item) => {
              deleteTransaction(item.id);
              setNotice("Transaction deleted.");
            }}
          />
        )}
        {view === "Goals & bills" && (
          <GoalsBillsView
            financeState={financeState}
            metrics={metrics}
            onAddSavings={() => startScenario("savings")}
            onPay={(item) => startScenario("payCommitment", item.id)}
            onCancel={(item) => startScenario("cancelCommitment", item.id)}
            onSimulateCancel={() => startScenario("cancelCommitment")}
          />
        )}
      </AppChrome>
      {resetDialogOpen && (
        <ResetDialog
          onCancel={() => setResetDialogOpen(false)}
          onConfirm={confirmReset}
        />
      )}
    </div>
  );
}
