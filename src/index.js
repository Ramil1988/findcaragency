import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Landing from "./Landing";

const Root = () => {
  const getHash = () => (typeof window !== "undefined" ? window.location.hash : "");
  const [hash, setHash] = useState(getHash());

  useEffect(() => {
    const onHashChange = () => setHash(getHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Default to Landing at "/"; render App when at "#app"
  if (hash === "#app") {
    return <App />;
  }
  return <Landing />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
