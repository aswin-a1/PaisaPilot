import { Icon, ProgressBar, SectionTitle } from "./ui.jsx";
import { CommitmentList } from "./lists.jsx";
import { money } from "../utils/formatMoney.js";

export function GoalsBillsView({
  financeState,
  metrics,
  onAddSavings,
  onPay,
  onCancel,
  onSimulateCancel,
}) {
  return (
    <div className="primary-grid">
      <article className="glass-panel goals-panel">
        <SectionTitle eyebrow="FUTURE YOU SAYS THANKS" title="Savings goal" />
        <div className="goal-heading">
          <div className="goal-icon">
            <Icon>◎</Icon>
          </div>
          <div>
            <strong>{financeState.savingsGoal.name}</strong>
            <p className="muted">Savings progress</p>
          </div>
        </div>
        <div className="goal-amount-row">
          <strong className="large-number">
            {money(financeState.savingsGoal.saved)}
          </strong>
          <span className="muted">
            of {money(financeState.savingsGoal.target)}
          </span>
        </div>
        <ProgressBar
          value={metrics.savingsProgress}
          color="violet"
          label="Savings goal progress"
        />
        <div className="goal-footer">
          <span className="muted">
            {Math.round(metrics.savingsProgress * 100)}% complete
          </span>
          <strong>{money(metrics.remainingSavingsGoal)} to go</strong>
        </div>
        <button
          className="button-primary full-button"
          type="button"
          onClick={onAddSavings}
        >
          Add to savings ↗
        </button>
      </article>
      <article className="glass-panel commitments-panel">
        <SectionTitle
          eyebrow="UPCOMING OBLIGATIONS"
          title="Commitments & bills"
        />
        <CommitmentList
          commitments={financeState.commitments}
          emptyLabel="No commitments in this demo."
          onPay={onPay}
          onCancel={onCancel}
        />
        <button
          type="button"
          className="button-secondary full-button"
          onClick={onSimulateCancel}
        >
          Simulate a cancellation
        </button>
      </article>
    </div>
  );
}
