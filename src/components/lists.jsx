import { Icon } from "./ui.jsx";
import { money } from "../utils/formatMoney.js";
import {
  commitmentKindLabel,
  commitmentStatusLabel,
} from "../utils/labels.js";

export function TransactionList({
  transactions,
  onDeleteIncome,
  onDeleteExpense,
}) {
  if (transactions.length === 0) {
    return (
      <p className="muted empty-state">
        No transactions yet. Open Money Lab to simulate your first decision.
      </p>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => (
        <div className="transaction-row" key={transaction.id}>
          <div className={`transaction-icon ${transaction.type}`}>
            <Icon>{transaction.type === "income" ? "↙" : "↗"}</Icon>
          </div>
          <div className="transaction-description">
            <strong>{transaction.description}</strong>
            <span>
              {transaction.category} · Day {transaction.day}
              {transaction.type === "expense" &&
              transaction.countsTowardPace === false
                ? " · One-off"
                : ""}
            </span>
          </div>
          <strong className={transaction.type === "income" ? "positive" : ""}>
            {transaction.type === "income" ? "+" : "−"}
            {money(transaction.amount)}
          </strong>
          {transaction.type === "income" && onDeleteIncome ? (
            <button
              type="button"
              className="icon-button"
              onClick={() => onDeleteIncome(transaction)}
              aria-label={`Delete income ${transaction.description}`}
              title={`Delete income ${transaction.description}`}
            >
              ×
            </button>
          ) : transaction.type === "expense" &&
            transaction.category !== "Commitments" &&
            onDeleteExpense ? (
            <button
              type="button"
              className="icon-button"
              onClick={() => onDeleteExpense(transaction)}
              aria-label={`Delete ${transaction.description}`}
              title={`Delete ${transaction.description}`}
            >
              ×
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function CommitmentList({
  commitments,
  emptyLabel = "No unpaid commitments remain.",
  onPay,
  onCancel,
}) {
  if (commitments.length === 0) {
    return <p className="muted empty-state">{emptyLabel}</p>;
  }

  return (
    <div className="commitment-list">
      {commitments.map((item) => (
        <div className="commitment-row" key={item.id}>
          <div className="commitment-date">
            <strong>{String(item.dueDay).padStart(2, "0")}</strong>
            <span>DAY</span>
          </div>
          <div className="commitment-description">
            <strong>{item.name}</strong>
            <span>
              {item.status === "upcoming"
                ? `${commitmentKindLabel(item)} · Due day ${item.dueDay}`
                : `${commitmentStatusLabel(item.status)} · ${commitmentKindLabel(item)}`}
            </span>
          </div>
          <div className="commitment-meta">
            <strong>{money(item.amount)}</strong>
            {item.status === "upcoming" && (onPay || onCancel) && (
              <div className="commitment-actions">
                {onPay && (
                  <button
                    type="button"
                    className="commitment-pay-button"
                    onClick={() => onPay(item)}
                    aria-label={`Review payment of ${item.name}`}
                    title={`Review payment of ${item.name}`}
                  >
                    Pay
                  </button>
                )}
                {onCancel && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => onCancel(item)}
                    aria-label={`Review cancellation of ${item.name}`}
                    title={`Review cancellation of ${item.name}`}
                  >
                    ↗
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
