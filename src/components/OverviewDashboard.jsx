import { Icon, MetricCard, ProgressBar, SectionTitle } from "./ui.jsx";
import { TransactionList, CommitmentList } from "./lists.jsx";
import { RunwayChart } from "./RunwayChart.jsx";
import { exactMoney, money } from "../utils/formatMoney.js";

export function OverviewDashboard({
  financeState,
  metrics,
  transactions,
  onOpenLab,
  onAdvanceDay,
  onViewTransactions,
  onViewGoals,
}) {
  const totalFunds = Math.max(1, financeState.budget + metrics.totalIncome);
  const spentShare = Math.min(
    100,
    Math.max(0, (metrics.paidExpenses / totalFunds) * 100)
  );
  const savedShare = Math.min(
    100 - spentShare,
    Math.max(0, (metrics.savingsTransferred / totalFunds) * 100)
  );
  const cashShare = Math.max(0, 100 - spentShare - savedShare);
  const upcoming = financeState.commitments.filter(
    (item) => item.status === "upcoming"
  );

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">YOUR 30-DAY PLAN · YOUR MONEY, YOUR CALL</p>
          <p className="display-title">
            Make your money <span>make sense.</span>
          </p>
          <p className="muted">
            You have {metrics.daysRemaining} days left. Safe-to-spend already
            holds back unpaid bills and the rest of your savings goal.
          </p>
        </div>
        <div className="welcome-actions">
          <button
            type="button"
            className="button-primary"
            onClick={() => onOpenLab("purchase")}
          >
            <Icon>⌁</Icon> Open Money Lab
          </button>
          <button
            type="button"
            className="button-secondary advance-day-button"
            onClick={onAdvanceDay}
            disabled={financeState.currentDay >= 30}
            aria-label={
              financeState.currentDay >= 30
                ? "30-day simulation complete"
                : `Advance simulation to Day ${financeState.currentDay + 1}`
            }
          >
            {financeState.currentDay >= 30
              ? "30-day plan complete"
              : `Advance to Day ${financeState.currentDay + 1}`}{" "}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
      <section className="metrics-grid">
        <MetricCard
          label="Current cash balance"
          value={money(metrics.cashBalance)}
          detail={`${money(metrics.totalIncome)} additional income`}
          icon="₹"
          accent="blue"
        />
        <MetricCard
          label="Safe to spend"
          value={money(metrics.safeToSpend)}
          detail="After bills & savings target"
          icon="↗"
          accent="green"
        />
        <MetricCard
          label="Daily allowance"
          value={exactMoney(metrics.dailyAllowance)}
          detail={`${metrics.daysRemaining} days remaining`}
          icon="◷"
          accent="violet"
        />
        <MetricCard
          label="Day 30 forecast"
          value={money(metrics.projectedClosingBalance)}
          detail={
            metrics.projectedClosingBalance < 0
              ? "Projected shortfall"
              : "Projected closing balance"
          }
          icon="⌁"
          accent={metrics.projectedClosingBalance < 0 ? "rose" : "cyan"}
        />
      </section>
      <section className="primary-grid">
        <article className="glass-panel budget-panel">
          <SectionTitle
            eyebrow="YOUR MONEY IN MOTION"
            title="30-day budget"
            action={
              <span className="subtle-pill">₹10,000 starting budget</span>
            }
          />
          <div className="budget-number-row">
            <div>
              <p className="muted">Spent from available funds</p>
              <strong className="large-number">
                {money(metrics.paidExpenses)}
              </strong>
            </div>
            <div className="budget-percentage">
              {Math.round((metrics.paidExpenses / totalFunds) * 100)}%
              <span>of available funds</span>
            </div>
          </div>
          <div
            className="budget-stack"
            role="img"
            aria-label={`Of ${money(totalFunds)} in starting funds and additional income, ${money(metrics.paidExpenses)} has been spent, ${money(metrics.savingsTransferred)} allocated to savings, and current cash balance is ${money(metrics.cashBalance)}.`}
          >
            <span
              className="budget-segment budget-segment-spent"
              style={{ width: `${spentShare}%` }}
            />
            <span
              className="budget-segment budget-segment-saved"
              style={{ width: `${savedShare}%` }}
            />
            <span
              className="budget-segment budget-segment-cash"
              style={{ width: `${cashShare}%` }}
            />
          </div>
          <div className="budget-legend">
            <span>
              <i className="legend-dot blue-dot" /> Paid expenses
            </span>
            <span>
              <i className="legend-dot violet-dot" /> Savings allocated
            </span>
            <span>
              <i className="legend-dot muted-dot" /> Remaining cash
            </span>
          </div>
          <div className="budget-breakdown">
            <div>
              <span className="muted">Savings allocated</span>
              <strong>{money(metrics.savingsTransferred)}</strong>
            </div>
            <div>
              <span className="muted">Unpaid commitments</span>
              <strong>{money(metrics.upcomingCommitments)}</strong>
            </div>
            <div>
              <span className="muted">Savings still needed</span>
              <strong>{money(metrics.remainingSavingsGoal)}</strong>
            </div>
          </div>
        </article>
        <article className="glass-panel health-panel">
          <SectionTitle eyebrow="FINANCIAL WELLBEING" title="Money health" />
          <div className="health-layout">
            <div
              className="health-ring"
              role="img"
              aria-label={`Estimated financial health ${metrics.financialHealth} out of 100`}
            >
              <svg
                className="health-ring-svg"
                viewBox="0 0 128 128"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="healthGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#55e5ff" />
                    <stop offset="100%" stopColor="#587aff" />
                  </linearGradient>
                </defs>
                <circle
                  className="health-ring-track"
                  cx="64"
                  cy="64"
                  r="58.5"
                />
                <circle
                  className="health-ring-progress"
                  cx="64"
                  cy="64"
                  r="58.5"
                  strokeDasharray={2 * Math.PI * 58.5}
                  strokeDashoffset={
                    2 *
                    Math.PI *
                    58.5 *
                    (1 -
                      Math.max(0, Math.min(100, metrics.financialHealth)) /
                        100)
                  }
                />
              </svg>
              <div className="health-ring-inner">
                <strong>{metrics.financialHealth}</strong>
                <span>/ 100</span>
              </div>
            </div>
            <div className="health-description">
              <span
                className={`risk-badge risk-${metrics.riskLabel.toLowerCase()}`}
              >
                {metrics.riskLabel} risk
              </span>
              <strong>
                {metrics.financialHealth >= 70
                  ? "Room to breathe"
                  : metrics.financialHealth >= 45
                    ? "Keep an eye on spending"
                    : "Time to make a plan"}
              </strong>
              <p className="muted">
                {metrics.projectedClosingBalance < 0
                  ? `At your current pace, you may fall short by ${money(Math.abs(metrics.projectedClosingBalance))}.`
                  : "Your current forecast remains above zero."}
              </p>
            </div>
          </div>
          <div className="health-footnote">
            An estimate based on your current demo data, not a credit score.
          </div>
          <details className="risk-method">
            <summary>How is risk estimated?</summary>
            <p>
              This educational estimate starts at 20 points, adds risk when the
              Day 30 forecast is negative (scaled against your starting budget),
              adds up to 25 points when spending pace exceeds your daily
              allowance, and adds 10 points when the savings goal is less than
              half complete. The result is clamped to 0–100; higher risk means
              lower money health.
            </p>
          </details>
        </article>
      </section>
      <section className="primary-grid lower-grid">
        <article className="glass-panel forecast-panel">
          <SectionTitle
            eyebrow="LOOKING AHEAD"
            title="Your money runway"
            action={
              <span className="subtle-pill">
                DAY {financeState.currentDay} → 30
              </span>
            }
          />
          <div className="forecast-summary">
            <div>
              <p className="muted">Projected closing balance</p>
              <strong
                className={`large-number ${metrics.projectedClosingBalance < 0 ? "negative" : "positive"}`}
              >
                {money(metrics.projectedClosingBalance)}
              </strong>
            </div>
            <div className="forecast-tag">
              <span className="status-dot" /> Live model, not decoration
            </div>
          </div>
          <div className="runway-formula" aria-label="Forecast composition">
            <span>{money(metrics.cashBalance)} cash</span>
            <span>− {money(metrics.averageDailySpend * metrics.daysRemaining)} pace</span>
            <span>− {money(metrics.upcomingCommitments)} bills</span>
            <span>− {money(metrics.remainingSavingsGoal)} savings</span>
            <span>= {money(metrics.projectedClosingBalance)}</span>
          </div>
          <RunwayChart state={financeState} metrics={metrics} />
          <p className="muted forecast-note">
            The solid line is cash after historical daily spending and bills on
            their due days. One-off purchases drop cash immediately and are not
            assumed to repeat. Remaining savings is reserved at the end, which
            is why the Day 30 number can sit below the line.
          </p>
        </article>
        <article className="glass-panel goals-panel">
          <SectionTitle eyebrow="SAVE WITH PURPOSE" title="Your savings goal" />
          <div className="goal-heading">
            <div className="goal-icon">
              <Icon>◎</Icon>
            </div>
            <div>
              <strong>{financeState.savingsGoal.name}</strong>
              <p className="muted">Your safety net</p>
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
            type="button"
            className="button-secondary full-button"
            onClick={() => onOpenLab("savings")}
          >
            Add to savings <span aria-hidden="true">↗</span>
          </button>
        </article>
      </section>
      <section className="primary-grid lower-grid">
        <article className="glass-panel transactions-panel">
          <SectionTitle
            eyebrow="WHERE YOUR MONEY GOES"
            title="Recent transactions"
            action={
              <button
                type="button"
                className="text-button"
                onClick={onViewTransactions}
              >
                View all ↗
              </button>
            }
          />
          <TransactionList transactions={transactions.slice(0, 5)} />
        </article>
        <article className="glass-panel commitments-panel">
          <SectionTitle
            eyebrow="PLAN AHEAD"
            title="Upcoming commitments"
            action={
              <button
                type="button"
                className="text-button"
                onClick={onViewGoals}
              >
                View all ↗
              </button>
            }
          />
          <CommitmentList commitments={upcoming} />
          <div className="commitment-total">
            <span className="muted">Total unpaid commitments</span>
            <strong>{money(metrics.upcomingCommitments)}</strong>
          </div>
          <button
            type="button"
            className="button-secondary full-button"
            onClick={() => onOpenLab("cancelCommitment")}
          >
            Review a subscription <span aria-hidden="true">↗</span>
          </button>
        </article>
      </section>
    </>
  );
}
