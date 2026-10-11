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

export const safeNumber = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

const signed = (formatter, value) => {
  const amount = safeNumber(value);
  const formatted = formatter.format(Math.abs(amount));
  return amount < 0 ? `−${formatted}` : formatted;
};

export const money = (value) => signed(integerCurrency, value);

export const exactMoney = (value) => signed(decimalCurrency, value);

export const signedMoney = (value) => {
  const amount = safeNumber(value);
  if (amount > 0) return `+${money(amount)}`;
  return money(amount);
};
