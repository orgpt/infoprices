<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$storageFile = __DIR__ . DIRECTORY_SEPARATOR . 'saved_quotes.json';

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

function loadQuotes(string $storageFile): array
{
    if (!file_exists($storageFile)) {
        return [];
    }

    $content = file_get_contents($storageFile);
    if ($content === false || trim($content) === '') {
        return [];
    }

    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : [];
}

function saveQuotes(string $storageFile, array $quotes): void
{
    $json = json_encode(array_values($quotes), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false || file_put_contents($storageFile, $json, LOCK_EX) === false) {
        respond(500, ['ok' => false, 'message' => 'تعذر حفظ الملف.']);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $quotes = loadQuotes($storageFile);
    usort($quotes, static fn(array $a, array $b): int => strcmp((string) ($b['updatedAt'] ?? ''), (string) ($a['updatedAt'] ?? '')));
    respond(200, ['ok' => true, 'quotes' => $quotes]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'message' => 'الطريقة غير مدعومة.']);
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);

if (!is_array($payload)) {
    respond(400, ['ok' => false, 'message' => 'بيانات غير صالحة.']);
}

$name = trim((string) ($payload['name'] ?? ''));
$rows = $payload['rows'] ?? null;

if ($name === '') {
    respond(422, ['ok' => false, 'message' => 'اسم العرض مطلوب.']);
}

if (!is_array($rows) || $rows === []) {
    respond(422, ['ok' => false, 'message' => 'لا توجد أصناف لحفظها.']);
}

$normalizedRows = [];
foreach ($rows as $row) {
    if (!is_array($row)) {
        continue;
    }

    $normalizedRows[] = [
        'id' => (int) ($row['id'] ?? 0),
        'name' => (string) ($row['name'] ?? ''),
        'code' => (string) ($row['code'] ?? ''),
        'price' => (float) ($row['price'] ?? 0),
        'netPrice' => (float) ($row['netPrice'] ?? 0),
        'packageValue' => (string) ($row['packageValue'] ?? ''),
        'cartonCount' => (string) ($row['cartonCount'] ?? ''),
        'unit' => (string) ($row['unit'] ?? ''),
        'quantity' => max(1, (int) ($row['quantity'] ?? 1)),
        'discountPercent' => min(100, max(0, (float) ($row['discountPercent'] ?? 0))),
    ];
}

if ($normalizedRows === []) {
    respond(422, ['ok' => false, 'message' => 'لا توجد أصناف صالحة للحفظ.']);
}

$quotes = loadQuotes($storageFile);
$quoteId = trim((string) ($payload['id'] ?? ''));
$timestamp = gmdate('c');

if ($quoteId === '') {
    $quoteId = bin2hex(random_bytes(8));
}

$existingIndex = null;
foreach ($quotes as $index => $quote) {
    if ((string) ($quote['id'] ?? '') === $quoteId) {
        $existingIndex = $index;
        break;
    }
}

$createdAt = $existingIndex === null
    ? $timestamp
    : (string) ($quotes[$existingIndex]['createdAt'] ?? $timestamp);

$quoteRecord = [
    'id' => $quoteId,
    'name' => $name,
    'createdAt' => $createdAt,
    'updatedAt' => $timestamp,
    'itemCount' => count($normalizedRows),
    'rows' => $normalizedRows,
];

if ($existingIndex === null) {
    $quotes[] = $quoteRecord;
} else {
    $quotes[$existingIndex] = $quoteRecord;
}

saveQuotes($storageFile, $quotes);
respond(200, ['ok' => true, 'quote' => $quoteRecord]);
