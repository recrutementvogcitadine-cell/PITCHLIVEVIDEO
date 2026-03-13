"use client";
import { useEffect } from "react";

export default function FullscreenWrapper() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator.userAgent.match(/Mobile|Android|iPhone/)) {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.background = '#000';
      window.scrollTo(0, 1);
    }
  }, []);
  return null;
}
