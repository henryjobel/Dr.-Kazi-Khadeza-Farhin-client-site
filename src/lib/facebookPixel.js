export function pushDataLayerEvent(eventName, data = {}) {
  if (typeof window === "undefined" || !eventName) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...data
  });
}

export function trackAppointmentFormView() {
  pushDataLayerEvent("appointment_form_view", {
    form_name: "Doctor Appointment Form",
    doctor_name: "Dr. Kazi Khadeza Farhin"
  });
}

export function trackChamberSelection(chamberName, chamberId) {
  pushDataLayerEvent("chamber_selected", {
    selected_chamber: chamberName,
    selected_chamber_id: chamberId
  });
}

export function createAppointmentEventId() {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function"
        ? Array.from(crypto.getRandomValues(new Uint8Array(16)), (value) => value.toString(16).padStart(2, "0")).join("")
        : `${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

  return `appointment_${Date.now()}_${randomPart}`;
}

export function trackAppointmentSuccess({
  eventId,
  formLocation,
  chamberName,
  chamberId,
  serviceName,
  bookingDate,
  language
} = {}) {
  pushDataLayerEvent("appointment_success", {
    event_id: eventId,
    form_location: formLocation,
    chamber_name: chamberName,
    chamber_id: chamberId,
    service_name: serviceName,
    booking_date: bookingDate,
    language
  });
}
