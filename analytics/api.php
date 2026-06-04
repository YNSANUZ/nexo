<?php
$config = require __DIR__ . '/config.php';

header('Cache-Control: no-store');
header('Content-Type: application/json; charset=utf-8');

$readKey = (string)($config['read_key'] ?? '');
if ($readKey === '') {
  http_response_code(503);
  echo json_encode(['ok' => false, 'error' => 'analytics_key_not_configured']);
  exit;
}

$providedKey = $_GET['key'] ?? ($_SERVER['HTTP_X_ANALYTICS_KEY'] ?? '');
if (!hash_equals($readKey, (string)$providedKey)) {
  http_response_code(401);
  echo json_encode(['ok' => false, 'error' => 'unauthorized']);
  exit;
}

$days = max(1, min(1825, (int)($_GET['days'] ?? 7)));
$site = preg_replace('/[^a-z0-9_-]/i', '', (string)($_GET['site'] ?? ''));
$nowMs = (int)round(microtime(true) * 1000);
$startMs = $nowMs - ($days * 86400000);
$dataDir = $config['data_dir'];
$events = [];

if (is_dir($dataDir)) {
  $files = glob($dataDir . '/events-*.jsonl') ?: [];
  rsort($files, SORT_STRING);
  foreach ($files as $file) {
    $handle = fopen($file, 'rb');
    if (!$handle) continue;
    while (($line = fgets($handle)) !== false) {
      $row = json_decode($line, true);
      if (!is_array($row)) continue;
      $createdAtMs = (int)($row['createdAtMs'] ?? $row['receivedAtMs'] ?? 0);
      if ($createdAtMs < $startMs) continue;
      if ($site && ($row['siteId'] ?? '') !== $site) continue;
      $events[] = $row;
      if (count($events) >= 25000) break 2;
    }
    fclose($handle);
  }
}

usort($events, function ($a, $b) {
  return (int)($b['createdAtMs'] ?? 0) <=> (int)($a['createdAtMs'] ?? 0);
});

echo json_encode([
  'ok' => true,
  'generatedAtMs' => $nowMs,
  'days' => $days,
  'sites' => $config['allowed_sites'],
  'events' => $events
], JSON_UNESCAPED_SLASHES);
