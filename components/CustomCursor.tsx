"use client";

import { useEffect } from "react";

// Small dot that trails the pointer and swells over interactive elements. Uses
// mix-blend-difference (see .cursor-dot) so one dot stays legible on both the
// white canvas and the ink sections. Desktop/fine-pointer only, and never for
// reduced-motion visitors — touch users keep the native cursor untouched.
export default function CustomCursor() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);
    document.documentElement.classList.add("custom-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const interactive = "a,button,.link,input,textarea,select,[data-cursor]";
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest(interactive)) dot.classList.add("is-hover");
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element).closest(interactive)) dot.classList.remove("is-hover");
    };

    let raf = 0;
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      dot.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      dot.remove();
      document.documentElement.classList.remove("custom-cursor");
    };
  }, []);

  return null;
}
