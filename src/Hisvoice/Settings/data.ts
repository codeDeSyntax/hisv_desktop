export const ACCENT_COLORS = [
  { name: "Sage", value: "#10a37f" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Teal", value: "#0d9488" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Stone", value: "#78716c" },
  { name: "Crimson", value: "#dc2626" },
];

export type SectionId = "reading" | "appearance" | "accent";

export const NAV_SECTIONS: { id: SectionId; label: string }[] = [
  { id: "reading", label: "Reading" },
  { id: "appearance", label: "Appearance" },
  { id: "accent", label: "Accent color" },
];
