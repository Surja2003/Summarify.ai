export function getBackendBaseUrl(): string {
  const raw = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
  if (!raw) return '';
  return String(raw).trim().replace(/\/+$/, '');
}

export function buildApiUrl(path: string): string {
  const base = getBackendBaseUrl();
  if (!base) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
