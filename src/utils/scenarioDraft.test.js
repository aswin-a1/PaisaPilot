import test from "node:test";
import assert from "node:assert/strict";
import { createInitialFinanceState } from "./financeCalculations.js";
import {
  createScenarioDraft,
  toScenarioPayload,
  validateScenarioDraft,
} from "./scenarioDraft.js";

test("scenario drafts share one set of defaults", () => {
  const state = createInitialFinanceState();
  const purchase = createScenarioDraft("purchase", state);
  assert.equal(purchase.type, "purchase");
  assert.equal(purchase.amount, "799");
  assert.equal(createScenarioDraft("savings", state).amount, "300");
  assert.equal(
    createScenarioDraft("payCommitment", state, "commitment-2").commitmentId,
    "commitment-2"
  );
});

test("draft validation rejects empty, non-positive and over-goal savings", () => {
  const state = createInitialFinanceState();
  const draft = createScenarioDraft("purchase", state);

  assert.equal(validateScenarioDraft({ ...draft, amount: "0" }, state).ok, false);
  assert.equal(
    validateScenarioDraft({ ...draft, description: "  " }, state).ok,
    false
  );
  assert.equal(
    validateScenarioDraft(createScenarioDraft("savings", state, ""), {
      ...state,
      savingsGoal: { ...state.savingsGoal, saved: 1000 },
    }).ok,
    false
  );
  assert.equal(
    validateScenarioDraft(
      { ...createScenarioDraft("savings", state), amount: "501" },
      state
    ).ok,
    false
  );
  assert.equal(validateScenarioDraft(draft, state).ok, true);
});

test("commitment drafts require an unpaid bill", () => {
  const state = createInitialFinanceState();
  const paid = {
    ...state,
    commitments: state.commitments.map((item) => ({ ...item, status: "paid" })),
  };
  const draft = createScenarioDraft("cancelCommitment", paid);
  assert.equal(validateScenarioDraft(draft, paid).ok, false);
  assert.equal(
    toScenarioPayload(createScenarioDraft("cancelCommitment", state)).commitmentId,
    "commitment-1"
  );
});
