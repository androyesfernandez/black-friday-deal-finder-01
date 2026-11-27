// render.js — turns the deal list into DOM: cards, stats, filters, detail view.
// All text goes through textContent (no innerHTML on deal data) so a deal's
// own wording can never inject markup.

import { DEALS } from './deals.js';
import {
  VERDICT_LABELS,
  discountOf,
  filterDeals,
  listCategories,
  listStores,
  money,
  savingOf,
  sortDeals,
  computeStats,
} from './finder.js';

const grid = document.getElementById('grid');
const mainEl = document.querySelector('main');
const resultLine = document.getElementById('result-line');
const empty = document.getElementById('empty');
const detail = document.getElementById('detail');
const searchInput = document.getElementById('search');
const storeSelect = document.getElementById('store');
const discountSelect = document.getElementById('discount');
const verdictSelect = document.getElementById('verdict');
const sortSelect = document.getElementById('sort');
const chipsNav = document.getElementById('categories');

const state = {
  query: '',
  category: 'All',
  store: 'All stores',
  minDiscount: 0,
  verdict: '',
  sort: 'discount',
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function verdictBadge(deal) {
  const badge = el('span', 'badge badge-' + deal.verdict, VERDICT_LABELS[deal.verdict]);
  badge.title =
    deal.verdict === 'new-low'
      ? 'The lowest price the sources show for this product'
      : deal.verdict === 'strong'
        ? 'A genuinely good price, at or near the best seen'
        : 'A real discount, but one this product sees often';
  return badge;
}

function dealCard(deal) {
  const card = el('article', 'card');
  const top = el('div', 'card-top');
  top.append(el('span', 'category', deal.category), el('span', 'discount-badge', '−' + discountOf(deal) + '%'));
  card.append(top);

  const title = el('h2');
  const titleLink = el('a', null, deal.product);
  titleLink.href = '#/deal/' + deal.id;
  title.append(titleLink);
  card.append(title);
  card.append(el('p', 'store', deal.store));

  const prices = el('p', 'prices');
  prices.append(el('span', 'sale', money(deal.sale)));
  const was = el('s', 'was', money(deal.usual));
  prices.append(was);
  card.append(prices);
  card.append(el('p', 'saving', 'You save ' + money(savingOf(deal)) + ' (' + discountOf(deal) + '% off)'));

  card.append(verdictBadge(deal));
  card.append(el('p', 'verdict-note', deal.verdictNote));
  card.append(
    el('p', 'checked', 'Price checked ' + deal.checked + ' · Source: ' + deal.source),
  );

  const link = el('a', 'store-link', 'View at ' + deal.store + ' →');
  link.href = deal.url;
  link.target = '_blank';
  link.rel = 'noopener';
  card.append(link);
  return card;
}

function renderStats() {
  const stats = computeStats(DEALS);
  const strip = document.getElementById('stats');
  const items = [
    [String(stats.count), 'deals checked'],
    [String(stats.stores), 'stores'],
    [String(stats.categories), 'categories'],
    [String(stats.newLows), 'new lows'],
    ['−' + discountOf(stats.best) + '%', 'biggest discount'],
    [money(Math.round(stats.totalSaving)), 'total savings'],
  ];
  for (const [value, label] of items) {
    const wrap = el('div');
    wrap.append(el('dt', null, label), el('dd', null, value));
    strip.append(wrap);
  }
}

function renderFilters() {
  for (const category of ['All', ...listCategories(DEALS)]) {
    const chip = el('button', 'chip', category === 'All' ? 'All categories' : category);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(state.category === category));
    chip.addEventListener('click', () => {
      state.category = category;
      for (const other of chipsNav.querySelectorAll('.chip')) {
        other.setAttribute('aria-pressed', String(other === chip));
      }
      renderGrid();
    });
    chipsNav.append(chip);
  }
  for (const store of ['All stores', ...listStores(DEALS)]) {
    storeSelect.append(el('option', null, store));
  }
}

function renderGrid() {
  const filtered = sortDeals(filterDeals(DEALS, state), state.sort);
  grid.replaceChildren(...filtered.map(dealCard));
  resultLine.replaceChildren();
  const strong = document.createElement('strong');
  strong.textContent = filtered.length + ' of ' + DEALS.length + ' deals';
  resultLine.append(strong, document.createTextNode(' — sorted by ' + sortSelect.selectedOptions[0].textContent.toLowerCase() + '.'));
  empty.hidden = filtered.length > 0;
  grid.hidden = filtered.length === 0;
}

function dealById(id) {
  return DEALS.find((d) => d.id === id);
}

function renderDetail() {
  const match = location.hash.match(/^#\/deal\/([a-z0-9-]+)$/);
  const deal = match ? dealById(match[1]) : null;
  if (!deal) {
    detail.hidden = true;
    detail.replaceChildren();
    mainEl.hidden = false;
    return;
  }
  // A deal page focuses on the deal: the grid steps aside until you go back.
  mainEl.hidden = true;
  detail.hidden = false;
  const card = el('div', 'detail-card');
  const back = el('a', 'back', '← Back to all deals');
  back.href = '#/';
  card.append(back);

  const top = el('div', 'card-top');
  top.append(el('span', 'category', deal.category), el('span', 'discount-badge', '−' + discountOf(deal) + '%'));
  card.append(top);
  card.append(el('h2', null, deal.product));
  card.append(el('p', 'detail-meta', deal.brand + ' · ' + deal.store + ' · ' + deal.category));

  const prices = el('p', 'detail-prices');
  prices.append(el('span', 'sale', money(deal.sale)));
  prices.append(el('s', 'was', money(deal.usual)));
  prices.append(el('span', 'saving', 'You save ' + money(savingOf(deal))));
  card.append(prices);
  card.append(verdictBadge(deal));
  card.append(el('p', 'verdict-note', deal.verdictNote));

  const facts = el('dl');
  const rows = [
    ['Store', deal.store],
    ['Sale price', money(deal.sale)],
    ['Usual price', money(deal.usual)],
    ['Discount', discountOf(deal) + '% off — you save ' + money(savingOf(deal))],
    ['Verdict', VERDICT_LABELS[deal.verdict] + ' — ' + deal.verdictNote],
    ['Price checked', deal.checked],
    ['Where it was read', deal.source],
  ];
  if (deal.note) rows.push(['Good to know', deal.note]);
  for (const [term, value] of rows) {
    facts.append(el('dt', null, term), el('dd', null, value));
  }
  card.append(facts);

  const link = el('a', 'store-link', 'View this deal at ' + deal.store + ' →');
  link.href = deal.url;
  link.target = '_blank';
  link.rel = 'noopener';
  card.append(link);
  detail.replaceChildren(card);
  // The deal sits right under the toolbar; start at the top of the page.
  window.scrollTo(0, 0);
}

export function initFinder() {
  renderStats();
  renderFilters();
  // Shareable filtered views: ?q=sony&category=Audio&store=Amazon&min=30&verdict=strong&sort=discount
  const params = new URLSearchParams(location.search);
  const paramCategory = params.get('category');
  if (paramCategory && (paramCategory === 'All' || listCategories(DEALS).includes(paramCategory))) {
    state.category = paramCategory;
    for (const chip of chipsNav.querySelectorAll('.chip')) {
      chip.setAttribute('aria-pressed', String(chip.textContent === (paramCategory === 'All' ? 'All categories' : paramCategory)));
    }
  }
  if (params.get('q')) {
    state.query = params.get('q');
    searchInput.value = state.query;
  }
  if (params.get('store') && (params.get('store') === 'All stores' || listStores(DEALS).includes(params.get('store')))) {
    state.store = params.get('store');
    storeSelect.value = state.store;
  }
  if (params.get('min') && ['0', '20', '30', '40', '50'].includes(params.get('min'))) {
    state.minDiscount = Number(params.get('min'));
    discountSelect.value = params.get('min');
  }
  if (params.get('verdict') && ['new-low', 'strong', 'routine'].includes(params.get('verdict'))) {
    state.verdict = params.get('verdict');
    verdictSelect.value = state.verdict;
  }
  if (params.get('sort') && [...sortSelect.options].some((o) => o.value === params.get('sort'))) {
    state.sort = params.get('sort');
    sortSelect.value = state.sort;
  }
  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    renderGrid();
  });
  storeSelect.addEventListener('change', () => {
    state.store = storeSelect.value;
    renderGrid();
  });
  discountSelect.addEventListener('change', () => {
    state.minDiscount = Number(discountSelect.value);
    renderGrid();
  });
  verdictSelect.addEventListener('change', () => {
    state.verdict = verdictSelect.value;
    renderGrid();
  });
  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    renderGrid();
  });
  window.addEventListener('hashchange', renderDetail);
  renderGrid();
  renderDetail();
}
