const DATA_URL = "./prices_adjusted.json";
const MAX_SUGGESTIONS = 12;

const T = {
    loaded: "\u062a\u0645 \u062a\u062d\u0645\u064a\u0644",
    item: "\u0635\u0646\u0641",
    startSearch: "\u0627\u0643\u062a\u0628 \u0627\u0633\u0645 \u0627\u0644\u0635\u0646\u0641 \u0623\u0648 \u0627\u0644\u0643\u0648\u062f \u062b\u0645 \u062d\u062f\u062f \u0627\u0644\u0643\u0645\u064a\u0629 \u0648\u0623\u0636\u0641\u0647 \u0644\u0644\u0633\u0644\u0629.",
    noMatches: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c \u0645\u0637\u0627\u0628\u0642\u0629.",
    quickResults: "\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649",
    result: "\u0646\u062a\u064a\u062c\u0629 \u0633\u0631\u064a\u0639\u0629.",
    selected: "\u062a\u0645 \u0639\u0631\u0636 \u0627\u0644\u0635\u0646\u0641 \u0627\u0644\u0645\u062e\u062a\u0627\u0631.",
    code: "\u0627\u0644\u0643\u0648\u062f",
    price: "\u0627\u0644\u0633\u0639\u0631",
    pack: "\u0627\u0644\u0639\u0628\u0648\u0629",
    cartonCount: "\u0639\u062f\u062f \u0627\u0644\u0639\u0628\u0648\u0627\u062a \u0628\u0627\u0644\u0643\u0631\u062a\u0648\u0646\u0629",
    unit: "\u0627\u0644\u0648\u062d\u062f\u0629",
    quantity: "\u0627\u0644\u0643\u0645\u064a\u0629",
    addToCart: "\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0633\u0644\u0629",
    lineTotal: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0635\u0646\u0641",
    emptyCart: "\u0623\u0636\u0641 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0645\u0646 \u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0628\u062d\u062b \u0644\u062a\u062c\u0647\u064a\u0632 \u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631 \u0628\u0633\u0631\u0639\u0629.",
    noItemsYet: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0635\u0646\u0627\u0641 \u0645\u0636\u0627\u0641\u0629 \u0628\u0639\u062f.",
    pieces: "\u0642\u0637\u0639\u0629",
    remove: "\u062d\u0630\u0641",
    total: "\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a",
    fetchError: "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0645\u0644\u0641 \u0627\u0644\u0623\u0633\u0639\u0627\u0631.",
    runServer: "\u062a\u0623\u0643\u062f \u0645\u0646 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0646 \u062e\u0644\u0627\u0644 XAMPP \u0623\u0648 \u062e\u0627\u062f\u0645 \u0645\u062d\u0644\u064a."
};

const searchInput = document.getElementById("searchInput");
const clearButton = document.getElementById("clearButton");
const clearCartButton = document.getElementById("clearCartButton");
const statusElement = document.getElementById("status");
const suggestionsElement = document.getElementById("suggestions");
const resultsElement = document.getElementById("results");
const cartListElement = document.getElementById("cartList");
const cartTotalElement = document.getElementById("cartTotal");
const cartSummaryElement = document.getElementById("cartSummary");

let items = [];
let lastMatches = [];
let activeIndex = -1;
let selectedEntry = null;
const cart = new Map();

function normalizeArabic(text) {
    return String(text ?? "")
        .normalize("NFKD")
        .replace(/[\u064B-\u065F\u0670]/g, "")
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[char]));
}

function formatPrice(value) {
    const number = Number(value) || 0;
    return `${number.toLocaleString("en-US", {
        minimumFractionDigits: number % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
    })} \u062c\u0646\u064a\u0647`;
}

function getField(item, candidates) {
    const keys = Object.keys(item);
    for (const candidate of candidates) {
        const normalizedCandidate = normalizeArabic(candidate);
        const match = keys.find((key) => normalizeArabic(key) === normalizedCandidate);
        if (match) return item[match];
    }
    return "";
}

function buildIndex(rawItems) {
    return rawItems.map((item, index) => {
        const values = Object.values(item);
        const price = getField(item, ["السعر"]) || values[0] || 0;
        const packageValue = getField(item, ["العبوة"]) || values[1] || "";
        const cartonCount = getField(item, ["عدد العبوات بالكرتونة"]) || values[2] || "";
        const unit = getField(item, ["الوحدة"]) || values[3] || "";
        const name = getField(item, ["الاسم"]) || values[4] || "";
        const code = getField(item, ["كود"]) || values[5] || "";

        return {
            id: index,
            name: String(name ?? ""),
            code: String(code ?? ""),
            price: Number(price) || 0,
            packageValue: String(packageValue ?? ""),
            cartonCount: String(cartonCount ?? ""),
            unit: String(unit ?? ""),
            searchable: normalizeArabic([name, code, packageValue, cartonCount, unit].join(" "))
        };
    });
}

function scoreMatch(entry, query) {
    if (!query) return Number.MAX_SAFE_INTEGER;
    if (entry.code === query) return 0;
    const name = normalizeArabic(entry.name);
    if (name.startsWith(query)) return 1;
    const pos = entry.searchable.indexOf(query);
    return pos === -1 ? Number.MAX_SAFE_INTEGER : pos + 10;
}

function findMatches(queryText) {
    const query = normalizeArabic(queryText);
    if (!query) return [];

    return items
        .map((entry) => ({ entry, score: scoreMatch(entry, query) }))
        .filter((row) => row.score !== Number.MAX_SAFE_INTEGER)
        .sort((a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name, "ar"))
        .slice(0, MAX_SUGGESTIONS)
        .map((row) => row.entry);
}

function highlightText(text, query) {
    const safe = escapeHtml(text);
    const clean = String(query ?? "").trim();
    if (!clean) return safe;
    const pattern = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp(`(${pattern})`, "ig"), "<mark>$1</mark>");
}

function getCartQuantity(id) {
    return cart.get(id)?.quantity || 0;
}

function renderEmptyState(message) {
    resultsElement.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function renderSuggestions(matches, query) {
    suggestionsElement.innerHTML = "";
    lastMatches = matches;
    activeIndex = -1;

    if (!query) {
        statusElement.textContent = `${T.loaded} ${items.length} ${T.item}.`;
        return;
    }

    if (!matches.length) {
        statusElement.textContent = T.noMatches;
        return;
    }

    statusElement.textContent = `${T.quickResults} ${matches.length} ${T.result}`;

    const fragment = document.createDocumentFragment();
    matches.forEach((entry, index) => {
        const li = document.createElement("li");
        li.className = "suggestion";
        li.dataset.index = String(index);
        li.innerHTML = `
            <div class="suggestion-title">${highlightText(entry.name || "-", query)}</div>
            <div class="suggestion-meta">
                <span>${T.code}: ${escapeHtml(entry.code || "-")}</span>
                <span>${T.price}: ${escapeHtml(formatPrice(entry.price))}</span>
                <span>${escapeHtml(entry.unit || "-")}</span>
            </div>
        `;
        li.addEventListener("mousedown", (event) => {
            event.preventDefault();
            showResult(entry);
        });
        fragment.appendChild(li);
    });
    suggestionsElement.appendChild(fragment);
}

function showResult(entry) {
    selectedEntry = entry;
    searchInput.value = entry.name || entry.code;
    suggestionsElement.innerHTML = "";
    statusElement.textContent = T.selected;

    const quantity = Math.max(1, getCartQuantity(entry.id) || 1);

    resultsElement.innerHTML = `
        <article class="result-card">
            <div class="result-top">
                <div>
                    <h2>${escapeHtml(entry.name || "-")}</h2>
                    <div class="code-badge">${T.code}: ${escapeHtml(entry.code || "-")}</div>
                </div>
                <p class="price">${escapeHtml(formatPrice(entry.price))}</p>
            </div>
            <div class="details">
                <div class="detail">
                    <span class="detail-label">${T.pack}</span>
                    <strong>${escapeHtml(entry.packageValue || "-")}</strong>
                </div>
                <div class="detail">
                    <span class="detail-label">${T.cartonCount}</span>
                    <strong>${escapeHtml(entry.cartonCount || "-")}</strong>
                </div>
                <div class="detail">
                    <span class="detail-label">${T.unit}</span>
                    <strong>${escapeHtml(entry.unit || "-")}</strong>
                </div>
            </div>
            <div class="action-row">
                <div class="qty-control">
                    <button class="qty-button" type="button" data-action="plus">+</button>
                    <input id="qtyInput" class="qty-input" type="number" min="1" step="1" value="${quantity}">
                    <button class="qty-button" type="button" data-action="minus">-</button>
                </div>
                <button id="addToCartButton" class="secondary-button add-button" type="button">${T.addToCart}</button>
            </div>
            <div class="line-total" id="previewTotal">${T.lineTotal}: ${escapeHtml(formatPrice(entry.price * quantity))}</div>
        </article>
    `;

    const qtyInput = document.getElementById("qtyInput");
    const previewTotal = document.getElementById("previewTotal");
    const addToCartButton = document.getElementById("addToCartButton");

    function syncPreview() {
        const qty = Math.max(1, Number(qtyInput.value) || 1);
        qtyInput.value = qty;
        previewTotal.textContent = `${T.lineTotal}: ${formatPrice(entry.price * qty)}`;
    }

    resultsElement.querySelector('[data-action="plus"]').addEventListener("click", () => {
        qtyInput.value = Math.max(1, Number(qtyInput.value) || 1) + 1;
        syncPreview();
    });

    resultsElement.querySelector('[data-action="minus"]').addEventListener("click", () => {
        qtyInput.value = Math.max(1, (Number(qtyInput.value) || 1) - 1);
        syncPreview();
    });

    qtyInput.addEventListener("input", syncPreview);

    addToCartButton.addEventListener("click", () => {
        const qty = Math.max(1, Number(qtyInput.value) || 1);
        const current = cart.get(entry.id)?.quantity || 0;
        cart.set(entry.id, { ...entry, quantity: current + qty });
        renderCart();
        showResult(entry);
    });
}

function renderCart() {
    const rows = Array.from(cart.values());
    if (!rows.length) {
        cartListElement.innerHTML = `<div class="cart-empty">${T.emptyCart}</div>`;
        cartSummaryElement.textContent = T.noItemsYet;
        cartTotalElement.textContent = formatPrice(0);
        return;
    }

    const totalQty = rows.reduce((sum, row) => sum + row.quantity, 0);
    const totalPrice = rows.reduce((sum, row) => sum + (row.quantity * row.price), 0);

    cartSummaryElement.textContent = `${rows.length} ${T.item}، ${totalQty} ${T.pieces}.`;
    cartTotalElement.textContent = formatPrice(totalPrice);

    cartListElement.innerHTML = rows.map((row) => `
        <article class="cart-item">
            <div class="cart-item-top">
                <div>
                    <h3 class="cart-item-name">${escapeHtml(row.name || "-")}</h3>
                    <div class="cart-item-code">${T.code}: ${escapeHtml(row.code || "-")}</div>
                </div>
                <div class="cart-item-total">${escapeHtml(formatPrice(row.quantity * row.price))}</div>
            </div>
            <div class="cart-item-bottom">
                <div class="qty-control">
                    <button class="qty-button" type="button" data-cart-action="plus" data-id="${row.id}">+</button>
                    <input class="qty-input cart-qty-input" type="number" min="1" step="1" value="${row.quantity}" data-id="${row.id}">
                    <button class="qty-button" type="button" data-cart-action="minus" data-id="${row.id}">-</button>
                </div>
                <button class="mini-button" type="button" data-cart-action="remove" data-id="${row.id}">${T.remove}</button>
            </div>
        </article>
    `).join("");

    cartListElement.querySelectorAll("[data-cart-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.id);
            const item = cart.get(id);
            if (!item) return;

            if (button.dataset.cartAction === "plus") {
                item.quantity += 1;
            } else if (button.dataset.cartAction === "minus") {
                item.quantity = Math.max(1, item.quantity - 1);
            } else if (button.dataset.cartAction === "remove") {
                cart.delete(id);
                renderCart();
                if (selectedEntry?.id === id) showResult(selectedEntry);
                return;
            }

            cart.set(id, item);
            renderCart();
            if (selectedEntry?.id === id) showResult(selectedEntry);
        });
    });

    cartListElement.querySelectorAll(".cart-qty-input").forEach((input) => {
        input.addEventListener("input", () => {
            const id = Number(input.dataset.id);
            const item = cart.get(id);
            if (!item) return;
            item.quantity = Math.max(1, Number(input.value) || 1);
            cart.set(id, item);
            renderCart();
            if (selectedEntry?.id === id) showResult(selectedEntry);
        });
    });
}

function updateActiveSuggestion(nextIndex) {
    const nodes = suggestionsElement.querySelectorAll(".suggestion");
    if (!nodes.length) return;
    activeIndex = (nextIndex + nodes.length) % nodes.length;
    nodes.forEach((node, index) => node.classList.toggle("is-active", index === activeIndex));
}

async function loadData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rawItems = await response.json();
        items = buildIndex(rawItems);
        statusElement.textContent = `${T.loaded} ${items.length} ${T.item}.`;
        renderEmptyState(T.startSearch);
        renderCart();
    } catch (error) {
        statusElement.textContent = T.fetchError;
        renderEmptyState(T.runServer);
        cartListElement.innerHTML = `<div class="cart-empty">${T.fetchError}</div>`;
        console.error(error);
    }
}

searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    renderSuggestions(findMatches(query), query);
    if (!query.trim()) {
        selectedEntry = null;
        renderEmptyState(T.startSearch);
    }
});

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
        event.preventDefault();
        updateActiveSuggestion(activeIndex + 1);
        return;
    }
    if (event.key === "ArrowUp") {
        event.preventDefault();
        updateActiveSuggestion(activeIndex - 1);
        return;
    }
    if (event.key === "Enter" && activeIndex >= 0 && lastMatches[activeIndex]) {
        event.preventDefault();
        showResult(lastMatches[activeIndex]);
    }
});

clearButton.addEventListener("click", () => {
    searchInput.value = "";
    suggestionsElement.innerHTML = "";
    selectedEntry = null;
    lastMatches = [];
    activeIndex = -1;
    statusElement.textContent = `${T.loaded} ${items.length} ${T.item}.`;
    renderEmptyState(T.startSearch);
    searchInput.focus();
});

clearCartButton.addEventListener("click", () => {
    cart.clear();
    renderCart();
    if (selectedEntry) showResult(selectedEntry);
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-panel")) suggestionsElement.innerHTML = "";
});

loadData();
