const DATA_URL = "./prices_adjusted.json";
const MAX_SUGGESTIONS = 12;

const searchInput = document.getElementById("searchInput");
const clearButton = document.getElementById("clearButton");
const statusElement = document.getElementById("status");
const suggestionsElement = document.getElementById("suggestions");
const resultsElement = document.getElementById("results");

let items = [];
let activeIndex = -1;
let lastMatches = [];

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
        return value ?? "";
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

        const searchable = normalizeArabic([name, code, price, packageValue, cartonCount, unit].join(" "));

        return {
            id: index,
            item,
            name: String(name ?? ""),
            code: String(code ?? ""),
            price,
            packageValue: String(packageValue ?? ""),
            cartonCount: String(cartonCount ?? ""),
            unit: String(unit ?? ""),
            searchable
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

    if (normalizeArabic(entry.name).startsWith(query)) {
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
    suggestionsElement.innerHTML = "";
    statusElement.textContent = "تم عرض الصنف المختار.";
    searchInput.value = entry.name || entry.code;
    resultsElement.innerHTML = `
        <article class="result-card">
            <h2>${escapeHtml(entry.name || "بدون اسم")}</h2>
            <p class="price">${escapeHtml(formatPrice(entry.price))}</p>
            <div class="details">
                <div class="detail">
                    <span class="detail-label">الكود</span>
                    <strong>${escapeHtml(entry.code || "-")}</strong>
                </div>
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
        </article>
    `;
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
        renderEmptyState("اكتب اسم الصنف أو الكود لتظهر النتيجة هنا.");
    } catch (error) {
        statusElement.textContent = "تعذر تحميل ملف الأسعار.";
        renderEmptyState("تأكد من فتح الصفحة عبر XAMPP أو خادم محلي حتى يعمل fetch بشكل صحيح.");
        console.error(error);
    }
}

searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    const matches = findMatches(query);
    renderSuggestions(matches, query);

    if (!query.trim()) {
        renderEmptyState("اكتب اسم الصنف أو الكود لتظهر النتيجة هنا.");
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
    statusElement.textContent = `تم تحميل ${items.length} صنف.`;
    renderEmptyState("اكتب اسم الصنف أو الكود لتظهر النتيجة هنا.");
    searchInput.focus();
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-panel")) {
        suggestionsElement.innerHTML = "";
    }
});

loadData();
