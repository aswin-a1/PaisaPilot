# PaisaPilot

**Your money, before you spend it.**

PaisaPilot is an interactive personal finance simulator built for the PROMPT RUN hackathon. It helps users manage a ₹10,000 budget across 30 days and understand the financial consequences of everyday decisions before committing to them.

Rather than functioning as a basic expense tracker, PaisaPilot connects available cash, spending, savings goals, upcoming commitments, daily allowance, projected closing balance and estimated financial risk.

## Features

- **Financial overview:** Review current cash, safe-to-spend funds, daily allowance and projected Day 30 balance.
- **What-If Money Lab:** Simulate purchases, unexpected expenses, extra income, savings contributions and cancellation of upcoming commitments.
- **Before-and-after comparisons:** Preview how a proposed decision affects key financial metrics before applying it.
- **Transactions:** Review demo transactions and see applied purchases and income reflected in activity.
- **Savings goals:** Track savings progress and the remaining amount needed to reach the target.
- **Commitments:** View upcoming unpaid bills and simulate cancelling eligible commitments.
- **Financial forecast:** Estimate a month-end outcome using historical spending pace, unpaid commitments and the remaining savings allocation.
- **Financial risk and health:** View transparent, application-specific estimates derived from the current demo state.
- **Local persistence:** Keep applied decisions across browser refreshes using localStorage.
- **Reset Demo:** Restore the original sample financial state.

The application uses simulated data and does not connect to real bank accounts or execute real financial transactions.

## Technology stack

- React
- Vite
- JavaScript
- CSS
- ESLint
- Browser localStorage for local persistence

## Getting started

### Prerequisites

Install a current supported version of Node.js and npm.

### Installation

Clone or download this repository, open a terminal in the project directory and run:

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

### Run lint checks

```bash
npm run lint
```

### Create a production build

```bash
npm run build
```

The production output is generated in the `dist/` directory.

## Project structure

```text
src/
├── hooks/
│   └── useFinanceState.js
├── utils/
│   └── financeCalculations.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

- `src/App.jsx` contains the dashboard, navigation, financial views and scenario interactions.
- `src/App.css` contains the dashboard design system, liquid-glass surfaces, progress indicators and responsive styling.
- `src/index.css` contains global styling.
- `src/hooks/useFinanceState.js` manages committed financial state, scenario previews and local persistence.
- `src/utils/financeCalculations.js` contains financial calculations and scenario-state transformations.

## Financial calculation model

The application uses one shared financial state to derive its main financial metrics.

Let:

- `B` = opening budget
- `I` = income received
- `E` = expenses paid
- `S` = savings already transferred
- `C` = unpaid upcoming commitments
- `G` = remaining savings-goal allocation
- `D` = remaining days
- `P` = historical average daily spending pace

The main calculations are:

```text
Cash balance = B + I - E - S

Safe to spend = Cash balance - C - G

Daily allowance = Safe to spend / D
```

The daily allowance is calculated when days remain in the budget period.

The projected closing balance is:

```text
Projected closing balance =
  Cash balance
  - (Historical daily spending pace × Remaining days)
  - Unpaid commitments
  - Remaining savings-goal allocation
```

These calculations are intended to make trade-offs visible. The forecast assumes historical spending pace continues and should be interpreted as an estimate, not a guarantee of future spending.

Savings transfers are treated separately from ordinary consumption expenses. Cancelling an unpaid commitment releases reserved money; it does not create new income.

## Scenario behaviour

A scenario preview calculates a hypothetical outcome without immediately modifying the committed financial state.

When a decision is applied, the relevant financial records and derived metrics are updated. Discarding the preview leaves the committed state unchanged.

Applied changes are stored locally in the browser. This implementation does not provide synchronisation between devices or secure cloud storage.

## Financial health and risk

The financial-health and risk indicators use a product-specific heuristic based on the simulated financial state.

They are explanatory demo metrics, not credit scores, professional financial advice or a prediction with guaranteed accuracy.

## Validation

The project has been checked locally with:

```bash
npm run lint
npm run build
```

Both commands completed successfully in the current development environment.

These checks confirm linting and production compilation; they do not independently prove that every feature has been exhaustively tested.

## Limitations

- The default transactions and commitments are sample data.
- There is no real bank integration.
- There is no remote database or multi-device synchronisation.
- Data persistence depends on browser localStorage.
- Forecasts and financial-health estimates depend on the assumptions implemented in the application.

## Project purpose

PaisaPilot was developed for PROMPT RUN to demonstrate a modern, interactive financial experience in which decisions have visible and interconnected consequences.

**PaisaPilot — Your money, your call.**