import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Product from "./pages/Product";
import "./App.css";

function App() {
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes("chrome") && !userAgent.includes("brave");
    const isBrave = userAgent.includes("brave");

    if (isChrome) {
      document.body.style.zoom = "100%";
    } else if (isBrave) {
      document.body.style.zoom = "100%";
    }
  }, []);

  useEffect(() => {
    const disableZoomKeys = (event) => {
      if ((event.ctrlKey || event.metaKey) && ["+", "-", "0"].includes(event.key)) {
        event.preventDefault();
      }
    };

    const disableWheelZoom = (event) => {
      if (event.ctrlKey) event.preventDefault();
    };

    const disableTouchZoom = (event) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener("keydown", disableZoomKeys);
    document.addEventListener("wheel", disableWheelZoom, { passive: false });
    document.addEventListener("touchmove", disableTouchZoom, { passive: false });

    return () => {
      document.removeEventListener("keydown", disableZoomKeys);
      document.removeEventListener("wheel", disableWheelZoom);
      document.removeEventListener("touchmove", disableTouchZoom);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product" element={<Product />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
