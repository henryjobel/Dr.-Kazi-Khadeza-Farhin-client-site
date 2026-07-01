const DHAKA_UTC_OFFSET_MINUTES = 6 * 60;
const SAME_DAY_CUTOFF_HOUR = 17;

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

export function getEarliestBookableDate() {
  const dhakaNow = getDhakaNow();
  if (dhakaNow.getHours() >= SAME_DAY_CUTOFF_HOUR) {
    dhakaNow.setDate(dhakaNow.getDate() + 1);
  }
  return toDateInputValue(dhakaNow);
}

export function isSameDayBookingClosed() {
  return getDhakaNow().getHours() >= SAME_DAY_CUTOFF_HOUR;
}
