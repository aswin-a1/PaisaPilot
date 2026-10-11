export function commitmentKindLabel(item) {
  const kind =
    item.kind ||
    (item.id === "commitment-1" || item.id === "commitment-2"
      ? "subscription"
      : "bill");
  return kind === "subscription" ? "Subscription" : "Bill";
}

export function commitmentStatusLabel(status) {
  if (status === "paid") return "Paid";
  if (status === "cancelled") return "Cancelled";
  return "Unpaid";
}
