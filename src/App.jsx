import { useMemo, useState } from "react";
import { useFinanceState } from "./hooks/useFinanceState";
import "./App.css";
const integerCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const decimalCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const safeNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

const money = (value) => {
  const amount = safeNumber(value);
  const formatted = integerCurrency.format(Math.abs(amount));
  return amount < 0 ? `−${formatted}` : formatted;
};

const exactMoney = (value) => {
  const amount = safeNumber(value);
  const formatted = decimalCurrency.format(Math.abs(amount));
  return amount < 0 ? `−${formatted}` : formatted;
};

const navItems = [
  { name: "Overview", icon: "◫" },
  { name: "Money Lab", icon: "⌁" },
  { name: "Transactions", icon: "↕" },
  { name: "Goals & bills", icon: "◎" },
];
function Icon({ children }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}
function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
function MetricCard({ label, value, detail, icon, accent = "blue" }) {
  return (
    <article className={`metric-card accent-${accent}`}>
      <div className="metric-top">
        <span className="muted">{label}</span>
        <span className={`metric-icon ${accent}`}><Icon>{icon}</Icon></span>
      </div>
      <div className="metric-value">{value}</div>
      <p className="metric-detail">{detail}</p>
    </article>
  );
}
function ProgressBar({ value, color = "blue", label = "Progress" }) {
  const normalizedValue = Number.isFinite(value) ? value : 0;
  const percentage = Math.min(100, Math.max(0, normalizedValue * 100));
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={label}
    >
      <div
        className={`progress-fill ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
function ForecastChart({ metrics, currentDay }) {
  const points = [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
    const x = 8 + index * 48;
    const start = 17;
    const end = metrics.projectedClosingBalance < 0 ? 104 : 48;
    const curve = Math.sin(index * 1.3) * 9;
    const y = start + (end - start) * (index / 7) + curve;
    return `${x},${y}`;
  });
  const path = points.join(" ");
  return (
    <div className="forecast-chart">
      <svg
        viewBox="0 0 350 125"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Illustrative 30-day forecast. Projected closing balance: ${money(metrics.projectedClosingBalance)}.`}
      >
        <defs>
          <linearGradient id="forecastGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#53cfff" stopOpacity=".27" />
            <stop offset="100%" stopColor="#53cfff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 55, 85, 115].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="350"
            y2={y}
            stroke="currentColor"
            strokeOpacity=".10"
            strokeDasharray="4 5"
          />
        ))}
        <polygon
          points={`8,125 ${path} 344,125`}
          fill="url(#forecastGlow)"
        />
        <polyline
          points={path}
          fill="none"
          stroke={metrics.projectedClosingBalance < 0 ? "#ff8496" : "#53cfff"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="344"
          cy={metrics.projectedClosingBalance < 0 ? 104 : 48}
          r="4"
          fill={metrics.projectedClosingBalance < 0 ? "#ff8496" : "#53cfff"}
        />
      </svg>
      <div className="chart-axis">
        <span>Today · Day {currentDay}</span>
        <span>Day 30</span>
      </div>
    </div>
  );
}
function ScenarioLab({
  draft,
  setDraft,
  preview,
  state,
  onApply,
  onDiscard,
}) {
  const update = (key, value) => {
    const nextDraft = { ...draft, [key]: value };
    setDraft(nextDraft);
  };

  const changeType = (type) => {
    const defaults = {
      purchase: { description: "New headphones", amount: "799", category: "Shopping" },
      unexpectedExpense: { description: "Unexpected expense", amount: "1500", category: "Health" },
      savings: { description: "Extra savings", amount: "300", category: "Savings" },
      income: { description: "Additional income", amount: "1000", category: "Income" },
      cancelCommitment: { description: "Cancel upcoming bill", amount: "0", category: "Other" },
    };
    const nextDraft = {
      ...draft,
      ...(defaults[type] || defaults.purchase),
      type,
      commitmentId:
        state.commitments.find((item) => item.status === "upcoming")?.id || "",
    };
    setDraft(nextDraft);
  };
  const types = [
    { value: "purchase", label: "Purchase" },
    { value: "unexpectedExpense", label: "Emergency" },
    { value: "savings", label: "Save more" },
    { value: "income", label: "Extra income" },
    { value: "cancelCommitment", label: "Cancel a bill" },
  ];
  const isCommitment = draft.type === "cancelCommitment";
  const before = preview?.before;
  const after = preview?.after;
  return (
    <section className="glass-panel lab-panel">
      <SectionTitle
        eyebrow="YOUR MONEY, BEFORE YOU SPEND IT"
        title="What-If Money Lab"
      />
      <p className="muted lab-intro">
        Try a decision. See the financial consequences. Apply it only when
        you're ready.
      </p>
      <div className="scenario-types" aria-label="Scenario type">
        {types.map((type) => (
          <button
            type="button"
            key={type.value}
            className={`scenario-chip ${draft.type === type.value ? "selected" : ""}`}
            onClick={() => changeType(type.value)}
            aria-pressed={draft.type === type.value}
          >
            {type.label}
          </button>
        ))}
      </div>
      {isCommitment ? (
        <div className="field">
          <label htmlFor="commitment">Upcoming commitment</label>
          <select
            id="commitment"
            value={draft.commitmentId}
            onChange={(event) => update("commitmentId", event.target.value)}
          >
            {state.commitments
              .filter((item) => item.status === "upcoming")
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {money(item.amount)}
                </option>
              ))}
          </select>
          {state.commitments.every((item) => item.status !== "upcoming") && (
            <p className="muted">No upcoming unpaid commitments remain.</p>
          )}
        </div>
      ) : (
        <div className="field-grid">
          <div className="field">
            <label htmlFor="scenario-description">Description</label>
            <input
              id="scenario-description"
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="e.g. New headphones"
              maxLength={70}
            />
          </div>
          <div className="field">
            <label htmlFor="scenario-amount">Amount (₹)</label>
            <input
              id="scenario-amount"
              type="number"
              min="1"
              step="1"
              inputMode="decimal"
              value={draft.amount}
              onChange={(event) => update("amount", event.target.value)}
              placeholder="799"
            />
          </div>
        </div>
      )}
      {(draft.type === "purchase" || draft.type === "unexpectedExpense") && (
        <div className="field">
          <label htmlFor="scenario-category">Category</label>
          <select
            id="scenario-category"
            value={draft.category}
            onChange={(event) => update("category", event.target.value)}
          >
            {["Shopping", "Food", "Transport", "Entertainment", "Health", "Other"].map(
              (category) => (
                <option key={category} value={category}>{category}</option>
              )
            )}
          </select>
        </div>
      )}
      {preview && before && after && (
        <div className="preview-box">
          <div className="preview-heading">
            <div>
              <p className="eyebrow">SIMULATED OUTCOME</p>
              <h3>Before vs. after</h3>
            </div>
            <span className="live-indicator">● LIVE PREVIEW</span>
          </div>
          <div className="comparison-grid">
            {[
              ["Cash balance", before.cashBalance, after.cashBalance],
              ["Safe to spend", before.safeToSpend, after.safeToSpend],
              ["Daily allowance", before.dailyAllowance, after.dailyAllowance],
              ["Day 30 forecast", before.projectedClosingBalance, after.projectedClosingBalance],
            ].map(([label, oldValue, newValue]) => (
              <div className="comparison-item" key={label}>
                <span className="muted">{label}</span>
                <div className="comparison-values">
                  <span>{money(oldValue)}</span>
                  <span className="comparison-arrow">→</span>
                  <strong className={
                    newValue < 0 ? "negative" : newValue < oldValue ? "warning-text" : "positive"
                  }>
                    {money(newValue)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
          <div className="preview-insight">
            <Icon>✦</Icon>
            <p>
              Projected closing balance changes by{" "}
              <strong>{money(after.projectedClosingBalance - before.projectedClosingBalance)}</strong>.
              {" "}Risk changes from {before.riskLabel.toLowerCase()} to{" "}
              {after.riskLabel.toLowerCase()}.
            </p>
          </div>
          {after.safeToSpend < 0 && (
            <p className="warning-note">
              This decision would leave you short of money after commitments
              and your remaining savings target.
            </p>
          )}
          <div className="scenario-actions">
            <button type="button" className="button-secondary" onClick={onDiscard}>
              Discard
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={onApply}
              disabled={!preview.changed || (isCommitment && !after)}
            >
              Apply decision <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
export default function App() {
  const {
    financeState,
    metrics,
    scenarioPreview,
    previewDecision,
    applyDecision,
    discardDecision,
    deleteTransaction,
    resetDemo,
  } = useFinanceState();
  const [view, setView] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState({
    type: "purchase",
    description: "New headphones",
    amount: "799",
    category: "Shopping",
    commitmentId: "commitment-1",
  });
  const startScenario = (type = "purchase", commitmentIdOverride = "") => {
    const nextDraft = {
      type,
      description:
        type === "unexpectedExpense"
          ? "Unexpected expense"
          : type === "savings"
            ? "Extra savings"
            : type === "income"
              ? "Additional income"
              : "New headphones",
      amount:
        type === "unexpectedExpense"
          ? "1500"
          : type === "savings"
            ? "300"
            : type === "income"
              ? "1000"
              : "799",
      category: type === "unexpectedExpense" ? "Health" : "Shopping",
      commitmentId:
        commitmentIdOverride ||
        financeState.commitments.find((item) => item.status === "upcoming")?.id ||
        "",
    };
    setDraft(nextDraft);
    previewDecision({
      ...nextDraft,
      amount: Number(nextDraft.amount),
    });
    setView("Money Lab");
  };
  const updateDraft = (nextDraft) => {
    setDraft(nextDraft);
    previewDecision({
      ...nextDraft,
      amount: Number(nextDraft.amount),
    });
  };
  const applyCurrentScenario = () => {
    const applied = applyDecision();
    if (applied) {
      setNotice("Decision applied. Your financial overview has been updated.");
    } else {
      setNotice("This decision could not be applied. Check the scenario details.");
    }
  };
  const discardCurrentScenario = () => {
    discardDecision();
    setNotice("Simulation discarded. Your committed finances are unchanged.");
  };
  const transactions = useMemo(
    () => [
      ...financeState.transactions,
      ...financeState.incomes.map((income) => ({
        ...income,
        category: "Income",
        type: "income",
      })),
    ].sort((a, b) => b.day - a.day),
    [financeState.transactions, financeState.incomes]
  );
  const savingsProgress = metrics.savingsProgress;
  const reset = () => {
    if (window.confirm("Reset all changes and restore the original demo?")) {
      resetDemo();
      setNotice("Demo reset to its original state.");
      setView("Overview");
    }
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#overview"
          onClick={(event) => {
            event.preventDefault();
            setView("Overview");
          }}
          aria-label="PaisaPilot overview"
        >
          <img
            className="brand-logo"
            src="/paisapilot-logo.png"
            alt=""
            width="46"
            height="46"
          />
          <span className="brand-name">paisa<span>pilot</span></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              type="button"
              className={`nav-item ${view === item.name ? "active" : ""}`}
              key={item.name}
              onClick={() => {
                setView(item.name);
                setNotice("");
                if (item.name === "Money Lab") startScenario("purchase");
              }}
            >
              <Icon>{item.icon}</Icon>
              <span>{item.name}</span>
              {item.name === "Money Lab" && <span className="nav-spark">✦</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">✧</span>
            <p>Small decisions.<br /><strong>Big difference.</strong></p>
          </div>
          <button type="button" className="reset-button" onClick={reset}>
            <Icon>↺</Icon> Reset demo
          </button>
          <div className="profile">
            <div className="avatar">P</div>
            <div><strong>Personal wallet</strong><span>30-day challenge</span></div>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR FINANCIAL SPACE</p>
            <h1>{view === "Overview" ? "Money overview" : view}</h1>
          </div>
          <div className="topbar-right">
            <span className="period-badge"><span className="status-dot" /> DAY {financeState.currentDay} OF 30</span>
            <button
              type="button"
              className="avatar top-avatar"
              aria-label="Reset demo"
              onClick={reset}
            >P</button>
          </div>
        </header>
        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button>
          </div>
        )}
        {view === "Overview" && (
          <>
            <section className="welcome-row">
              <div>
                <p className="eyebrow">YOUR 30-DAY PLAN · YOUR MONEY, YOUR CALL</p>
                <h2>Make your money <span>make sense.</span></h2>
                <p className="muted">
                  You have {metrics.daysRemaining} days left. Let's make every rupee count.
                </p>
              </div>
              <button type="button" className="button-primary" onClick={() => startScenario("purchase")}>
                <Icon>⌁</Icon> Open Money Lab
              </button>
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
                detail={metrics.projectedClosingBalance < 0 ? "Projected shortfall" : "Projected closing balance"}
                icon="⌁"
                accent={metrics.projectedClosingBalance < 0 ? "rose" : "cyan"}
              />
            </section>
            <section className="primary-grid">
              <article className="glass-panel budget-panel">
                <SectionTitle
                  eyebrow="YOUR MONEY IN MOTION"
                  title="30-day budget"
                  action={<span className="subtle-pill">₹10,000 starting budget</span>}
                />
                <div className="budget-number-row">
                  <div>
                    <p className="muted">Budget spent</p>
                    <strong className="large-number">{money(metrics.paidExpenses)}</strong>
                  </div>
                  <div className="budget-percentage">
                    {Math.round((metrics.paidExpenses / financeState.budget) * 100)}%
                    <span>of budget</span>
                  </div>
                </div>
                <ProgressBar value={metrics.paidExpenses / Math.max(1, financeState.budget)} label="Budget spent" />
                <div className="budget-legend">
                  <span><i className="legend-dot blue-dot" /> Paid expenses</span>
                  <span><i className="legend-dot violet-dot" /> Savings allocated</span>
                  <span><i className="legend-dot muted-dot" /> Remaining cash</span>
                </div>
                <div className="budget-breakdown">
                  <div><span className="muted">Savings allocated</span><strong>{money(metrics.savingsTransferred)}</strong></div>
                  <div><span className="muted">Unpaid commitments</span><strong>{money(metrics.upcomingCommitments)}</strong></div>
                  <div><span className="muted">Savings still needed</span><strong>{money(metrics.remainingSavingsGoal)}</strong></div>
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
        2 * Math.PI * 58.5 *
        (1 - Math.max(0, Math.min(100, metrics.financialHealth)) / 100)
      }
    />
  </svg>
  <div className="health-ring-inner">
    <strong>{metrics.financialHealth}</strong>
    <span>/ 100</span>
  </div>
</div>
                  <div className="health-description">
                    <span className={`risk-badge risk-${metrics.riskLabel.toLowerCase()}`}>
                      {metrics.riskLabel} risk
                    </span>
                    <strong>{metrics.financialHealth >= 70 ? "Room to breathe" : metrics.financialHealth >= 45 ? "Keep an eye on spending" : "Time to make a plan"}</strong>
                    <p className="muted">
                      {metrics.projectedClosingBalance < 0
                        ? `At your current pace, you may fall short by ${money(Math.abs(metrics.projectedClosingBalance))}.`
                        : "Your current forecast remains above zero."}
                    </p>
                  </div>
                </div>
                <div className="health-footnote">An estimate based on your current demo data, not a credit score.</div>
              </article>
            </section>
            <section className="primary-grid lower-grid">
              <article className="glass-panel forecast-panel">
                <SectionTitle eyebrow="LOOKING AHEAD" title="Your money runway" action={<span className="subtle-pill">DAY {financeState.currentDay} → 30</span>} />
                <div className="forecast-summary">
                  <div>
                    <p className="muted">Projected closing balance</p>
                    <strong className={`large-number ${metrics.projectedClosingBalance < 0 ? "negative" : "positive"}`}>
                      {money(metrics.projectedClosingBalance)}
                    </strong>
                  </div>
                  <div className="forecast-tag"><span className="status-dot" /> 30-day projection</div>
                </div>
                <ForecastChart metrics={metrics} currentDay={financeState.currentDay} />
                <p className="muted forecast-note">
                  Based on your historical daily spending pace, unpaid bills and remaining savings target.
                </p>
              </article>
              <article className="glass-panel goals-panel">
                <SectionTitle eyebrow="SAVE WITH PURPOSE" title="Your savings goal" />
                <div className="goal-heading">
                  <div className="goal-icon"><Icon>◎</Icon></div>
                  <div><strong>{financeState.savingsGoal.name}</strong><p className="muted">Your safety net</p></div>
                </div>
                <div className="goal-amount-row">
                  <strong className="large-number">{money(financeState.savingsGoal.saved)}</strong>
                  <span className="muted">of {money(financeState.savingsGoal.target)}</span>
                </div>
                <ProgressBar value={savingsProgress} color="violet" label="Savings goal progress" />
                <div className="goal-footer">
                  <span className="muted">{Math.round(savingsProgress * 100)}% complete</span>
                  <strong>{money(metrics.remainingSavingsGoal)} to go</strong>
                </div>
                <button type="button" className="button-secondary full-button" onClick={() => startScenario("savings")}>
                  Add to savings <span aria-hidden="true">↗</span>
                </button>
              </article>
            </section>
            <section className="primary-grid lower-grid">
              <article className="glass-panel transactions-panel">
                <SectionTitle
                  eyebrow="WHERE YOUR MONEY GOES"
                  title="Recent transactions"
                  action={<button type="button" className="text-button" onClick={() => setView("Transactions")}>View all ↗</button>}
                />
                <div className="transaction-list">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div className="transaction-row" key={transaction.id}>
                      <div className={`transaction-icon ${transaction.type}`}>
                        <Icon>{transaction.type === "income" ? "↙" : "↗"}</Icon>
                      </div>
                      <div className="transaction-description">
                        <strong>{transaction.description}</strong>
                        <span>{transaction.category} · Day {transaction.day}</span>
                      </div>
                      <strong className={transaction.type === "income" ? "positive" : ""}>
                        {transaction.type === "income" ? "+" : "−"}{money(transaction.amount)}
                      </strong>
                    </div>
                  ))}
                </div>
              </article>
              <article className="glass-panel commitments-panel">
                <SectionTitle eyebrow="PLAN AHEAD" title="Upcoming commitments" action={<button type="button" className="text-button" onClick={() => setView("Goals & bills")}>View all ↗</button>} />
                <div className="commitment-list">
                  {financeState.commitments
                    .filter((item) => item.status === "upcoming")
                    .map((item) => (
                      <div className="commitment-row" key={item.id}>
                        <div className="commitment-date">
                          <strong>{String(item.dueDay).padStart(2, "0")}</strong>
                          <span>DAY</span>
                        </div>
                        <div className="commitment-description">
                          <strong>{item.name}</strong>
                          <span>Due day {item.dueDay}</span>
                        </div>
                        <strong>{money(item.amount)}</strong>
                      </div>
                    ))}
                  {metrics.upcomingCommitments === 0 && (
                    <p className="muted">No unpaid commitments remain.</p>
                  )}
                </div>
                <div className="commitment-total">
                  <span className="muted">Total unpaid commitments</span>
                  <strong>{money(metrics.upcomingCommitments)}</strong>
                </div>
                <button type="button" className="button-secondary full-button" onClick={() => startScenario("cancelCommitment")}>
                  Review a subscription <span aria-hidden="true">↗</span>
                </button>
              </article>
            </section>
          </>
        )}
        {view === "Money Lab" && (
          <>
            <section className="welcome-row">
              <div>
                <p className="eyebrow">THINK BEFORE YOU SPEND</p>
                <h2>What happens if <span>you do?</span></h2>
                <p className="muted">Experiment with a money decision without changing your actual budget.</p>
              </div>
              <span className="subtle-pill">SIMULATION MODE</span>
            </section>
            <ScenarioLab
              draft={draft}
              setDraft={updateDraft}
              preview={scenarioPreview}
              state={financeState}
              onApply={applyCurrentScenario}
              onDiscard={discardCurrentScenario}
            />
            <section className="glass-panel">
              <SectionTitle eyebrow="QUICK EXPERIMENTS" title="Try a scenario" />
              <div className="quick-scenarios">
                <button type="button" onClick={() => startScenario("purchase")}>
                  <span className="quick-icon blue"><Icon>↗</Icon></span>
                  <strong>Buy something</strong><span>See if it fits your budget</span>
                </button>
                <button type="button" onClick={() => startScenario("unexpectedExpense")}>
                  <span className="quick-icon rose"><Icon>!</Icon></span>
                  <strong>Unexpected expense</strong><span>Stress-test your plan</span>
                </button>
                <button type="button" onClick={() => startScenario("income")}>
                  <span className="quick-icon green"><Icon>↙</Icon></span>
                  <strong>Extra income</strong><span>See the upside</span>
                </button>
              </div>
            </section>
          </>
        )}
        {view === "Transactions" && (
          <section className="glass-panel transactions-page">
            <SectionTitle eyebrow="YOUR ACTIVITY" title="All transactions" />
            <p className="muted">Demo activity from your current 30-day financial plan.</p>
            <div className="transaction-list">
              {transactions.map((transaction) => (
                <div className="transaction-row" key={transaction.id}>
                  <div className={`transaction-icon ${transaction.type}`}><Icon>{transaction.type === "income" ? "↙" : "↗"}</Icon></div>
                  <div className="transaction-description">
                    <strong>{transaction.description}</strong>
                    <span>{transaction.category} · Day {transaction.day}</span>
                  </div>
                  <strong className={transaction.type === "income" ? "positive" : ""}>
                    {transaction.type === "income" ? "+" : "−"}{money(transaction.amount)}
                  </strong>
                  {transaction.type !== "income" && transaction.category !== "Commitments" && (
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => {
                        deleteTransaction(transaction.id);
                        setNotice("Transaction deleted.");
                      }}
                      aria-label={`Delete ${transaction.description}`}
                    >×</button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {view === "Goals & bills" && (
          <div className="primary-grid">
            <article className="glass-panel goals-panel">
              <SectionTitle eyebrow="FUTURE YOU SAYS THANKS" title="Savings goal" />
              <div className="goal-heading"><div className="goal-icon"><Icon>◎</Icon></div><div><strong>{financeState.savingsGoal.name}</strong><p className="muted">Savings progress</p></div></div>
              <div className="goal-amount-row"><strong className="large-number">{money(financeState.savingsGoal.saved)}</strong><span className="muted">of {money(financeState.savingsGoal.target)}</span></div>
              <ProgressBar value={savingsProgress} color="violet" label="Savings goal progress" />
              <div className="goal-footer"><span className="muted">{Math.round(savingsProgress * 100)}% complete</span><strong>{money(metrics.remainingSavingsGoal)} to go</strong></div>
              <button className="button-primary full-button" type="button" onClick={() => startScenario("savings")}>Add to savings ↗</button>
            </article>
            <article className="glass-panel commitments-panel">
              <SectionTitle eyebrow="UPCOMING OBLIGATIONS" title="Commitments & bills" />
              {financeState.commitments.map((item) => (
                <div className="commitment-row" key={item.id}>
                  <div className="commitment-date"><strong>{String(item.dueDay).padStart(2, "0")}</strong><span>DAY</span></div>
                  <div className="commitment-description"><strong>{item.name}</strong><span>{item.status === "upcoming" ? "Unpaid" : item.status === "paid" ? "Paid" : "Cancelled"}</span></div>
                  <strong>{money(item.amount)}</strong>
                  {item.status === "upcoming" && (
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => startScenario("cancelCommitment", item.id)}
                      aria-label={`Review cancellation of ${item.name}`}
                    >↗</button>
                  )}
                </div>
              ))}
              <button type="button" className="button-secondary full-button" onClick={() => startScenario("cancelCommitment")}>Simulate a cancellation</button>
            </article>
          </div>
        )}
        <footer className="app-footer">
          <span>PAISAPILOT <span className="footer-dot">✦</span> YOUR MONEY, YOUR CALL</span>
          <span>Demo data · No bank connection</span>
        </footer>
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.name}
            className={view === item.name ? "active" : ""}
            onClick={() => {
              if (item.name === "Money Lab") startScenario("purchase");
              else setView(item.name);
            }}
          >
            <Icon>{item.icon}</Icon><span>{item.name === "Goals & bills" ? "Goals" : item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
