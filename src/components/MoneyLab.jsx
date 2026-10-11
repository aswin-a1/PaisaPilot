import { useEffect, useRef, useState } from "react";
import { Icon, SectionTitle } from "./ui.jsx";
import { RunwayChart } from "./RunwayChart.jsx";
import { describeDecisionImpact } from "../utils/financeCalculations.js";
import { exactMoney, money, signedMoney } from "../utils/formatMoney.js";
import {
  EXPENSE_CATEGORIES,
  SCENARIO_TYPES,
  createScenarioDraft,
  remainingSavingsGoalAmount,
  validateScenarioDraft,
} from "../utils/scenarioDraft.js";

function DecisionVerdict({ impact, daysRemaining }) {
  if (!impact?.changed) return null;
  const runway =
    impact.runwayDaysConsumed == null
      ? "Daily allowance is already at or below zero, so this cannot be expressed in remaining days."
      : impact.runwayDaysConsumed === 0
        ? "This does not consume remaining daily allowance."
        : `This uses about ${impact.runwayDaysConsumed.toFixed(1)} days of the current daily allowance (${daysRemaining} days left).`;

  return (
    <div
      className={`decision-verdict ${impact.canAfford ? "is-affordable" : "is-shortfall"}`}
    >
      <p className="eyebrow">AFFORDABILITY VERDICT</p>
      <strong>
        {impact.canAfford
          ? "You can afford this against safe-to-spend."
          : "This decision creates a shortfall."}
      </strong>
      <p>{runway}</p>
      <ul>
        <li>
          Closing forecast {signedMoney(impact.closingDelta)}
        </li>
        <li>
          Savings still needed {signedMoney(impact.remainingGoalDelta)}
        </li>
        <li>
          {impact.nextBill
            ? impact.nextBillCovered
              ? `Next bill (${impact.nextBill.name}, ${money(impact.nextBill.amount)}) still fits in cash.`
              : `Next bill (${impact.nextBill.name}, ${money(impact.nextBill.amount)}) would no longer fit in cash.`
            : "No unpaid bills remain after this decision."}
        </li>
      </ul>
      <p className="verdict-formula">
        {money(impact.breakdown.cashBalance)} cash −{" "}
        {money(impact.breakdown.paceReserve)} historical pace −{" "}
        {money(impact.breakdown.unpaidBills)} bills −{" "}
        {money(impact.breakdown.remainingSavingsGoal)} remaining goal ={" "}
        {money(impact.breakdown.projectedClosingBalance)}
      </p>
    </div>
  );
}

export function MoneyLab({
  draft,
  setDraft,
  preview,
  state,
  onApply,
  onDiscard,
  onQuickScenario,
}) {
  const [shortfallConfirmationOpen, setShortfallConfirmationOpen] =
    useState(false);
  const shortfallRef = useRef(null);
  const remainingGoal = remainingSavingsGoalAmount(state);
  const validation = validateScenarioDraft(draft, state);
  const impact = describeDecisionImpact(state, preview);
  const isCommitment =
    draft.type === "cancelCommitment" || draft.type === "payCommitment";
  const before = preview?.before;
  const after = preview?.after;
  const needsShortfallConfirm =
    after && (after.cashBalance < 0 || after.safeToSpend < 0);

  useEffect(() => {
    if (shortfallConfirmationOpen) shortfallRef.current?.focus();
  }, [shortfallConfirmationOpen]);

  const update = (key, value) => {
    setShortfallConfirmationOpen(false);
    setDraft({ ...draft, [key]: value });
  };

  const changeType = (type) => {
    setShortfallConfirmationOpen(false);
    setDraft(createScenarioDraft(type, state, draft.commitmentId));
  };

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">THINK BEFORE YOU SPEND</p>
          <p className="display-title">
            What happens if <span>you do?</span>
          </p>
          <p className="muted">
            Experiment with a money decision without changing your committed
            budget. Apply it only when the before/after picture is acceptable.
          </p>
        </div>
        <span className="subtle-pill">SIMULATION MODE</span>
      </section>
      <section className="glass-panel lab-panel">
        <SectionTitle
          eyebrow="YOUR MONEY, BEFORE YOU SPEND IT"
          title="What-If Money Lab"
        />
        <p className="muted lab-intro">
          Try a decision. See cash, runway, savings and unpaid bills move
          together. Nothing is committed until you apply it.
        </p>
        <div className="scenario-types" aria-label="Scenario type">
          {SCENARIO_TYPES.map((type) => (
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
                max={draft.type === "savings" ? remainingGoal : undefined}
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
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
        {!validation.ok && (
          <p className="warning-note" role="alert">
            {validation.message}
          </p>
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
            <DecisionVerdict
              impact={impact}
              daysRemaining={before.daysRemaining}
            />
            <div className="comparison-grid">
              {[
                ["Cash balance", before.cashBalance, after.cashBalance],
                ["Safe to spend", before.safeToSpend, after.safeToSpend],
                [
                  "Daily allowance",
                  before.dailyAllowance,
                  after.dailyAllowance,
                  true,
                ],
                [
                  "Day 30 forecast",
                  before.projectedClosingBalance,
                  after.projectedClosingBalance,
                ],
                [
                  "Saved toward goal",
                  before.savingsTransferred,
                  after.savingsTransferred,
                ],
              ].map(([label, oldValue, newValue, exact]) => (
                <div className="comparison-item" key={label}>
                  <span className="muted">{label}</span>
                  <div className="comparison-values">
                    <span>{exact ? exactMoney(oldValue) : money(oldValue)}</span>
                    <span className="comparison-arrow">→</span>
                    <strong
                      className={
                        newValue < 0
                          ? "negative"
                          : newValue < oldValue
                            ? "warning-text"
                            : "positive"
                      }
                    >
                      {exact ? exactMoney(newValue) : money(newValue)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
            {preview.changed && (
              <RunwayChart
                state={state}
                metrics={before}
                previewState={preview.nextState}
                previewMetrics={after}
              />
            )}
            <div className="preview-insight">
              <Icon>✦</Icon>
              <p>
                Projected closing balance changes by{" "}
                <strong>
                  {money(after.projectedClosingBalance - before.projectedClosingBalance)}
                </strong>
                . Risk changes from {before.riskLabel.toLowerCase()} to{" "}
                {after.riskLabel.toLowerCase()}. Historical pace stays on the
                solid line; the overlay is this one-off decision.
              </p>
            </div>
            {after.safeToSpend < 0 && (
              <p className="warning-note">
                This decision would leave you short of money after commitments
                and your remaining savings target.
              </p>
            )}
            <div className="scenario-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={onDiscard}
              >
                Discard
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  if (needsShortfallConfirm) {
                    setShortfallConfirmationOpen(true);
                  } else {
                    onApply();
                  }
                }}
                disabled={!preview.changed || !validation.ok}
              >
                {needsShortfallConfirm ? "Review shortfall" : "Apply decision"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            {shortfallConfirmationOpen && needsShortfallConfirm && (
              <div
                className="shortfall-confirmation"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="shortfall-title"
                aria-describedby="shortfall-copy"
              >
                <p id="shortfall-copy" role="alert">
                  <strong id="shortfall-title">Shortfall warning.</strong> This
                  decision would leave cash at {money(after.cashBalance)} and
                  safe-to-spend at {money(after.safeToSpend)}. Apply it anyway?
                </p>
                <div className="scenario-actions">
                  <button
                    ref={shortfallRef}
                    type="button"
                    className="button-secondary"
                    onClick={() => setShortfallConfirmationOpen(false)}
                  >
                    Go back
                  </button>
                  <button
                    type="button"
                    className="button-primary"
                    onClick={() => {
                      setShortfallConfirmationOpen(false);
                      onApply();
                    }}
                  >
                    Apply anyway
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      <section className="glass-panel">
        <SectionTitle eyebrow="QUICK EXPERIMENTS" title="Try a scenario" />
        <div className="quick-scenarios">
          <button type="button" onClick={() => onQuickScenario("purchase")}>
            <span className="quick-icon blue">
              <Icon>↗</Icon>
            </span>
            <strong>Buy something</strong>
            <span>See if it fits your budget</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickScenario("unexpectedExpense")}
          >
            <span className="quick-icon rose">
              <Icon>!</Icon>
            </span>
            <strong>Unexpected expense</strong>
            <span>Stress-test your plan</span>
          </button>
          <button type="button" onClick={() => onQuickScenario("income")}>
            <span className="quick-icon green">
              <Icon>↙</Icon>
            </span>
            <strong>Extra income</strong>
            <span>See the upside</span>
          </button>
        </div>
      </section>
    </>
  );
}
