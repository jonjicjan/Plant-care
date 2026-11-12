export function asItems(result) {
  if (Array.isArray(result)) return result;
  return result?.items ?? [];
}