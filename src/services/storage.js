const PREFIX = 'accelera:';
const mem = {};
const ls = () => { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; } };

export const storage = {
  get(key, fallback = null) {
    try {
      const s = ls();
      const raw = s ? s.getItem(PREFIX + key) : mem[key];
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { const s = ls(); const raw = JSON.stringify(value); if (s) s.setItem(PREFIX + key, raw); else mem[key] = raw; } catch { /* storage full or blocked */ }
  },
  remove(key) { try { const s = ls(); if (s) s.removeItem(PREFIX + key); else delete mem[key]; } catch { /* ignore */ } },
  clearAll() {
    try { const s = ls(); if (s) Object.keys(s).filter((k) => k.startsWith(PREFIX)).forEach((k) => s.removeItem(k)); } catch { /* ignore */ }
  },
};
