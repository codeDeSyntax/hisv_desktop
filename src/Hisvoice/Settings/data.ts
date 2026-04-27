export const ACCENT_COLORS_LIGHT = [
  { name: "Burgundy", value: "#8B3A4B" },
  { name: "Gold", value: "#A68B4C" },
  { name: "Sapphire", value: "#1E3A70" },
  { name: "Olive", value: "#5B7B3D" },
  { name: "Slate", value: "#3D4A5C" },
  { name: "Bronze", value: "#7B5C3D" },
  { name: "Ember", value: "#B84D2F" },
  { name: "Sage", value: "#4A8B5C" },
  { name: "Plum", value: "#5B3A6B" },
  { name: "Charcoal", value: "#2D2D2D" },
];

export const ACCENT_COLORS_DARK = [
  { name: "Burgundy", value: "#E88FA5" },
  { name: "Gold", value: "#E8C968" },
  { name: "Sapphire", value: "#4A9FFF" },
  { name: "Olive", value: "#B5E87B" },
  { name: "Slate", value: "#9EBFFF" },
  { name: "Bronze", value: "#E8B47B" },
  { name: "Ember", value: "#FF9B54" },
  { name: "Sage", value: "#7FEDAE" },
  { name: "Plum", value: "#D99FFF" },
  { name: "Charcoal", value: "#D0D5FF" },
];

// For backwards compatibility, export the light mode as default
export const ACCENT_COLORS = ACCENT_COLORS_LIGHT;

export type SectionId = "reading" | "appearance" | "accent";

export const NAV_SECTIONS: { id: SectionId; label: string }[] = [
  { id: "reading", label: "Reading" },
  { id: "appearance", label: "Appearance" },
  { id: "accent", label: "Accent color" },
];
