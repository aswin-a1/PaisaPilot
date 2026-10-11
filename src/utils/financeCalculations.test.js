import test from "node:test";
import assert from "node:assert/strict";
import {
  applyScenarioToState,
  buildRunwaySeries,
  calculateFinance,
  createInitialFinanceState,
  describeDecisionImpact,
  previewScenario,
} from "./financeCalculations.js";

test("initial demo metrics match the intended baseline", () => {
  const metrics = calculateFinance(createInitialFinanceState());
  assert.equal(metrics.paidExpenses, 3150);
  assert.equal(metrics.cashBalance, 6350);
  assert.equal(metrics.upcomingCommitments, 1798);
  assert.equal(metrics.remainingSavingsGoal, 500);
  assert.equal(metrics.safeToSpend, 4052);
  assert.equal(metrics.averageDailySpend, 262.5);
  assert.equal(metrics.projectedClosingBalance, -673);
});

test("a one-off purchase reduces cash and forecast without changing recurring pace", () => {
  const state = createInitialFinanceState();
  const before = calculateFinance(state);
  const nextState = applyScenarioToState(state, {
    type: "purchase",
    description: "One-off purchase",
    category: "Shopping",
    amount: 400,
  });
  const after = calculateFinance(nextState);
  const added = nextState.transactions.at(-1);

  assert.equal(after.cashBalance, before.cashBalance - 400);
  assert.equal(after.projectedClosingBalance, before.projectedClosingBalance - 400);
  assert.equal(after.averageDailySpend, before.averageDailySpend);
  assert.equal(added.countsTowardPace, false);
});

test("transaction IDs stay unique after a transaction is removed", () => {
  const state = createInitialFinanceState();
  const withFirst = applyScenarioToState(state, {
    type: "purchase",
    description: "First",
    amount: 10,
  });
  const firstId = withFirst.transactions.at(-1).id;
  const afterDelete = {
    ...withFirst,
    transactions: withFirst.transactions.filter((item) => item.id !== firstId),
  };
  const withSecond = applyScenarioToState(afterDelete, {
    type: "purchase",
    description: "Second",
    amount: 10,
  });
  const secondId = withSecond.transactions.at(-1).id;

  assert.notEqual(secondId, firstId);
  assert.equal(new Set(withSecond.transactions.map((item) => item.id)).size, withSecond.transactions.length);
});

test("paying a commitment moves it from upcoming to paid without double-counting it", () => {
  const state = createInitialFinanceState();
  const before = calculateFinance(state);
  const nextState = applyScenarioToState(state, {
    type: "payCommitment",
    commitmentId: "commitment-1",
  });
  const after = calculateFinance(nextState);
  const phonePlan = nextState.commitments.find((item) => item.id === "commitment-1");

  assert.equal(phonePlan.status, "paid");
  assert.equal(after.paidExpenses, before.paidExpenses + 399);
  assert.equal(after.upcomingCommitments, before.upcomingCommitments - 399);
  assert.equal(after.safeToSpend, before.safeToSpend);
  assert.equal(after.projectedClosingBalance, before.projectedClosingBalance);
});

test("cancelling an unpaid commitment releases the reserved amount", () => {
  const state = createInitialFinanceState();
  const before = calculateFinance(state);
  const nextState = applyScenarioToState(state, {
    type: "cancelCommitment",
    commitmentId: "commitment-1",
  });
  const after = calculateFinance(nextState);

  assert.equal(after.upcomingCommitments, before.upcomingCommitments - 399);
  assert.equal(after.safeToSpend, before.safeToSpend + 399);
});

test("extra income raises cash and forecast but not historical spending pace", () => {
  const state = createInitialFinanceState();
  const before = calculateFinance(state);
  const nextState = applyScenarioToState(state, {
    type: "income",
    description: "Extra income",
    amount: 1000,
  });
  const after = calculateFinance(nextState);

  assert.equal(after.cashBalance, before.cashBalance + 1000);
  assert.equal(after.projectedClosingBalance, before.projectedClosingBalance + 1000);
  assert.equal(after.averageDailySpend, before.averageDailySpend);
});

test("saving more updates savings progress and remaining goal", () => {
  const state = createInitialFinanceState();
  const nextState = applyScenarioToState(state, { type: "savings", amount: 300 });
  const after = calculateFinance(nextState);

  assert.equal(nextState.savingsGoal.saved, 800);
  assert.equal(after.remainingSavingsGoal, 200);
  assert.equal(after.savingsProgress, 0.8);
});

test("invalid monetary amounts are rejected without mutating state", () => {
  const state = createInitialFinanceState();
  assert.equal(applyScenarioToState(state, { type: "purchase", amount: -1 }), state);
  assert.equal(applyScenarioToState(state, { type: "income", amount: 0 }), state);
  assert.equal(applyScenarioToState(state, { type: "savings", amount: Number.NaN }), state);
});

test("savings above the goal are rejected without mutating state", () => {
  const state = createInitialFinanceState();
  const nextState = applyScenarioToState(state, { type: "savings", amount: 501 });
  assert.equal(nextState, state);
  assert.equal(nextState.savingsGoal.saved, 500);
});

test("income IDs stay unique after deletion and another income is added", () => {
  const state = createInitialFinanceState();
  const first = applyScenarioToState(state, { type: "income", description: "First income", amount: 100 });
  const firstId = first.incomes.at(-1).id;
  const afterDelete = { ...first, incomes: first.incomes.filter((income) => income.id !== firstId) };
  const second = applyScenarioToState(afterDelete, { type: "income", description: "Second income", amount: 100 });
  const ids = second.incomes.map((income) => income.id);
  assert.notEqual(ids.at(-1), firstId);
  assert.equal(new Set(ids).size, ids.length);
});

test("simulation day advances to 30 and remains capped", async () => {
  const { advanceFinanceDay } = await import("./financeCalculations.js");
  const day12 = createInitialFinanceState();
  assert.equal(advanceFinanceDay(day12).currentDay, 13);
  const day30 = { ...day12, currentDay: 30 };
  assert.equal(advanceFinanceDay(day30), day30);
});

test("runway series closing identity matches projected closing balance", () => {
  const state = createInitialFinanceState();
  const metrics = calculateFinance(state);
  const series = buildRunwaySeries(state, metrics);
  assert.equal(series.points[0].day, state.currentDay);
  assert.equal(series.points.at(-1).day, 30);
  assert.equal(
    Math.round(series.projectedClosingBalance),
    Math.round(metrics.projectedClosingBalance)
  );
  assert.equal(series.billReserve, metrics.upcomingCommitments);
  assert.equal(series.reservedSavings, metrics.remainingSavingsGoal);
});

test("a one-off purchase lowers the runway without changing daily pace steps", () => {
  const state = createInitialFinanceState();
  const before = buildRunwaySeries(state);
  const nextState = applyScenarioToState(state, {
    type: "purchase",
    description: "One-off purchase",
    amount: 400,
  });
  const after = buildRunwaySeries(nextState);
  const beforePace = before.points.filter((point) => point.day > state.currentDay);
  const afterPace = after.points.filter((point) => point.day > state.currentDay);

  assert.equal(after.points[0].cash, before.points[0].cash - 400);
  assert.deepEqual(
    afterPace.map((point) => point.paceDrop),
    beforePace.map((point) => point.paceDrop)
  );
});

test("paying a bill removes that due-day drop from the runway", () => {
  const state = createInitialFinanceState();
  const before = buildRunwaySeries(state);
  const phoneDue = before.points.find((point) => point.day === 16);
  assert.equal(phoneDue.billDrop, 399);

  const nextState = applyScenarioToState(state, {
    type: "payCommitment",
    commitmentId: "commitment-1",
  });
  const after = buildRunwaySeries(nextState);
  const paidDue = after.points.find((point) => point.day === 16);
  assert.equal(paidDue.billDrop, 0);
  assert.equal(
    Math.round(after.projectedClosingBalance),
    Math.round(before.projectedClosingBalance)
  );
});

test("invalid preview does not change state", () => {
  const state = createInitialFinanceState();
  const preview = previewScenario(state, { type: "purchase", amount: 0 });
  assert.equal(preview.changed, false);
  assert.equal(preview.nextState, state);
});

test("decision impact reports shortfall and runway days for an oversized purchase", () => {
  const state = createInitialFinanceState();
  const preview = previewScenario(state, {
    type: "purchase",
    description: "Too much",
    amount: 5000,
  });
  const impact = describeDecisionImpact(state, preview);
  const daily = preview.before.dailyAllowance;

  assert.equal(impact.changed, true);
  assert.equal(impact.shortfall, true);
  assert.equal(impact.canAfford, false);
  assert.equal(impact.cashDelta, -5000);
  assert.ok(Math.abs(impact.runwayDaysConsumed - 5000 / daily) < 1e-9);
  assert.equal(
    Math.round(impact.breakdown.projectedClosingBalance),
    Math.round(preview.after.projectedClosingBalance)
  );
});
