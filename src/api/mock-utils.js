// Helpers for DEMO / MOCK mode (see USE_MOCK in ./config.js). These let the
// resource modules serve in-memory data with the same shape the real endpoints
// return, so pages don't need to change when toggling mock mode.

/** Resolve after a short delay to mimic network latency. */
export const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

/** Client-side sort + paginate → { rows, total, currentPage, lastPage }. */
export function sortPaginate(list, { pageNo = 1, records = 10, colName = 'name', sort = 'asc' } = {}) {
  const sorted = [...list].sort((a, b) => {
    const av = a[colName];
    const bv = b[colName];
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
    return sort === 'desc' ? -cmp : cmp;
  });
  const total = sorted.length;
  const start = (Math.max(1, pageNo) - 1) * records;
  return {
    rows: sorted.slice(start, start + records),
    total,
    currentPage: pageNo,
    lastPage: Math.max(1, Math.ceil(total / records))
  };
}

let seq = 1000;
/** Monotonic id for newly-created mock records. */
export const nextId = () => ++seq;
