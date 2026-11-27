// finder.js — the deal finder's search, filter and sort logic.
// Pure functions over the deal list; render.js owns the DOM.

export const VERDICT_ORDER = { 'new-low': 0, strong: 1, routine: 2 };

export const VERDICT_LABELS = {
  'new-low': 'NEW LOW',
  strong: 'STRONG PRICE',
  routine: 'ROUTINE SALE',
};

/** Money saved on a deal, in dollars. */
export function savingOf(deal) {
  return Math.round((deal.usual - deal.sale) * 100) / 100;
}

/** Discount percent, worked out from the two prices (never trusted from input). */
export function discountOf(deal) {
  if (!deal.usual || deal.usual <= deal.sale) return 0;
  return Math.round((1 - deal.sale / deal.usual) * 100);
}

/** US-dollar formatting, no cents where the price is whole. */
export function money(n) {
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Filter deals by the finder's state: free-text query, category, store,
 * minimum discount and verdict. The query matches product, brand, store
 * and category.
 */
export function filterDeals(deals, state) {
  const q = state.query.trim().toLowerCase();
  return deals.filter((deal) => {
    if (state.category !== 'All' && deal.category !== state.category) return false;
    if (state.store !== 'All stores' && deal.store !== state.store) return false;
    if (state.verdict && deal.verdict !== state.verdict) return false;
    if (discountOf(deal) < state.minDiscount) return false;
    if (q) {
      const hay = [deal.product, deal.brand, deal.store, deal.category, deal.note]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Sort a filtered list by the finder's sort key. */
export function sortDeals(deals, key) {
  const list = [...deals];
  switch (key) {
    case 'discount':
      return list.sort((a, b) => discountOf(b) - discountOf(a) || savingOf(b) - savingOf(a));
    case 'verdict':
      return list.sort(
        (a, b) => VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict] || discountOf(b) - discountOf(a),
      );
    case 'saving':
      return list.sort((a, b) => savingOf(b) - savingOf(a));
    case 'price-low':
      return list.sort((a, b) => a.sale - b.sale);
    case 'price-high':
      return list.sort((a, b) => b.sale - a.sale);
    case 'name':
      return list.sort((a, b) => a.product.localeCompare(b.product));
    default:
      return list;
  }
}

/** Headline numbers for the masthead stats strip. */
export function computeStats(deals) {
  const stores = new Set(deals.map((d) => d.store)).size;
  const categories = new Set(deals.map((d) => d.category)).size;
  const newLows = deals.filter((d) => d.verdict === 'new-low').length;
  const best = deals.reduce(
    (top, d) => (discountOf(d) > discountOf(top) ? d : top),
    deals[0],
  );
  const totalSaving = deals.reduce((sum, d) => sum + savingOf(d), 0);
  return { count: deals.length, stores, categories, newLows, best, totalSaving };
}

/** Distinct categories and stores, in first-seen order, for the filters. */
export function listCategories(deals) {
  return [...new Set(deals.map((d) => d.category))].sort();
}

export function listStores(deals) {
  return [...new Set(deals.map((d) => d.store))].sort();
}
