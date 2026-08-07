<?php
declare(strict_types=1);

function admin_audit_clean_text($value, int $limit = 220): string
{
  $text = trim(preg_replace('/\s+/u', ' ', strip_tags((string)$value)) ?: '');
  if (function_exists('mb_substr')) return mb_substr($text, 0, $limit);
  return substr($text, 0, $limit);
}

function admin_audit_clean_key($value): string
{
  return preg_replace('/[^a-z0-9_\-]/i', '', (string)$value) ?: '';
}

function admin_audit_clean_id($value, int $limit = 160): string
{
  $id = preg_replace('/[^a-z0-9_\-:.]/i', '-', (string)$value) ?: '';
  return trim(substr($id, 0, $limit), '-.:') ?: '';
}

function admin_audit_normalize_timestamp($value): string
{
  $text = admin_audit_clean_text($value, 48);
  return strtotime($text) ? date(DATE_ATOM, strtotime($text)) : date(DATE_ATOM);
}

function admin_audit_default_summary(array $entry): string
{
  $label = $entry['targetLabel'] !== '' ? $entry['targetLabel'] : $entry['targetId'];

  switch ($entry['action']) {
    case 'pin_created':
      return $label !== '' ? "criou pin: {$label}" : 'criou pin';
    case 'pin_updated':
      return $label !== '' ? "editou pin: {$label}" : 'editou pin';
    case 'pin_deleted':
      return $label !== '' ? "excluiu pin: {$label}" : 'excluiu pin';
    case 'pin_duplicated':
      return $label !== '' ? "duplicou pin: {$label}" : 'duplicou pin';
    case 'pin_status_changed':
      return $label !== '' ? "alterou status do pin: {$label}" : 'alterou status de pin';
    case 'pin_location_updated':
      return $label !== '' ? "moveu pin no mapa: {$label}" : 'moveu pin no mapa';
    case 'pin_image_added':
      return $label !== '' ? "adicionou imagem ao pin: {$label}" : 'adicionou imagem a pin';
    case 'pin_image_deleted':
      return $label !== '' ? "removeu imagem do pin: {$label}" : 'removeu imagem de pin';
    case 'pin_image_reordered':
      return $label !== '' ? "reordenou imagens do pin: {$label}" : 'reordenou imagens de pin';
    case 'pin_cover_updated':
      return $label !== '' ? "trocou capa do pin: {$label}" : 'trocou capa de pin';
    case 'pin_dynamic_added':
      return $label !== '' ? "adicionou conteudo ao pin: {$label}" : 'adicionou conteudo a pin';
    case 'pins_imported':
      return 'importou pins para o portal';
    case 'pins_sheet_config_updated':
      return 'configurou integração da planilha de pins';
    case 'pins_sheet_synced':
      return 'enviou pins para planilha externa';
    case 'race_updated':
      return $label !== '' ? "editou corrida: {$label}" : 'editou corrida';
    case 'news_created':
      return $label !== '' ? "criou noticia: {$label}" : 'criou noticia';
    case 'news_updated':
      return $label !== '' ? "editou noticia: {$label}" : 'editou noticia';
    case 'news_deleted':
      return $label !== '' ? "excluiu noticia: {$label}" : 'excluiu noticia';
    case 'news_refreshed':
      return 'atualizou noticias da Agencia Brasilia';
    case 'sos_updated':
      return 'alterou destinos do SOS';
  }

  $areaLabel = [
    'pins' => 'pins',
    'corridas' => 'corridas',
    'noticias' => 'noticias',
    'sos' => 'SOS'
  ][$entry['area']] ?? 'configuracoes';

  return $label !== '' ? "atualizou {$areaLabel}: {$label}" : "atualizou {$areaLabel}";
}

function admin_audit_normalize_entry(array $audit, string $adminEmail, array $defaults = []): array
{
  $source = array_merge($defaults, $audit);
  $entry = [
    'eventId' => admin_audit_clean_id($source['eventId'] ?? str_replace('.', '-', uniqid('audit-', true)), 120),
    'timestamp' => admin_audit_normalize_timestamp($source['timestamp'] ?? date(DATE_ATOM)),
    'adminEmail' => strtolower(admin_audit_clean_text($adminEmail, 160)),
    'area' => admin_audit_clean_key($source['area'] ?? 'geral') ?: 'geral',
    'action' => admin_audit_clean_key($source['action'] ?? 'updated') ?: 'updated',
    'targetType' => admin_audit_clean_key($source['targetType'] ?? 'item') ?: 'item',
    'targetId' => admin_audit_clean_id($source['targetId'] ?? '', 160),
    'targetLabel' => admin_audit_clean_text($source['targetLabel'] ?? '', 180),
    'summary' => admin_audit_clean_text($source['summary'] ?? '', 220)
  ];

  if ($entry['summary'] === '') {
    $entry['summary'] = admin_audit_default_summary($entry);
  }

  return $entry;
}

function admin_audit_append_entry(string $auditFile, string $adminEmail, ?array $audit = null, array $defaults = []): ?array
{
  if ($adminEmail === '') return null;
  $entry = admin_audit_normalize_entry(is_array($audit) ? $audit : [], $adminEmail, $defaults);
  $dir = dirname($auditFile);
  if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
  }
  file_put_contents(
    $auditFile,
    json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND | LOCK_EX
  );
  return $entry;
}

function admin_audit_load_entries(string $auditFile, int $limit = 180): array
{
  if (!is_file($auditFile)) return [];
  $lines = file($auditFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  if (!is_array($lines) || !$lines) return [];
  $chunk = array_slice($lines, -max(1, min($limit, 400)));
  $entries = [];

  for ($index = count($chunk) - 1; $index >= 0; $index--) {
    $decoded = json_decode((string)$chunk[$index], true);
    if (!is_array($decoded)) continue;
    $entries[] = admin_audit_normalize_entry($decoded, (string)($decoded['adminEmail'] ?? ''));
  }

  return $entries;
}

function admin_audit_payload_signature(array $payload, array $keys): string
{
  $sample = [];
  foreach ($keys as $key) {
    $sample[$key] = $payload[$key] ?? null;
  }
  return json_encode($sample, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '';
}
