import React, { useEffect, useMemo, useState } from "react";
import { defaultContent } from "./data/defaultContent.js";
import { getContent } from "./lib/api.js";
import { applySeo } from "./lib/seo.js";

export const SiteContext = React.createContext(null);

export function SiteProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [appointments, setAppointments] = useState(defaultContent.appointments);

  useEffect(() => {
    let active = true;

    getContent()
      .then((remoteContent) => {
        if (active && remoteContent) {
          setContent((prev) => ({ ...prev, ...remoteContent }));
        }
      })
      .catch(() => {
        // Keep the bundled prototype content available if the live API is not ready.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    applySeo({
      title: content.seo?.metaTitle || content.seo?.siteTitle || content.profile?.name,
      description: content.seo?.metaDescription || content.profile?.intro,
      keywords: content.seo?.keywords,
      image: content.seo?.ogImage || content.profile?.portraitImage
    });
  }, [content]);

  const value = useMemo(
    () => ({ content, setContent, appointments, setAppointments }),
    [content, appointments]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
