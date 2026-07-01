import React, { useEffect, useMemo, useState } from "react";
import { getContent } from "./lib/api.js";
import { applySeo } from "./lib/seo.js";

export const SiteContext = React.createContext(null);

const emptyContent = {
  seo: {},
  profile: {
    name: "",
    title: "",
    intro: "",
    phone: "",
    email: "",
    chamber: "",
    heroImage: "",
    portraitImage: ""
  },
  stats: [],
  services: [],
  videos: [],
  blogs: [],
  moments: [],
  home: {
    heroBadge: "",
    heroHeading: "",
    experienceYears: "",
    experienceLabel: "",
    specialistItems: [],
    aboutItems: [],
    journeyItems: [],
    customSections: []
  }
};

export function SiteProvider({ children }) {
  const [content, setContent] = useState(emptyContent);
  const [appointments, setAppointments] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    getContent()
      .then((remoteContent) => {
        if (active && remoteContent) {
          setContent((prev) => ({ ...prev, ...remoteContent }));
        }
      })
      .catch(() => {
        // Content stays empty; the site renders its structural layout without data.
      })
      .finally(() => {
        if (active) setLoaded(true);
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
    () => ({ content, setContent, appointments, setAppointments, loaded }),
    [content, appointments, loaded]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
