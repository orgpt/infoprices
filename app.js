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
    addToCart: "\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0633\u0644\u0629",
    lineTotal: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0635\u0646\u0641",
    emptyCart: "\u0623\u0636\u0641 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0645\u0646 \u0646\u062a\u064a\u062c\u0629 \u0627\u0644\u0628\u062d\u062b \u0644\u062a\u062c\u0647\u064a\u0632 \u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631 \u0628\u0633\u0631\u0639\u0629.",
    noItemsYet: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0623\u0635\u0646\u0627\u0641 \u0645\u0636\u0627\u0641\u0629 \u0628\u0639\u062f.",
    pieces: "\u0642\u0637\u0639\u0629",
    remove: "\u062d\u0630\u0641",
    total: "\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a",
    subtotal: "\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0642\u0628\u0644 \u0627\u0644\u062e\u0635\u0645",
    discountValue: "\u0642\u064a\u0645\u0629 \u0627\u0644\u062e\u0635\u0645",
    profit: "\u0627\u0644\u0645\u0643\u0633\u0628",
    discountPercent: "\u062e\u0635\u0645 %",
    quantity: "\u0627\u0644\u0643\u0645\u064a\u0629",
    fetchError: "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0645\u0644\u0641 \u0627\u0644\u0623\u0633\u0639\u0627\u0631.",
    runServer: "\u062a\u0623\u0643\u062f \u0645\u0646 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u0641\u062d\u0629 \u0645\u0646 \u062e\u0644\u0627\u0644 XAMPP \u0623\u0648 \u062e\u0627\u062f\u0645 \u0645\u062d\u0644\u064a.",
    popupBlocked: "\u0627\u0633\u0645\u062d \u0628\u0641\u062a\u062d \u0646\u0627\u0641\u0630\u0629 \u062c\u062f\u064a\u062f\u0629 \u0644\u062a\u062d\u0645\u064a\u0644 PDF."
};

const COMPANY_NAME = "\u0627\u0644\u0641\u062c\u0627\u0644\u0629 \u062f\u0648\u062a \u0643\u0648\u0645";
const COMPANY_PHONE = "01558811537";
const COMPANY_SITE = "https://elfagalla.com/";
const STORAGE_KEY = "infoprice-cart-v1";
const UI_STORAGE_KEY = "infoprice-ui-v1";
const PDF_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";

const searchInput = document.getElementById("searchInput");
const clearButton = document.getElementById("clearButton");
const clearCartButton = document.getElementById("clearCartButton");
const downloadPdfButton = document.getElementById("downloadPdfButton");
const uploadPriceSheetButton = document.getElementById("uploadPriceSheetButton");
const priceSheetInput = document.getElementById("priceSheetInput");
const statusElement = document.getElementById("status");
const suggestionsElement = document.getElementById("suggestions");
const resultsElement = document.getElementById("results");
const cartListElement = document.getElementById("cartList");
const cartSubtotalElement = document.getElementById("cartSubtotal");
const cartDiscountValueElement = document.getElementById("cartDiscountValue");
const cartProfitElement = document.getElementById("cartProfit");
const cartTotalElement = document.getElementById("cartTotal");
const cartSummaryElement = document.getElementById("cartSummary");

let items = [];
let lastMatches = [];
let activeIndex = -1;
let selectedEntry = null;
const cart = new Map();
let restoredUiState = null;

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

function normalizeDigits(value) {
    return String(value ?? "").replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (digit) => {
        const code = digit.charCodeAt(0);
        if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
        if (code >= 0x06F0 && code <= 0x06F9) return String(code - 0x06F0);
        return digit;
    });
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
        const netPrice = getField(item, ["price net", "net price"]) || values[6] || 0;
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
            netPrice: Number(netPrice) || 0,
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

function getRowTotals(row) {
    const subtotal = row.quantity * row.price;
    const netSubtotal = row.quantity * (Number(row.netPrice) || 0);
    const discountPercent = Math.min(100, Math.max(0, Number(row.discountPercent) || 0));
    const discountValue = subtotal * (discountPercent / 100);
    const total = subtotal - discountValue;
    const profit = total - netSubtotal;
    return { subtotal, netSubtotal, discountPercent, discountValue, total, profit };
}

function getCartTotals(rows = Array.from(cart.values())) {
    return rows.reduce((acc, row) => {
        const totals = getRowTotals(row);
        acc.subtotal += totals.subtotal;
        acc.discountValue += totals.discountValue;
        acc.total += totals.total;
        acc.profit += totals.profit;
        return acc;
    }, { subtotal: 0, discountValue: 0, total: 0, profit: 0 });
}

function saveCartState() {
    try {
        const payload = Array.from(cart.values()).map((row) => ({
            id: row.id,
            code: row.code,
            quantity: row.quantity,
            discountPercent: row.discountPercent || 0
        }));
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.error("Failed to save cart state", error);
    }
}

function restoreCartState() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const savedRows = JSON.parse(raw);
        if (!Array.isArray(savedRows)) return;

        savedRows.forEach((savedRow) => {
            const entry = items.find((item) => (
                item.id === Number(savedRow.id) ||
                (savedRow.code && normalizeDigits(item.code) === normalizeDigits(savedRow.code))
            ));
            if (!entry) return;

            cart.set(entry.id, {
                ...entry,
                quantity: Math.max(1, Number(savedRow.quantity) || 1),
                discountPercent: Math.min(100, Math.max(0, Number(savedRow.discountPercent) || 0))
            });
        });
    } catch (error) {
        console.error("Failed to restore cart state", error);
    }
}

function saveUiState() {
    try {
        const payload = {
            search: searchInput.value || "",
            selectedCode: selectedEntry?.code || ""
        };
        window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.error("Failed to save UI state", error);
    }
}

function restoreUiState() {
    try {
        const raw = window.localStorage.getItem(UI_STORAGE_KEY);
        if (!raw) return;

        const savedUi = JSON.parse(raw);
        if (!savedUi || typeof savedUi !== "object") return;
        restoredUiState = savedUi;
    } catch (error) {
        console.error("Failed to restore UI state", error);
    }
}

function applyRestoredUiState() {
    if (!restoredUiState) return;

    const { search = "", selectedCode = "" } = restoredUiState;
    if (search) {
        searchInput.value = search;
        renderSuggestions(findMatches(search), search);
    }

    if (selectedCode) {
        const entry = items.find((item) => normalizeDigits(item.code) === normalizeDigits(selectedCode));
        if (entry) {
            showResult(entry);
            return;
        }
    }

    if (!search) renderEmptyState(T.startSearch);
}

function upsertCartEntry(entry, quantityToAdd = 1) {
    const safeQty = Math.max(1, Number(quantityToAdd) || 1);
    const existing = cart.get(entry.id);
    const discountPercent = existing?.discountPercent || 0;
    const currentQty = existing?.quantity || 0;
    cart.set(entry.id, { ...entry, quantity: currentQty + safeQty, discountPercent });
}

function getItemByCode(code) {
    const normalizedCode = normalizeDigits(String(code ?? "").trim());
    if (!normalizedCode) return null;
    return items.find((item) => normalizeDigits(item.code) === normalizedCode) || null;
}

function buildPdfTextLines(page) {
    return page.getTextContent().then((content) => {
        const rows = [];
        const sortedItems = [...content.items].sort((a, b) => {
            const yDiff = Math.abs((b.transform?.[5] ?? 0) - (a.transform?.[5] ?? 0));
            if (yDiff > 2) return (b.transform?.[5] ?? 0) - (a.transform?.[5] ?? 0);
            return (a.transform?.[4] ?? 0) - (b.transform?.[4] ?? 0);
        });

        sortedItems.forEach((item) => {
            const text = normalizeDigits((item.str || "").trim());
            if (!text) return;

            const y = Math.round(item.transform?.[5] ?? 0);
            const lastRow = rows[rows.length - 1];
            if (!lastRow || Math.abs(lastRow.y - y) > 3) {
                rows.push({ y, parts: [text] });
                return;
            }

            lastRow.parts.push(text);
        });

        return rows.map((row) => row.parts.join(" ").replace(/\s+/g, " ").trim()).filter(Boolean);
    });
}

function parseImportedLine(line) {
    const numericTokens = line.match(/\d+(?:[.,]\d+)?/g) || [];
    const code = numericTokens.find((token) => /^\d{3,}$/.test(token));
    if (!code) return null;

    const quantityToken = numericTokens.find((token) => {
        if (token === code) return false;
        if (!/^\d+$/.test(token)) return false;
        const value = Number(token);
        return value > 0 && value < 100000;
    });

    return {
        code,
        quantity: Math.max(1, Number(quantityToken) || 1)
    };
}

async function extractItemsFromPdf(file) {
    if (!window.pdfjsLib) {
        throw new Error("PDF library unavailable");
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    const importedRows = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const lines = await buildPdfTextLines(page);
        lines.forEach((line) => {
            const parsed = parseImportedLine(line);
            if (parsed) importedRows.push(parsed);
        });
    }

    return importedRows;
}

async function importPriceSheet(file) {
    if (!file) return;

    statusElement.textContent = "جاري قراءة عرض الأسعار المرفوع...";

    try {
        const importedRows = await extractItemsFromPdf(file);
        if (!importedRows.length) {
            statusElement.textContent = "لم يتم العثور على أكواد أصناف واضحة داخل الملف.";
            return;
        }

        const mergedByCode = new Map();
        importedRows.forEach((row) => {
            const key = normalizeDigits(row.code);
            const current = mergedByCode.get(key) || { code: row.code, quantity: 0 };
            current.quantity += Math.max(1, Number(row.quantity) || 1);
            mergedByCode.set(key, current);
        });

        let matched = 0;
        const missingCodes = [];
        mergedByCode.forEach((row) => {
            const entry = getItemByCode(row.code);
            if (!entry) {
                missingCodes.push(row.code);
                return;
            }

            upsertCartEntry(entry, row.quantity);
            matched += 1;
        });

        saveCartState();
        renderCart();

        if (selectedEntry) showResult(selectedEntry);

        statusElement.textContent = missingCodes.length
            ? `تمت إضافة ${matched} صنف من الملف، وتعذر مطابقة ${missingCodes.length} كود.`
            : `تمت إضافة ${matched} صنف من عرض الأسعار إلى السلة.`;
    } catch (error) {
        console.error("Failed to import price sheet", error);
        statusElement.textContent = "تعذر قراءة ملف الـ PDF. تأكد من أن الملف نصي وليس صورة فقط.";
    } finally {
        priceSheetInput.value = "";
    }
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
    saveUiState();
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
        upsertCartEntry(entry, qty);
        saveCartState();
        renderCart();
        showResult(entry);
    });
}

function renderCart() {
    const rows = Array.from(cart.values());
    const totals = getCartTotals(rows);

    if (!rows.length) {
        cartListElement.innerHTML = `<div class="cart-empty">${T.emptyCart}</div>`;
        cartSummaryElement.textContent = T.noItemsYet;
        cartSubtotalElement.textContent = formatPrice(0);
        cartDiscountValueElement.textContent = formatPrice(0);
        cartProfitElement.textContent = formatPrice(0);
        cartTotalElement.textContent = formatPrice(0);
        saveCartState();
        return;
    }

    const totalQty = rows.reduce((sum, row) => sum + row.quantity, 0);
    cartSummaryElement.textContent = `${rows.length} ${T.item}، ${totalQty} ${T.pieces}.`;
    cartSubtotalElement.textContent = formatPrice(totals.subtotal);
    cartDiscountValueElement.textContent = formatPrice(totals.discountValue);
    cartProfitElement.textContent = formatPrice(totals.profit);
    cartTotalElement.textContent = formatPrice(totals.total);

    cartListElement.innerHTML = rows.map((row) => {
        const rowTotals = getRowTotals(row);
        return `
        <article class="cart-item">
            <div class="cart-item-top">
                <div>
                    <h3 class="cart-item-name">${escapeHtml(row.name || "-")}</h3>
                    <div class="cart-item-code">${T.code}: ${escapeHtml(row.code || "-")}</div>
                </div>
                <div class="cart-item-total">${escapeHtml(formatPrice(rowTotals.total))}</div>
            </div>
            <div class="cart-item-bottom">
                <div class="qty-control">
                    <button class="qty-button" type="button" data-cart-action="plus" data-id="${row.id}">+</button>
                    <input class="qty-input cart-qty-input" type="number" min="1" step="1" value="${row.quantity}" data-id="${row.id}">
                    <button class="qty-button" type="button" data-cart-action="minus" data-id="${row.id}">-</button>
                </div>
                <div class="item-discount-box">
                    <label class="item-discount-label" for="discount-${row.id}">${T.discountPercent}</label>
                    <input id="discount-${row.id}" class="discount-input item-discount-input" type="number" min="0" max="100" step="1" value="${row.discountPercent || 0}" data-id="${row.id}">
                </div>
                <button class="mini-button" type="button" data-cart-action="remove" data-id="${row.id}">${T.remove}</button>
            </div>
            <div class="cart-item-details">
                <span>${T.quantity}: ${escapeHtml(row.quantity)}</span>
                <span>${T.unit}: ${escapeHtml(row.unit || "-")}</span>
            </div>
            <div class="cart-item-meta">
                <span>${T.subtotal}: ${escapeHtml(formatPrice(rowTotals.subtotal))}</span>
                <span>${T.discountValue}: ${escapeHtml(formatPrice(rowTotals.discountValue))}</span>
            </div>
        </article>
        `;
    }).join("");

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
                saveCartState();
                renderCart();
                if (selectedEntry?.id === id) showResult(selectedEntry);
                return;
            }

            cart.set(id, item);
            saveCartState();
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
            saveCartState();
            renderCart();
            if (selectedEntry?.id === id) showResult(selectedEntry);
        });
    });

    cartListElement.querySelectorAll(".item-discount-input").forEach((input) => {
        const applyDiscount = () => {
            const id = Number(input.dataset.id);
            const item = cart.get(id);
            if (!item) return;

            item.discountPercent = Math.min(100, Math.max(0, Number(input.value) || 0));
            cart.set(id, item);
            saveCartState();
            renderCart();
        };

        input.addEventListener("change", applyDiscount);
        input.addEventListener("blur", applyDiscount);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                input.blur();
            }
        });
    });
}

function buildPdfHtml(rows) {
    const totals = getCartTotals(rows);
    const now = new Date();
    const dateText = now.toLocaleDateString("ar-EG");

    const rowMarkup = rows.map((row, index) => {
        const rowTotals = getRowTotals(row);
        return `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(row.name || "-")}</td>
            <td>${escapeHtml(row.code || "-")}</td>
            <td>${escapeHtml(row.quantity)}</td>
            <td>${escapeHtml(row.unit || "-")}</td>
            <td>${escapeHtml(formatPrice(row.price))}</td>
            <td>${escapeHtml(row.discountPercent || 0)}%</td>
            <td>${escapeHtml(formatPrice(rowTotals.total))}</td>
        </tr>
        `;
    }).join("");

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>عرض أسعار</title>
    <style>
        @page { margin: 90px 28px 80px; size: A4; }
        body { font-family: "Tahoma", "Arial", sans-serif; color: #2b2117; margin: 0; }
        header, footer { position: fixed; left: 0; right: 0; text-align: center; color: #7a4b2b; }
        header { top: -72px; padding-bottom: 12px; border-bottom: 2px solid #d8c7b3; }
        footer { bottom: -60px; padding-top: 12px; border-top: 2px solid #d8c7b3; font-size: 12px; }
        .company-name { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
        .company-meta { font-size: 13px; }
        .title { margin: 0 0 14px; font-size: 28px; color: #7a4b2b; }
        .meta-row { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 24px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        thead th { background: #f1e7db; color: #6f3c1f; padding: 10px 8px; font-size: 14px; }
        tbody td { padding: 10px 8px; border-bottom: 1px solid #e5d7c9; font-size: 14px; vertical-align: top; }
        .summary { margin-top: 24px; display: flex; justify-content: flex-end; }
        .summary-box { min-width: 260px; padding: 16px 18px; border: 1px solid #e5d7c9; border-radius: 16px; background: #fbf7f1; }
        .summary-line { display: flex; justify-content: space-between; gap: 12px; font-size: 18px; font-weight: 700; color: #7a4b2b; margin-bottom: 8px; }
        .summary-line:last-child { margin-bottom: 0; }
        a { color: inherit; text-decoration: none; }
    </style>
</head>
<body>
    <header>
        <div class="company-name">${COMPANY_NAME}</div>
        <div class="company-meta">${COMPANY_PHONE} | <a href="${COMPANY_SITE}">${COMPANY_SITE}</a></div>
    </header>
    <footer>
        <div>${COMPANY_NAME} | ${COMPANY_PHONE} | ${COMPANY_SITE}</div>
    </footer>
    <main>
        <h1 class="title">عرض أسعار</h1>
        <div class="meta-row">
            <div>التاريخ: ${dateText}</div>
            <div>عدد الأصناف: ${rows.length}</div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>الصنف</th>
                    <th>الكود</th>
                    <th>الكمية</th>
                    <th>الوحدة</th>
                    <th>سعر الوحدة</th>
                    <th>الخصم</th>
                    <th>الإجمالي</th>
                </tr>
            </thead>
            <tbody>${rowMarkup}</tbody>
        </table>
        <div class="summary">
            <div class="summary-box">
                <div class="summary-line">
                    <span>${T.subtotal}</span>
                    <span>${formatPrice(totals.subtotal)}</span>
                </div>
                <div class="summary-line">
                    <span>${T.discountValue}</span>
                    <span>${formatPrice(totals.discountValue)}</span>
                </div>
                <div class="summary-line">
                    <span>${T.total}</span>
                    <span>${formatPrice(totals.total)}</span>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
    `;
}

function downloadPdf() {
    const rows = Array.from(cart.values());
    if (!rows.length) {
        statusElement.textContent = T.noItemsYet;
        return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        statusElement.textContent = T.popupBlocked;
        return;
    }

    printWindow.document.open();
    printWindow.document.write(buildPdfHtml(rows));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function updateActiveSuggestion(nextIndex) {
    const nodes = suggestionsElement.querySelectorAll(".suggestion");
    if (!nodes.length) return;
    activeIndex = (nextIndex + nodes.length) % nodes.length;
    nodes.forEach((node, index) => node.classList.toggle("is-active", index === activeIndex));
}

async function loadData() {
    try {
        restoreUiState();
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rawItems = await response.json();
        items = buildIndex(rawItems);
        restoreCartState();
        statusElement.textContent = `${T.loaded} ${items.length} ${T.item}.`;
        renderEmptyState(T.startSearch);
        renderCart();
        applyRestoredUiState();
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
    saveUiState();
    if (!query.trim()) {
        selectedEntry = null;
        saveUiState();
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
    saveUiState();
    renderEmptyState(T.startSearch);
    searchInput.focus();
});

clearCartButton.addEventListener("click", () => {
    cart.clear();
    saveCartState();
    renderCart();
    if (selectedEntry) showResult(selectedEntry);
});

downloadPdfButton.addEventListener("click", downloadPdf);
uploadPriceSheetButton.addEventListener("click", () => priceSheetInput.click());
priceSheetInput.addEventListener("change", () => {
    const file = priceSheetInput.files?.[0];
    importPriceSheet(file);
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-panel")) suggestionsElement.innerHTML = "";
});

loadData();
