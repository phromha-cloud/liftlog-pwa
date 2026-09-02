const paths = {
  today: '<path d="M12 3v2M5 5l1.4 1.4M19 5l-1.4 1.4M4 12H2m20 0h-2"/><path d="M7 15a5 5 0 1 1 10 0v5H7z"/>',
  plans: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/>',
  history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M5.6 5.6 3 3"/>',
  progress: '<path d="M4 18 9 13l3 3 7-9"/><path d="M14 7h5v5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
  strength: '<path d="M6 8v8M3.5 9.5v5M18 8v8M20.5 9.5v5M6 12h12"/>',
  cardio: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  rest: '<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/>',
  edit: '<path d="m4 16-.8 4 4-.8L18.5 7.9l-3.2-3.2zM13.8 6.2l3.2 3.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  play: '<path d="m8 5 11 7-11 7z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  trash: '<path d="M4 7h16M9 3h6l1 4H8zM6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  report: '<path d="M6 3h9l4 4v14H6zM15 3v5h4M9 13h6M9 17h6"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M5 21h14"/>',
  shield: '<path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  walking: '<circle cx="13" cy="4" r="2"/><path d="m10 21 2-6-3-3 2-5 4 3 3 1M12 15l4 6M9 12l-4 4"/>',
  jogging: '<circle cx="14" cy="4" r="2"/><path d="m9 21 3-6-3-2 3-6 4 3 3 1M12 15l5 5M9 13l-5 3"/>',
  cycling: '<circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/><path d="m6 17 4-8 4 8h-8m4-8h5l3 8M9 6h3"/>',
  elliptical: '<circle cx="12" cy="4" r="2"/><path d="m10 21 2-7-3-4 3-3 3 4 4 1M12 14l4 7M4 20h16"/>',
  rowing: '<circle cx="8" cy="6" r="2"/><path d="m6 20 6-5-4-5 5-2M12 15l7 3M14 9l5 6"/>',
  chest: '<path d="M5 20V9c0-3 2-5 5-5h4c3 0 5 2 5 5v11M5 11c3 0 5 1 7 3 2-2 4-3 7-3M12 14v6"/>',
  backMuscle: '<path d="M8 4c1.5 2 2.5 3 4 3s2.5-1 4-3M8 4 5 8l2 12M16 4l3 4-2 12M7 9l5 4 5-4M12 7v13"/>',
  legs: '<path d="M8 3h4l-1 8-2 10H5l2-10zM16 3h-4l1 8 2 10h4l-2-10z"/>',
  shoulders: '<path d="M4 19v-7c0-3 2-5 5-5h6c3 0 5 2 5 5v7M9 7l3 4 3-4"/>',
  arms: '<path d="M5 17c2-5 4-7 7-7l1-5 3 1-1 5c3 1 4 3 4 6-2 3-5 4-8 4s-5-1-6-4z"/>',
  core: '<path d="M8 4h8l2 5-2 12H8L6 9zM8 10h8M12 4v17"/>',
};

export function svgIcon(name, size = 20, className = "") {
  const content = paths[name] || paths.cardio;
  return `<svg class="svg-icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
}

export const cardioIcon = activity => svgIcon(activity in paths ? activity : "cardio");
export const categoryIcon = category => svgIcon(category === "back" ? "backMuscle" : (category in paths ? category : "strength"));
