import { buildRunwaySeries } from "../utils/financeCalculations.js";
import { money } from "../utils/formatMoney.js";

function seriesToPath(points, xOf, yOf) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xOf(point.day)} ${yOf(point.cash)}`)
    .join(" ");
}

export function RunwayChart({
  state,
  metrics,
  previewState,
  previewMetrics,
}) {
  const series = buildRunwaySeries(state, metrics);
  const previewSeries =
    previewState && previewMetrics
      ? buildRunwaySeries(previewState, previewMetrics)
      : null;
  const values = series.points.map((point) => point.cash);
  if (previewSeries) {
    values.push(...previewSeries.points.map((point) => point.cash));
  }
  values.push(0);
  values.push(series.projectedClosingBalance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1000, max - min);
  const pad = range * 0.12;
  const top = max + pad;
  const bottom = min - pad;
  const width = 360;
  const height = 168;
  const left = 8;
  const right = 352;
  const currentDay = state.currentDay;
  const xOf = (day) =>
    left + ((day - currentDay) / Math.max(1, 30 - currentDay)) * (right - left);
  const yOf = (value) =>
    18 + ((top - value) / Math.max(1, top - bottom)) * (height - 36);
  const path = seriesToPath(series.points, xOf, yOf);
  const previewPath = previewSeries
    ? seriesToPath(previewSeries.points, xOf, yOf)
    : "";
  const zeroY = yOf(0);
  const billPoints = series.points.filter((point) => point.billDrop > 0);
  const closing = previewSeries
    ? previewSeries.projectedClosingBalance
    : series.projectedClosingBalance;
  const closingY = yOf(closing);

  return (
    <div className="forecast-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`30-day money runway from Day ${currentDay} to Day 30. Historical spending pace, unpaid bills on their due days, and remaining savings are shown separately. Projected closing balance: ${money(closing)}.`}
      >
        <line
          x1={left}
          x2={right}
          y1={zeroY}
          y2={zeroY}
          className="runway-zero"
        />
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={left}
            x2={right}
            y1={18 + fraction * (height - 36)}
            y2={18 + fraction * (height - 36)}
            className="runway-grid"
          />
        ))}
        {previewPath && (
          <path d={previewPath} className="runway-preview" fill="none" />
        )}
        <path d={path} className="runway-path" fill="none" />
        {billPoints.map((point) => (
          <circle
            key={`bill-${point.day}`}
            cx={xOf(point.day)}
            cy={yOf(point.cash + point.billDrop)}
            r="3.5"
            className="runway-bill-dot"
          >
            <title>{`Bill due Day ${point.day}: ${money(point.billDrop)}`}</title>
          </circle>
        ))}
        <circle
          cx={xOf(30)}
          cy={closingY}
          r="4.5"
          className={closing < 0 ? "runway-end negative" : "runway-end"}
        />
      </svg>
      <div className="chart-axis">
        <span>Today · Day {currentDay}</span>
        <span>Day 30</span>
      </div>
      <ul className="runway-legend">
        <li>
          <i className="legend-line pace" /> Historical pace ·{" "}
          {money(series.paceReserve)} still expected
        </li>
        <li>
          <i className="legend-dot bill-dot" /> Bills on due days ·{" "}
          {money(series.billReserve)}
        </li>
        <li>
          <i className="legend-dot reserved-dot" /> Savings still reserved ·{" "}
          {money(series.reservedSavings)}
        </li>
        {previewSeries && (
          <li>
            <i className="legend-line preview" /> Decision overlay
          </li>
        )}
      </ul>
    </div>
  );
}
