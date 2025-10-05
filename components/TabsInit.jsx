"use client";
import { useEffect } from "react";

export default function TabsInit() {
  useEffect(() => {
    function initTabs(root) {
      if (!root || root.dataset.tabsInited) return;
      const tabs   = Array.from(root.querySelectorAll('[role="tab"]'));
      const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
      if (!tabs.length || !panels.length) return;
      root.dataset.tabsInited = "1";

      const videos = () => Array.from(root.querySelectorAll("video"));

      function activateTab(tab) {
        tabs.forEach((t) => {
          const selected = t === tab;
          t.classList.toggle("is-active", selected);
          t.setAttribute("aria-selected", selected ? "true" : "false");
          t.tabIndex = selected ? 0 : -1;
        });
        panels.forEach((p) => {
          p.hidden = p.id !== tab.getAttribute("aria-controls");
        });
        videos().forEach((v) => { try { v.pause(); } catch (e) {} });
        const activePanel = root.querySelector("#" + tab.getAttribute("aria-controls"));
        if (activePanel) activePanel.focus({ preventScroll: true });
      }

      tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab)));

      root.addEventListener("keydown", (e) => {
        const current = document.activeElement;
        if (!current || current.getAttribute("role") !== "tab") return;
        let i = tabs.indexOf(current);
        if (e.key === "ArrowRight") { i = (i + 1) % tabs.length; tabs[i].focus(); e.preventDefault(); }
        if (e.key === "ArrowLeft")  { i = (i - 1 + tabs.length) % tabs.length; tabs[i].focus(); e.preventDefault(); }
        if (e.key === "Home")       { tabs[0].focus(); e.preventDefault(); }
        if (e.key === "End")        { tabs[tabs.length - 1].focus(); e.preventDefault(); }
        if (e.key === "Enter" || e.key === " ") { activateTab(current); e.preventDefault(); }
      });

      activateTab(tabs[0]);
    }

    function tryInit() {
      const el = document.getElementById("ml-tabs");
      if (el) { initTabs(el); return true; }
      return false;
    }

    const onLoad = () => tryInit();
    window.addEventListener("load", onLoad);

    if (!tryInit()) {
      const obs = new MutationObserver(() => { if (tryInit()) obs.disconnect(); });
      obs.observe(document.body, { childList: true, subtree: true });
      return () => obs.disconnect();
    }

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null; // rien à rendre
}

