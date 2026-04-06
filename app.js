const DATA_URL = "./prices_adjusted.json";
const MAX_SUGGESTIONS = 12;

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
let activeIndex = -1;
let lastMatches = [];
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
    const number = Number(value);
    if (Number.isNaN(number)) {
        return String(value ?? "");
    }

    return `${number.toLocaleString("en-US", {
        minimumFractionDigits: number % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
    })} جنيه`;
}

function getField(item, nameCandidates) {
    const keys = Object.keys(item);
    for (const candidate of nameCandidates) {
        const normalizedCandidate = normalizeArabic(candidate);
        const match = keys.find((key) => normalizeArabic(key) === normalizedCandidate);
        if (match) {
            return item[match];
        }
    }
    return "";
}

function buildIndex(rawItems) {
    return rawItems.map((item, index) => {
        const fallbackValues = Object.values(item);
        const price = getField(item, ["السعر"]) || fallbackValues[0] || "";
        const packageValue = getField(item, ["العبوة"]) || fallbackValues[1] || "";
        const cartonCount = getField(item, ["عدد العبوات بالكرتونة"]) || fallbackValues[2] || "";
        const unit = getField(item, ["الوحدة"]) || fallbackValues[3] || "";
        const name = getField(item, ["الاسم"]) || fallbackValues[4] || "";
        const code = getField(item, ["كود"]) || fallbackValues[5] || "";

        return {
            id: index,
            name: String(name ?? ""),
            code: String(code ?? ""),
            price: Number(price) || 0,
            packageValue: String(packageValue ?? ""),
            cartonCount: String(cartonCount ?? ""),
            unit: String(unit ?? ""),
            searchable: normalizeArabic([name, code, price, packageValue, cartonCount, unit].join(" "))
        };
    });
}

function scoreMatch(entry, query) {
    if (!query) {
        return Number.MAX_SAFE_INTEGER;
    }

    if (entry.code === query) {
        return 0;
    }

    const normalizedName = normalizeArabic(entry.name);
    if (normalizedName.startsWith(query)) {
        return 1;
    }

    const position = entry.searchable.indexOf(query);
    return position === -1 ? Number.MAX_SAFE_INTEGER : position + 10;
}

function findMatches(queryText) {
    const query = normalizeArabic(queryText);
    if (!query) {
        return [];
    }

    return items
        .map((entry) => ({ entry, score: scoreMatch(entry, query) }))
        .filter((match) => match.score !== Number.MAX_SAFE_INTEGER)
        .sort((a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name, "ar"))
        .slice(0, MAX_SUGGESTIONS)
        .map((match) => match.entry);
}

function highlightText(text, query) {
    const safeText = escapeHtml(text);
    const cleanQuery = String(query ?? "").trim();
    if (!cleanQuery) {
        return safeText;
    }

    const pattern = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safeText.replace(new RegExp(`(${pattern})`, "ig"), "<mark>$1</mark>");
}

function getCartQuantity(entryId) {
    return cart.get(entryId)?.quantity || 0;
}

function renderSuggestions(matches, query) {
    suggestionsElement.innerHTML = "";
    activeIndex = -1;
    lastMatches = matches;

    if (!query) {
        statusElement.textContent = `تم تحميل ${items.length} صنف.`;
        return;
    }

    if (!matches.length) {
        statusElement.textContent = "لا توجد نتائج مطابقة.";
        return;
    }

    statusElement.textContent = `تم العثور على ${matches.length} نتيجة سريعة.`;

    const fragment = document.createDocumentFragment();
    matches.forEach((entry, index) => {
        const li = document.createElement("li");
        li.className = "suggestion";
        li.setAttribute("role", "option");
        li.dataset.index = String(index);
        li.innerHTML = `
            <div class="suggestion-title">${highlightText(entry.name || "بدون اسم", query)}</div>
            <div class="suggestion-meta">
                <span>الكود: ${escapeHtml(entry.code || "-")}</span>
                <span>السعر: ${escapeHtml(formatPrice(entry.price))}</span>
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

function renderEmptyState(message) {
    resultsElement.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function showResult(entry) {
    selectedEntry = entry;
    suggestionsElement.innerHTML = "";
    statusElement.textContent = "تم عرض الصنف المختار.";
    searchInput.value = entry.name || entry.code;

    const quantity = getCartQuantity(entry.id);
    const lineTotal = entry.price * quantity;

    resultsElement.innerHTML = `
        <article class="result-card">
            <div class="result-top">
                <div>
                    <h2>${escapeHtml(entry.name || "بدون اسم")}</h2>
                    <div class="code-badge">الكود: ${escapeHtml(entry.code || "-")}</div>
                </div>
                <p class="price">${escapeHtml(formatPrice(entry.price))}</p>
            </div>

            <div class="details">
                <div class="detail">
                    <span class="detail-label">العبوة</span>
                    <strong>${escapeHtml(entry.packageValue || "-")}</strong>
                </div>
                <div class="detail">
                    <span class="detail-label">عدد العبوات بالكرتونة</span>
                    <strong>${escapeHtml(entry.cartonCount || "-")}</strong>
                </div>
                <div class="detail">
                    <span class="detail-label">الوحدة</span>
                    <strong>${escapeHtml(entry.unit || "-")}</strong>
                </div>
            </div>

            <div class="action-row">
                <div class="qty-control">
                    <button class="qty-button" type="button" data-action="add" aria-label="زيادة الكمية">+</button>
                    <span class="qty-value">${quantity}</span>
                    <button class="qty-button" type="button" data-action="subtract" aria-label="تقليل الكمية">-</button>
                </div>
                <div class="line-total">إجمالي الصنف: ${escapeHtml(formatPrice(lineTotal))}</div>
            </div>
        </article>
    `;

    resultsElement.querySelectorAll(".qty-button").forEach((button) => {
        button.addEventListener("click", () => {
            if (button.dataset.action === "add") {
                updateCart(entry, 1);
            } else {
                updateCart(entry, -1);
            }
        });
    });
}

function renderCart() {
    const cartItems = Array.from(cart.values());

    if (!cartItems.length) {
        cartListElement.innerHTML = `<div class="cart-empty">أضف الأصناف من نتيجة البحث لتجهيز عرض السعر بسرعة.</div>`;
        cartSummaryElement.textContent = "لا توجد أصناف مضافة بعد.";
        cartTotalElement.textContent = formatPrice(0);
        return;
    }

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    cartSummaryElement.textContent = `${cartItems.length} صنف، بعدد ${totalQuantity} قطعة.`;
    cartTotalElement.textContent = formatPrice(totalPrice);

    cartListElement.innerHTML = cartItems.map((item) => `
        <article class="cart-item">
            <div class="cart-item-top">
                <div>
                    <h3 class="cart-item-name">${escapeHtml(item.name || "بدون اسم")}</h3>
                    <div class="cart-item-code">الكود: ${escapeHtml(item.code || "-")}</div>
                </div>
                <div class="cart-item-total">${escapeHtml(formatPrice(item.quantity * item.price))}</div>
            </div>
            <div class="cart-item-bottom">
                <div class="qty-control">
                    <button class="qty-button" type="button" data-cart-action="add" data-entry-id="${item.id}">+</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-button" type="button" data-cart-action="subtract" data-entry-id="${item.id}">-</button>
                </div>
                <button class="mini-button" type="button" data-cart-action="remove" data-entry-id="${item.id}">حذف</button>
            </div>
        </article>
    `).join("");

    cartListElement.querySelectorAll("[data-cart-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const entryId = Number(button.dataset.entryId);
            const entry = items.find((item) => item.id === entryId);
            if (!entry) {
                return;
            }

            const action = button.dataset.cartAction;
            if (action === "add") {
                updateCart(entry, 1);
            } else if (action === "subtract") {
                updateCart(entry, -1);
            } else if (action === "remove") {
                cart.delete(entry.id);
                renderCart();
                if (selectedEntry?.id === entry.id) {
                    showResult(selectedEntry);
                }
            }
        });
    });
}

function updateCart(entry, delta) {
    const current = cart.get(entry.id) || { ...entry, quantity: 0 };
    const nextQuantity = Math.max(0, current.quantity + delta);

    if (nextQuantity === 0) {
        cart.delete(entry.id);
    } else {
        cart.set(entry.id, { ...entry, quantity: nextQuantity });
    }

    renderCart();

    if (selectedEntry?.id === entry.id) {
        showResult(entry);
    }
}

function updateActiveSuggestion(nextIndex) {
    const nodes = suggestionsElement.querySelectorAll(".suggestion");
    if (!nodes.length) {
        return;
    }

    activeIndex = (nextIndex + nodes.length) % nodes.length;
    nodes.forEach((node, index) => {
        node.classList.toggle("is-active", index === activeIndex);
    });
}

async function loadData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const rawItems = await response.json();
        items = buildIndex(rawItems);
        statusElement.textContent = `تم تحميل ${items.length} صنف. ابدأ الكتابة للبحث.`;
        renderEmptyState("اكتب اسم الصنف أو الكود ثم أضف الكمية إلى عرض الأسعار.");
        renderCart();
    } catch (error) {
        statusElement.textContent = "تعذر تحميل ملف الأسعار.";
        renderEmptyState("تأكد من تشغيل الصفحة من خلال XAMPP أو خادم محلي.");
        cartListElement.innerHTML = `<div class="cart-empty">تعذر تهيئة السلة لأن البيانات لم تُحمّل.</div>`;
        console.error(error);
    }
}

searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    const matches = findMatches(query);
    renderSuggestions(matches, query);

    if (!query.trim()) {
        renderEmptyState("اكتب اسم الصنف أو الكود ثم أضف الكمية إلى عرض الأسعار.");
        selectedEntry = null;
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
    lastMatches = [];
    activeIndex = -1;
    selectedEntry = null;
    statusElement.textContent = `تم تحميل ${items.length} صنف.`;
    renderEmptyState("اكتب اسم الصنف أو الكود ثم أضف الكمية إلى عرض الأسعار.");
    searchInput.focus();
});

clearCartButton.addEventListener("click", () => {
    cart.clear();
    renderCart();
    if (selectedEntry) {
        showResult(selectedEntry);
    }
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-panel")) {
        suggestionsElement.innerHTML = "";
    }
});

loadData();
