<?php
$config = require __DIR__ . '/config.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
  exit;
}

$raw = file_get_contents('php://input');
if (!$raw || strlen($raw) > 24000) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'invalid_payload']);
  exit;
}

$input = json_decode($raw, true);
if (!is_array($input)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'invalid_json']);
  exit;
}

function clean_text($value, $max = 180) {
  $text = trim((string)($value ?? ''));
  $text = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $text);
  if (function_exists('mb_substr')) {
    return mb_substr($text, 0, $max, 'UTF-8');
  }
  return substr($text, 0, $max);
}

function clean_number($value, $min, $max) {
  if (!is_numeric($value)) return null;
  $number = (float)$value;
  if (!is_finite($number) || $number < $min || $number > $max) return null;
  return $number;
}

function client_ms($value) {
  $now = (int)round(microtime(true) * 1000);
  if (is_numeric($value)) {
    $ms = (int)$value;
    if ($ms > 946684800000 && $ms < $now + 86400000) return $ms;
  }
  return $now;
}

$allowedSites = $config['allowed_sites'] ?? [];
$siteId = clean_text($input['siteId'] ?? '', 60);
if (!$siteId || !isset($allowedSites[$siteId])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'unknown_site']);
  exit;
}

$event = clean_text($input['event'] ?? 'page_view', 48);
$allowedEvents = [
  'page_view', 'heartbeat', 'session_end', 'click', 'outbound_click',
  'form_submit', 'error', 'custom'
];
if (!in_array($event, $allowedEvents, true)) {
  $event = 'custom';
}

$createdAtMs = client_ms($input['createdAtMs'] ?? null);
$receivedAtMs = (int)round(microtime(true) * 1000);
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$salt = 'primus-analytics-v1';

$row = [
  'siteId' => $siteId,
  'siteName' => $allowedSites[$siteId]['name'],
  'siteUrl' => $allowedSites[$siteId]['url'],
  'event' => $event,
  'createdAtMs' => $createdAtMs,
  'receivedAtMs' => $receivedAtMs,
  'page' => clean_text($input['page'] ?? '/', 260),
  'title' => clean_text($input['title'] ?? '', 160),
  'sessionId' => clean_text($input['sessionId'] ?? '', 80),
  'visitorId' => clean_text($input['visitorId'] ?? '', 80),
  'referrer' => clean_text($input['referrer'] ?? '', 260),
  'target' => clean_text($input['target'] ?? '', 260),
  'durationSeconds' => max(0, min(86400, (int)($input['durationSeconds'] ?? 0))),
  'device' => clean_text($input['device'] ?? '', 40),
  'browser' => clean_text($input['browser'] ?? '', 40),
  'os' => clean_text($input['os'] ?? '', 40),
  'language' => clean_text($input['language'] ?? '', 40),
  'timezone' => clean_text($input['timezone'] ?? '', 80),
  'screen' => clean_text($input['screen'] ?? '', 40),
  'countryCode' => clean_text($input['countryCode'] ?? '', 8),
  'countryName' => clean_text($input['countryName'] ?? '', 80),
  'region' => clean_text($input['region'] ?? '', 80),
  'city' => clean_text($input['city'] ?? '', 90),
  'lat' => clean_number($input['lat'] ?? null, -90, 90),
  'lng' => clean_number($input['lng'] ?? null, -180, 180),
  'origin' => clean_text($_SERVER['HTTP_ORIGIN'] ?? '', 180),
  'ipHash' => $ip ? hash('sha256', $salt . '|' . $ip) : ''
];

$dataDir = $config['data_dir'];
if (!is_dir($dataDir) && !mkdir($dataDir, 0755, true)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'data_dir_failed']);
  exit;
}

$file = $dataDir . '/events-' . gmdate('Y-m', (int)floor($receivedAtMs / 1000)) . '.jsonl';
$line = json_encode($row, JSON_UNESCAPED_SLASHES) . "\n";
$handle = fopen($file, 'ab');
if (!$handle) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'write_failed']);
  exit;
}

flock($handle, LOCK_EX);
fwrite($handle, $line);
flock($handle, LOCK_UN);
fclose($handle);

echo json_encode(['ok' => true]);
