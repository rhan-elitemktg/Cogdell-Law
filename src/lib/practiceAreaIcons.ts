// Lucide-style icon inner-paths (viewBox 0 0 24 24) for the top-level practice
// area cards. Stored as KEYS in Sanity; the SVG lives here (presentation, D6).
export const PRACTICE_AREA_ICONS: Record<string, string> = {
  health: "<path d=\"M22 12h-4l-3 9L9 3l-3 9H2\"/>",
  federal: "<path d=\"M3 21h18\"/><path d=\"M5 21V10\"/><path d=\"M9 21V10\"/><path d=\"M15 21V10\"/><path d=\"M19 21V10\"/><path d=\"M2 10 12 4l10 6\"/>",
  fraud: "<path d=\"M12 2 2 7l10 5 10-5-10-5Z\"/><path d=\"m2 12 10 5 10-5\"/><path d=\"m2 17 10 5 10-5\"/>",
  collar: "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"1\"/><path d=\"M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/><path d=\"M3 12h18\"/>",
  appeals: "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z\"/><path d=\"M14 2v6h6\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/>",
};

export const PRACTICE_AREA_ICON_KEYS = Object.keys(PRACTICE_AREA_ICONS);
