const KEY = "cadmea-fingerprint";

export function getFingerprint(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const fp = `fp_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    localStorage.setItem(KEY, fp);
    return fp;
  } catch {
    return "anon";
  }
}

const ALIAS_KEY = "cadmea-alias";

export function getAlias(): string {
  try {
    return localStorage.getItem(ALIAS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setAlias(value: string): void {
  try {
    localStorage.setItem(ALIAS_KEY, value);
  } catch {
    // ignore
  }
}
