try {
  const t = localStorage.getItem("dnd-theme");
  document.documentElement.dataset.theme = t ||
    (matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
} catch (e) {
  console.error("Error setting theme:", e);
}