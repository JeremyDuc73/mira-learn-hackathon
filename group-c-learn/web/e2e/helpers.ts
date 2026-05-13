export async function isBackendUp(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:8000/v1/health", { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
