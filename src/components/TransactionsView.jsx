import { SectionTitle } from "./ui.jsx";
import { TransactionList } from "./lists.jsx";

export function TransactionsView({
  transactions,
  onDeleteIncome,
  onDeleteExpense,
}) {
  return (
    <section className="glass-panel transactions-page">
      <SectionTitle eyebrow="YOUR ACTIVITY" title="All transactions" />
      <p className="muted">
        Demo activity from your current 30-day financial plan. One-off Money Lab
        decisions are marked so they are not confused with historical spending
        pace.
      </p>
      <TransactionList
        transactions={transactions}
        onDeleteIncome={onDeleteIncome}
        onDeleteExpense={onDeleteExpense}
      />
    </section>
  );
}
