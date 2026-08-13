const DHAKA_UTC_OFFSET_MINUTES = 6 * 60;
const SAME_DAY_CUTOFF_HOUR = 18;

function getDhakaNow() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + DHAKA_UTC_OFFSET_MINUTES * 60000);
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInputValue(value) {
  const [year, month, day] = String(value || "").split("-").map(Number);
  return new Date(year || new Date().getFullYear(), (month || 1) - 1, day || 1);
}

function getCutoffHour(chamber) {
  return Number.isFinite(chamber?.cutoffHour) ? chamber.cutoffHour : SAME_DAY_CUTOFF_HOUR;
}

export function getEarliestBookableDate(chamber) {
  const dhakaNow = getDhakaNow();
  if (dhakaNow.getHours() >= getCutoffHour(chamber)) {
    dhakaNow.setDate(dhakaNow.getDate() + 1);
  }
  return toDateInputValue(dhakaNow);
}

export function isDateAvailableForChamber(value, chamber) {
  if (!value || !chamber?.availableDays?.length) return true;
  const date = parseDateInputValue(value);
  return chamber.availableDays.includes(date.getDay());
}

export function getNextAvailableDate(chamber, fromValue = getEarliestBookableDate(chamber)) {
  const date = parseDateInputValue(fromValue);
  for (let index = 0; index < 370; index += 1) {
    const value = toDateInputValue(date);
    if (value >= fromValue && isDateAvailableForChamber(value, chamber)) {
      return value;
    }
    date.setDate(date.getDate() + 1);
  }
  return fromValue;
}

export function isSameDayBookingClosed(chamber) {
  return getDhakaNow().getHours() >= getCutoffHour(chamber);
}
