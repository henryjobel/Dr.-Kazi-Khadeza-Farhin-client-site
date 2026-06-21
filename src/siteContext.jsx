import React, { useMemo, useState } from "react";
import { defaultContent } from "./data/defaultContent.js";

export const SiteContext = React.createContext(null);

export function SiteProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [appointments, setAppointments] = useState(defaultContent.appointments);
  const value = useMemo(
    () => ({ content, setContent, appointments, setAppointments }),
    [content, appointments]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
