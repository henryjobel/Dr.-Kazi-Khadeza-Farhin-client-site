import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./pages/App.jsx";
import Admin from "./pages/Admin.jsx";
import BlogDetailsPage from "./pages/BlogDetails.jsx";
import BlogPage from "./pages/Blog.jsx";
import ContactPage from "./pages/Contact.jsx";
import GalleryPage from "./pages/Gallery.jsx";
import { SiteProvider } from "./siteContext.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SiteProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  </React.StrictMode>
);
