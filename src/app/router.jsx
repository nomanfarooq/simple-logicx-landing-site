import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import ErrorBoundary from "./ErrorBoundary";

// Home is eagerly bundled — it owns the LCP and lazy-loading it would add a
// round trip to the most-visited route (§4.2).
import Home from "../pages/Home";

// Everything else is code-split. RootLayout's <Suspense> handles the fallback.
const Services = lazy(() => import("../pages/Services"));
const ServiceDetail = lazy(() => import("../pages/ServiceDetail"));
const Work = lazy(() => import("../pages/Work"));
const CaseStudy = lazy(() => import("../pages/CaseStudy"));
const About = lazy(() => import("../pages/About"));
const Process = lazy(() => import("../pages/Process"));
const Pricing = lazy(() => import("../pages/Pricing"));
const Contact = lazy(() => import("../pages/Contact"));
const Insights = lazy(() => import("../pages/Insights"));
const Article = lazy(() => import("../pages/Article"));
const Legal = lazy(() => import("../pages/Legal"));
const NotFound = lazy(() => import("../pages/NotFound"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },

      { path: "services", element: <Services /> },
      { path: "services/:slug", element: <ServiceDetail /> },

      { path: "work", element: <Work /> },
      { path: "work/:slug", element: <CaseStudy /> },

      { path: "about", element: <About /> },
      { path: "process", element: <Process /> },
      { path: "pricing", element: <Pricing /> },
      { path: "contact", element: <Contact /> },

      { path: "insights", element: <Insights /> },
      { path: "insights/:slug", element: <Article /> },

      { path: "legal/privacy", element: <Legal doc="privacy" /> },
      { path: "legal/terms", element: <Legal doc="terms" /> },

      // Explicit /404 exists so detail pages can redirect to a real URL when a
      // slug is unknown, rather than rendering a 404 body at the bad path.
      { path: "404", element: <NotFound /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
