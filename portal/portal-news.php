<?php
declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');
require_once __DIR__ . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'admin-audit-lib.php';
require_once __DIR__ . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'editorial-risk.php';

$DEFAULT_ADMIN_EMAILS = [
  'ynsanuz@gmail.com',
  'primusdf@gmail.com',
  'primus.df@gmail.com',
  'parquedacidade@esporte.df.gov.br',
  'thauana@gmail.com'
];
$EDITORIAL_ROLES = load_editorial_roles($DEFAULT_ADMIN_EMAILS);
$AUTO_PUBLISH_CONFIG = nexo_news_risk_config();

$FIREBASE_API_KEY = 'AIzaSyBhMmiCVF9GtVTLQUSmgdPkT1W5RR6ykkU';
$DATA_DIR = __DIR__ . DIRECTORY_SEPARATOR . 'portal-data';
$NEWS_FILE = $DATA_DIR . DIRECTORY_SEPARATOR . 'portal-news.json';
$AUDIT_FILE = $DATA_DIR . DIRECTORY_SEPARATOR . 'admin-audit.jsonl';
$SEED_FILE = __DIR__ . DIRECTORY_SEPARATOR . 'portal-news.json';
$AGENCIA_HOME = 'https://www.agenciabrasilia.df.gov.br/';
$REFRESH_SECONDS = 21600;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = clean_key($_GET['action'] ?? '');

if ($method === 'GET') {
  if ($action === 'session' || $action === 'audit') {
    $editorialUser = verify_editorial_request($EDITORIAL_ROLES, $FIREBASE_API_KEY);
    if (!$editorialUser) {
      json_response(['ok' => false, 'error' => 'unauthorized'], 403);
    }
    if ($action === 'session') {
      json_response([
        'ok' => true,
        'user' => editorial_public_session($editorialUser)
      ]);
    }
    json_response([
      'ok' => true,
      'items' => admin_audit_load_entries($AUDIT_FILE, 220)
    ]);
  }

  $editorialViewer = optional_editorial_request($EDITORIAL_ROLES, $FIREBASE_API_KEY);
  $payload = load_news_payload($NEWS_FILE, $SEED_FILE);

  if ($action === 'refresh') {
    $editorialUser = verify_editorial_request($EDITORIAL_ROLES, $FIREBASE_API_KEY);
    if (!$editorialUser || !editorial_can($editorialUser['role'], 'refresh')) {
      json_response(['ok' => false, 'error' => 'unauthorized'], 403);
    }
    $adminEmail = $editorialUser['email'];
    $refreshed = refresh_agencia_news($payload, $AGENCIA_HOME, $AUTO_PUBLISH_CONFIG);
    $changed = admin_audit_payload_signature($payload, ['items']) !== admin_audit_payload_signature($refreshed, ['items']);
    if ($changed) {
      $payload = $refreshed;
      save_news_payload($NEWS_FILE, $DATA_DIR, $payload);
      $payload['auditEntry'] = admin_audit_append_entry(
        $AUDIT_FILE,
        $adminEmail,
        null,
        [
          'area' => 'noticias',
          'action' => 'news_refreshed',
          'targetType' => 'feed',
          'targetId' => 'agencia-brasilia',
          'targetLabel' => 'Agencia Brasilia'
        ]
      );
    }
  } elseif (should_public_refresh($NEWS_FILE, $REFRESH_SECONDS)) {
    $refreshed = refresh_agencia_news($payload, $AGENCIA_HOME, $AUTO_PUBLISH_CONFIG);
    $changed = admin_audit_payload_signature($payload, ['items']) !== admin_audit_payload_signature($refreshed, ['items']);
    if (!empty($refreshed['items']) && $changed) {
      $payload = $refreshed;
      save_news_payload($NEWS_FILE, $DATA_DIR, $payload);
      $payload['auditEntry'] = admin_audit_append_entry(
        $AUDIT_FILE,
        'sistema@automatico',
        [
          'area' => 'noticias',
          'action' => 'news_refreshed',
          'targetType' => 'feed',
          'targetId' => 'agencia-brasilia',
          'targetLabel' => 'Agencia Brasilia',
          'summary' => 'entrada automatica de noticias: Agencia Brasilia atualizada'
        ]
      );
    }
  }

  if (!$editorialViewer) {
    $payload['items'] = nexo_public_news_items($payload['items'] ?? []);
  }

  json_response($payload);
}

if ($method === 'POST') {
  $editorialUser = verify_editorial_request($EDITORIAL_ROLES, $FIREBASE_API_KEY);
  if (!$editorialUser) {
    json_response(['ok' => false, 'error' => 'unauthorized'], 403);
  }
  $adminEmail = $editorialUser['email'];

  if ($action === 'refresh') {
    if (!editorial_can($editorialUser['role'], 'refresh')) {
      json_response(['ok' => false, 'error' => 'forbidden_action'], 403);
    }
    $currentPayload = load_news_payload($NEWS_FILE, $SEED_FILE);
    $payload = refresh_agencia_news($currentPayload, $AGENCIA_HOME, $AUTO_PUBLISH_CONFIG);
    $changed = admin_audit_payload_signature($currentPayload, ['items']) !== admin_audit_payload_signature($payload, ['items']);
    if ($changed) {
      save_news_payload($NEWS_FILE, $DATA_DIR, $payload);
      $payload['auditEntry'] = admin_audit_append_entry(
        $AUDIT_FILE,
        $adminEmail,
        null,
        [
          'area' => 'noticias',
          'action' => 'news_refreshed',
          'targetType' => 'feed',
          'targetId' => 'agencia-brasilia',
          'targetLabel' => 'Agencia Brasilia'
        ]
      );
    } else {
      $payload = $currentPayload;
    }
    json_response($payload);
  }

  $input = json_decode(file_get_contents('php://input') ?: '', true);
  if (!is_array($input)) {
    json_response(['ok' => false, 'error' => 'invalid_json'], 400);
  }

  $currentPayload = load_news_payload($NEWS_FILE, $SEED_FILE);
  $proposedItems = classify_editorial_items(sanitize_news_items($input['items'] ?? []), $AUTO_PUBLISH_CONFIG);
  $permissionError = enforce_editorial_changes(
    $currentPayload['items'] ?? [],
    $proposedItems,
    $editorialUser
  );
  if ($permissionError !== '') {
    json_response(['ok' => false, 'error' => $permissionError], 403);
  }

  $payload = [
    'ok' => true,
    'updatedAt' => date(DATE_ATOM),
    'items' => stamp_editorial_changes($currentPayload['items'] ?? [], $proposedItems, $editorialUser, $AUTO_PUBLISH_CONFIG)
  ];

  $changed = admin_audit_payload_signature($currentPayload, ['items']) !== admin_audit_payload_signature($payload, ['items']);
  $auditEntry = null;

  if ($changed) {
    save_news_payload($NEWS_FILE, $DATA_DIR, $payload);
    $auditEntry = admin_audit_append_entry(
      $AUDIT_FILE,
      $adminEmail,
      is_array($input['audit'] ?? null) ? $input['audit'] : null,
      [
        'area' => 'noticias',
        'action' => 'news_updated',
        'targetType' => 'noticia'
      ]
    );
  } else {
    $payload = $currentPayload;
  }

  $payload['auditEntry'] = $auditEntry;
  json_response($payload);
}

json_response(['ok' => false, 'error' => 'method_not_allowed'], 405);

function should_public_refresh(string $newsFile, int $refreshSeconds): bool
{
  return !is_file($newsFile) || (time() - (int)filemtime($newsFile)) > $refreshSeconds;
}

function load_news_payload(string $newsFile, string $seedFile): array
{
  foreach ([$newsFile, $seedFile] as $file) {
    if (!is_file($file)) continue;
    $decoded = json_decode((string)file_get_contents($file), true);
    if (is_array($decoded)) {
      return [
        'ok' => true,
        'updatedAt' => clean_text($decoded['updatedAt'] ?? date(DATE_ATOM), 40),
        'items' => sanitize_news_items($decoded['items'] ?? [])
      ];
    }
  }

  return ['ok' => true, 'updatedAt' => date(DATE_ATOM), 'items' => []];
}

function save_news_payload(string $newsFile, string $dataDir, array $payload): void
{
  if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
  }
  $payload['items'] = sanitize_news_items($payload['items'] ?? []);
  $payload['updatedAt'] = clean_text($payload['updatedAt'] ?? date(DATE_ATOM), 40);
  file_put_contents($newsFile, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

function sanitize_news_items($items): array
{
  if (!is_array($items)) return [];
  $clean = [];
  foreach (array_slice($items, 0, 80) as $item) {
    if (!is_array($item)) continue;
    $title = clean_text($item['title'] ?? '', 220);
    if ($title === '') continue;
    $sourceType = clean_key($item['sourceType'] ?? 'manual');
    if (!in_array($sourceType, ['agencia', 'ai', 'manual'], true)) $sourceType = 'manual';
    $status = clean_key($item['status'] ?? 'draft');
    $allowedStatuses = ['submitted', 'draft', 'awaiting_validation', 'in_review', 'approved', 'scheduled', 'published', 'rejected', 'archived'];
    if (!in_array($status, $allowedStatuses, true)) $status = 'draft';

    $clean[] = [
      'id' => clean_id($item['id'] ?? slugify($title)),
      'title' => $title,
      'summary' => clean_text($item['summary'] ?? '', 520),
      'body' => clean_body_text($item['body'] ?? '', 24000),
      'category' => clean_text($item['category'] ?? 'Esportes', 80),
      'status' => $status,
      'featured' => !empty($item['featured']),
      'sourceType' => $sourceType,
      'sourceName' => clean_text($item['sourceName'] ?? source_name_for_type($sourceType), 120),
      'sourceUrl' => clean_url($item['sourceUrl'] ?? ''),
      'author' => clean_text($item['author'] ?? '', 160),
      'image' => clean_url($item['image'] ?? ''),
      'imageCredit' => clean_text($item['imageCredit'] ?? '', 180),
      'publishedAt' => clean_text($item['publishedAt'] ?? date(DATE_ATOM), 40),
      'updatedAt' => clean_text($item['updatedAt'] ?? date(DATE_ATOM), 40),
      'editedByAdmin' => !empty($item['editedByAdmin']),
      'ownerEmail' => strtolower(clean_text($item['ownerEmail'] ?? '', 160)),
      'lastEditedBy' => strtolower(clean_text($item['lastEditedBy'] ?? '', 160)),
      'riskLevel' => sanitize_risk_level($item['riskLevel'] ?? 'unclassified'),
      'riskReasons' => sanitize_text_list($item['riskReasons'] ?? [], 8, 180),
      'automationEligible' => !empty($item['automationEligible']),
      'automationDecision' => sanitize_automation_decision($item['automationDecision'] ?? 'unclassified'),
      'classificationVersion' => clean_text($item['classificationVersion'] ?? '', 40),
      'classifiedAt' => clean_text($item['classifiedAt'] ?? '', 40),
      'validatedBy' => strtolower(clean_text($item['validatedBy'] ?? '', 160)),
      'validatedAt' => clean_text($item['validatedAt'] ?? '', 40)
    ];
  }

  usort($clean, function ($a, $b) {
    return (int)$b['featured'] <=> (int)$a['featured']
      ?: strtotime($b['publishedAt']) <=> strtotime($a['publishedAt']);
  });

  return $clean;
}

function source_name_for_type(string $sourceType): string
{
  if ($sourceType === 'agencia') return 'Agência Brasília';
  if ($sourceType === 'ai') return 'IA / revisão editorial';
  return 'NEXO Notícias';
}

function refresh_agencia_news(array $payload, string $agenciaHome, array $automationConfig): array
{
  $existing = sanitize_news_items($payload['items'] ?? []);
  $links = collect_agencia_links($agenciaHome);
  $imported = [];

  foreach (array_slice($links, 0, 35) as $url) {
    $article = parse_agencia_article($url);
    if (!$article || !is_sports_article($article)) continue;
    $imported[] = $article;
    if (count($imported) >= 12) break;
  }

  $existingByUrl = [];
  foreach ($existing as $item) {
    if (!empty($item['sourceUrl'])) {
      $existingByUrl[$item['sourceUrl']] = $item;
    }
  }

  $merged = [];
  foreach ($imported as $article) {
    $old = $existingByUrl[$article['sourceUrl']] ?? null;
    if ($old && !empty($old['editedByAdmin'])) {
      $merged[] = $old;
      continue;
    }
    if ($old) {
      $article['id'] = $old['id'];
      $article['status'] = $old['status'];
      $article['featured'] = !empty($old['featured']);
      $article['editedByAdmin'] = !empty($old['editedByAdmin']);
      $article['ownerEmail'] = $old['ownerEmail'] ?? '';
      $article['lastEditedBy'] = $old['lastEditedBy'] ?? '';
      $article['validatedBy'] = $old['validatedBy'] ?? '';
      $article['validatedAt'] = $old['validatedAt'] ?? '';
      $article = nexo_classify_news_item($article, $automationConfig);
    } else {
      $article = nexo_apply_import_policy($article, $automationConfig);
    }
    $merged[] = $article;
  }

  foreach ($existing as $item) {
    $already = false;
    foreach ($merged as $news) {
      if ($news['id'] === $item['id'] || ($item['sourceUrl'] && $news['sourceUrl'] === $item['sourceUrl'])) {
        $already = true;
        break;
      }
    }
    if (!$already) $merged[] = $item;
  }

  return [
    'ok' => true,
    'updatedAt' => date(DATE_ATOM),
    'items' => sanitize_news_items($merged)
  ];
}

function collect_agencia_links(string $agenciaHome): array
{
  $seedPages = [
    $agenciaHome,
    $agenciaHome . 'web/guest/topicos?delta=30&sort=createDate-&tag=Esporte',
    $agenciaHome . 'web/guest/topicos?delta=30&sort=createDate-&tag=Secretaria%20de%20Esporte%20e%20Lazer%20do%20Distrito%20Federal%20%28SEL-DF%29'
  ];
  $links = [];

  foreach ($seedPages as $page) {
    $html = http_get($page);
    if ($html === '') continue;
    if (preg_match_all('/href=["\']([^"\']*\/w\/[^"\']+)["\']/i', $html, $matches)) {
      foreach ($matches[1] as $href) {
        $url = normalize_agencia_url($href, $agenciaHome);
        if ($url) $links[$url] = $url;
      }
    }
  }

  return array_values($links);
}

function parse_agencia_article(string $url): ?array
{
  $html = http_get($url);
  if ($html === '') return null;

  $title = html_meta($html, 'og:title');
  $summary = html_meta($html, 'og:description');
  $body = extract_agencia_body($html);
  $image = html_entity_decode(html_meta($html, 'og:image'), ENT_QUOTES | ENT_HTML5, 'UTF-8');
  $imageCredit = html_meta($html, 'og:image:alt');
  if (!is_safe_agencia_image_credit($imageCredit)) {
    $image = 'assets/atividade-corrida-lite.jpg';
  }
  $plain = html_plain_text($html);
  $publishedAt = extract_agencia_date($plain);
  $author = extract_agencia_author($plain);

  if ($title === '' || $summary === '') return null;

  return [
    'id' => 'agencia-' . slugify($title),
    'title' => $title,
    'summary' => $summary,
    'body' => $body,
    'category' => 'Esportes',
        'status' => 'draft',
    'featured' => false,
    'sourceType' => 'agencia',
    'sourceName' => 'Agência Brasília',
    'sourceUrl' => $url,
    'author' => $author ?: 'Agência Brasília',
    'image' => clean_url($image),
    'imageCredit' => $imageCredit,
    'publishedAt' => $publishedAt ?: date(DATE_ATOM),
    'updatedAt' => date(DATE_ATOM),
    'editedByAdmin' => false
  ];
}

function is_sports_article(array $article): bool
{
  $haystack = normalize_ascii(implode(' ', [
    $article['title'] ?? '',
    $article['summary'] ?? '',
    $article['category'] ?? '',
    $article['sourceUrl'] ?? '',
    $article['author'] ?? ''
  ]));
  $keywords = [
    'esporte', 'esportiva', 'esportivo', 'atleta', 'atletas', 'corrida',
    'lazer', 'quadra', 'campo', 'ginásio', 'ginasio', 'basquete', 'futebol',
    'vôlei', 'volei', 'paradesporto', 'bolsa atleta', 'lei de incentivo',
    'centro olimpico', 'centro olímpico', 'sel-df', 'secretaria de esporte'
  ];
  foreach ($keywords as $keyword) {
    if (strpos($haystack, normalize_ascii($keyword)) !== false) return true;
  }
  return false;
}

function is_safe_agencia_image_credit(string $credit): bool
{
  $credit = normalize_ascii($credit);
  $safeTerms = [
    'agencia brasilia',
    'divulgacao',
    'sel-df',
    'secretaria de esporte',
    'administracao regional',
    'brasilia ambiental',
    'gdf'
  ];
  foreach ($safeTerms as $term) {
    if (strpos($credit, normalize_ascii($term)) !== false) return true;
  }
  return false;
}

function html_meta(string $html, string $property): string
{
  if (preg_match('/<meta[^>]+property=["\']' . preg_quote($property, '/') . '["\'][^>]+content=["\']([^"\']*)["\']/i', $html, $match)) {
    return html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
  }
  if (preg_match('/<meta[^>]+content=["\']([^"\']*)["\'][^>]+property=["\']' . preg_quote($property, '/') . '["\']/i', $html, $match)) {
    return html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
  }
  return '';
}

function html_plain_text(string $html): string
{
  $html = preg_replace('/<script\b[^>]*>.*?<\/script>/is', ' ', $html) ?? $html;
  $html = preg_replace('/<style\b[^>]*>.*?<\/style>/is', ' ', $html) ?? $html;
  $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
  return preg_replace('/\s+/u', ' ', $text) ?: '';
}

function extract_agencia_body(string $html): string
{
  $content = extract_html_inner_by_class($html, 'div', 'conteudo');
  if ($content === '') return '';

  $blocks = [];
  if (preg_match_all('/<(p|h2|h3|blockquote|li)\b[^>]*>([\s\S]*?)<\/\1>/iu', $content, $matches, PREG_SET_ORDER)) {
    foreach ($matches as $match) {
      $text = clean_body_text($match[2] ?? '', 2400);
      $text = preg_replace('/\s+\|\s*Foto(?:s)?\s*:.*/iu', '', $text) ?? $text;
      $normalized = normalize_ascii($text);

      if ($text === '') continue;
      if ($normalized === 'leia tambem') continue;
      if (is_agencia_caption_block($text)) continue;

      $blocks[] = $text;
    }
  }

  return clean_body_text(implode("\n\n", $blocks), 24000);
}

function extract_html_inner_by_class(string $html, string $tag, string $className): string
{
  if (!preg_match('/<' . preg_quote($tag, '/') . '\b[^>]*class=["\'][^"\']*\b' . preg_quote($className, '/') . '\b[^"\']*["\'][^>]*>/iu', $html, $match, PREG_OFFSET_CAPTURE)) {
    return '';
  }

  $openingTag = $match[0][0];
  $start = $match[0][1];
  $offset = $start + strlen($openingTag);
  $depth = 1;

  while ($offset < strlen($html) && preg_match('/<\/?' . preg_quote($tag, '/') . '\b[^>]*>/iu', $html, $tagMatch, PREG_OFFSET_CAPTURE, $offset)) {
    $fullTag = $tagMatch[0][0];
    $tagPos = $tagMatch[0][1];
    $offset = $tagPos + strlen($fullTag);

    if (strpos($fullTag, '</') === 0) {
      $depth--;
      if ($depth === 0) {
        return substr($html, $start + strlen($openingTag), $tagPos - ($start + strlen($openingTag)));
      }
      continue;
    }

    if (!preg_match('/\/\s*>$/', $fullTag)) {
      $depth++;
    }
  }

  return '';
}

function is_agencia_caption_block(string $text): bool
{
  if (preg_match('/^\*Com informa/i', $text)) return false;
  $wordCount = preg_match_all('/[\p{L}\p{N}\-]+/u', $text);
  return $wordCount > 8 && !preg_match('/[.!?;:]/u', $text);
}

function extract_agencia_date(string $plain): string
{
  if (!preg_match('/(\d{2})\/(\d{2})\/(\d{4})\s+às\s+(\d{2})h(\d{2})/u', $plain, $match)) {
    return '';
  }
  return sprintf('%04d-%02d-%02dT%02d:%02d:00-03:00', (int)$match[3], (int)$match[2], (int)$match[1], (int)$match[4], (int)$match[5]);
}

function extract_agencia_author(string $plain): string
{
  if (preg_match('/Por\s+(.{3,120}?)\s+Edição/u', $plain, $match)) {
    return clean_text($match[1], 160);
  }
  if (preg_match('/Por\s+(.{3,120}?)\s+Compartilhar/u', $plain, $match)) {
    return clean_text($match[1], 160);
  }
  return '';
}

function normalize_agencia_url(string $href, string $base): string
{
  $href = html_entity_decode($href, ENT_QUOTES | ENT_HTML5, 'UTF-8');
  if (strpos($href, '/') === 0) $href = rtrim($base, '/') . $href;
  if (!preg_match('/^https:\/\/www\.agenciabrasilia\.df\.gov\.br\/w\//i', $href)) return '';
  $parts = parse_url($href);
  if (empty($parts['scheme']) || empty($parts['host']) || empty($parts['path'])) return '';
  return $parts['scheme'] . '://' . $parts['host'] . $parts['path'];
}

function http_get(string $url): string
{
  $result = false;
  if (ini_get('allow_url_fopen')) {
    $context = stream_context_create(['http' => ['timeout' => 8, 'ignore_errors' => true, 'header' => "User-Agent: PortalParqueBot/1.0\r\n"]]);
    $result = @file_get_contents($url, false, $context);
  }
  if ($result === false && function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT => 8,
      CURLOPT_USERAGENT => 'PortalParqueBot/1.0'
    ]);
    $result = curl_exec($ch);
    curl_close($ch);
  }
  return is_string($result) ? $result : '';
}

function load_editorial_roles(array $fallbackAdmins): array
{
  $roles = [];
  $sources = [
    'contributor' => 'NEXO_CONTRIBUTOR_EMAILS',
    'editor' => 'NEXO_EDITOR_EMAILS',
    'reviewer' => 'NEXO_REVIEWER_EMAILS',
    'administrator' => 'NEXO_ADMIN_EMAILS',
    'super_admin' => 'NEXO_SUPER_ADMIN_EMAILS'
  ];

  foreach ($sources as $role => $environmentKey) {
    $raw = trim((string)getenv($environmentKey));
    if ($raw === '') continue;
    foreach (preg_split('/[,;\s]+/', $raw) ?: [] as $email) {
      $email = strtolower(trim($email));
      if (filter_var($email, FILTER_VALIDATE_EMAIL)) $roles[$email] = $role;
    }
  }

  if (!$roles) {
    foreach ($fallbackAdmins as $email) {
      $email = strtolower(trim((string)$email));
      if (filter_var($email, FILTER_VALIDATE_EMAIL)) $roles[$email] = 'administrator';
    }
  }

  return $roles;
}

function verify_editorial_request(array $roles, string $firebaseApiKey): ?array
{
  $email = verify_admin_request(array_keys($roles), $firebaseApiKey);
  if ($email === '' || empty($roles[$email])) return null;
  return ['email' => $email, 'role' => $roles[$email]];
}

function optional_editorial_request(array $roles, string $firebaseApiKey): ?array
{
  $headers = read_request_headers();
  if (!preg_match('/Bearer\s+\S+/i', $headers['authorization'] ?? '')) return null;
  return verify_editorial_request($roles, $firebaseApiKey);
}

function editorial_public_session(array $user): array
{
  $role = (string)($user['role'] ?? 'contributor');
  return [
    'email' => (string)($user['email'] ?? ''),
    'role' => $role,
    'roleLabel' => editorial_role_label($role),
    'permissions' => [
      'refresh' => editorial_can($role, 'refresh'),
      'approve' => editorial_can($role, 'approve'),
      'publish' => editorial_can($role, 'publish'),
      'delete' => editorial_can($role, 'delete')
    ]
  ];
}

function editorial_role_label(string $role): string
{
  return [
    'contributor' => 'Colaborador',
    'editor' => 'Editor',
    'reviewer' => 'Revisor',
    'administrator' => 'Administrador',
    'super_admin' => 'Superadministrador'
  ][$role] ?? 'Colaborador';
}

function editorial_role_rank(string $role): int
{
  return [
    'contributor' => 10,
    'editor' => 20,
    'reviewer' => 30,
    'administrator' => 40,
    'super_admin' => 50
  ][$role] ?? 0;
}

function editorial_can(string $role, string $permission): bool
{
  $rank = editorial_role_rank($role);
  $minimum = [
    'refresh' => 20,
    'approve' => 30,
    'publish' => 40,
    'delete' => 40
  ][$permission] ?? 50;
  return $rank >= $minimum;
}

function editorial_allowed_statuses(string $role): array
{
  if (editorial_can($role, 'publish')) {
    return ['submitted', 'draft', 'awaiting_validation', 'in_review', 'approved', 'scheduled', 'published', 'rejected', 'archived'];
  }
  if (editorial_can($role, 'approve')) {
    return ['submitted', 'draft', 'awaiting_validation', 'in_review', 'approved', 'rejected', 'archived'];
  }
  if (editorial_role_rank($role) >= editorial_role_rank('editor')) {
    return ['submitted', 'draft', 'awaiting_validation', 'in_review', 'rejected'];
  }
  return ['submitted', 'draft'];
}

function editorial_item_signature(array $item): string
{
  unset(
    $item['updatedAt'],
    $item['lastEditedBy'],
    $item['riskLevel'],
    $item['riskReasons'],
    $item['automationEligible'],
    $item['automationDecision'],
    $item['classificationVersion'],
    $item['classifiedAt']
  );
  ksort($item);
  return json_encode($item, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '';
}

function enforce_editorial_changes(array $currentItems, array $proposedItems, array $user): string
{
  $currentById = [];
  foreach (sanitize_news_items($currentItems) as $item) $currentById[$item['id']] = $item;
  $proposedById = [];
  foreach ($proposedItems as $item) $proposedById[$item['id']] = $item;

  if (!editorial_can($user['role'], 'delete')) {
    foreach ($currentById as $id => $item) {
      if (!isset($proposedById[$id])) return 'delete_not_allowed';
    }
  }

  $allowedStatuses = editorial_allowed_statuses($user['role']);
  foreach ($proposedById as $id => $item) {
    $old = $currentById[$id] ?? null;
    if ($old && editorial_item_signature($old) === editorial_item_signature($item)) continue;
    if (!in_array($item['status'], $allowedStatuses, true)) return 'status_not_allowed';
    if ($user['role'] === 'contributor' && $old) {
      $owner = strtolower((string)($old['ownerEmail'] ?? ''));
      if ($owner === '' || $owner !== $user['email']) return 'item_not_owned';
    }
  }
  return '';
}

function classify_editorial_items(array $items, array $automationConfig): array
{
  foreach ($items as &$item) $item = nexo_classify_news_item($item, $automationConfig);
  unset($item);
  return $items;
}

function stamp_editorial_changes(array $currentItems, array $proposedItems, array $user, array $automationConfig): array
{
  $currentById = [];
  foreach (sanitize_news_items($currentItems) as $item) $currentById[$item['id']] = $item;

  foreach ($proposedItems as &$item) {
    $old = $currentById[$item['id']] ?? null;
    if ($old && editorial_item_signature($old) === editorial_item_signature($item)) continue;
    $item = nexo_classify_news_item($item, $automationConfig);
    if (empty($item['ownerEmail'])) $item['ownerEmail'] = $old['ownerEmail'] ?? $user['email'];
    $item['lastEditedBy'] = $user['email'];
    $item['updatedAt'] = date(DATE_ATOM);
    if (in_array($item['status'], ['approved', 'scheduled', 'published'], true)
      && in_array($item['riskLevel'], ['medium', 'high', 'critical'], true)
      && editorial_can($user['role'], 'approve')) {
      $item['validatedBy'] = $user['email'];
      $item['validatedAt'] = date(DATE_ATOM);
      $item['automationDecision'] = 'manual_approval';
    }
  }
  unset($item);
  return sanitize_news_items($proposedItems);
}

function verify_admin_request(array $adminEmails, string $firebaseApiKey): string
{
  $headers = read_request_headers();
  $auth = $headers['authorization'] ?? '';

  if (preg_match('/Bearer\s+(.+)/i', $auth, $match)) {
    $response = http_post_json(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . rawurlencode($firebaseApiKey),
      ['idToken' => trim($match[1])]
    );
    $email = strtolower((string)($response['users'][0]['email'] ?? ''));
    if ($email !== '' && in_array($email, array_map('strtolower', $adminEmails), true)) {
      return $email;
    }
  }

  if (is_trusted_local_admin_request()) {
    $fallbackEmail = strtolower(trim((string)($headers['x-portal-admin-email'] ?? '')));
    if ($fallbackEmail !== '' && in_array($fallbackEmail, array_map('strtolower', $adminEmails), true)) {
      return $fallbackEmail;
    }
  }

  return '';
}

function http_post_json(string $url, array $payload): array
{
  $body = json_encode($payload);
  $result = false;

  if (ini_get('allow_url_fopen')) {
    $context = stream_context_create([
      'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $body,
        'timeout' => 8,
        'ignore_errors' => true
      ]
    ]);
    $result = @file_get_contents($url, false, $context);
  }

  if ($result === false && function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => $body,
      CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 8
    ]);
    $result = curl_exec($ch);
    curl_close($ch);
  }

  $decoded = json_decode((string)$result, true);
  return is_array($decoded) ? $decoded : [];
}

function read_request_headers(): array
{
  $headers = [];
  foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') !== 0) continue;
    $name = strtolower(str_replace('_', '-', substr($key, 5)));
    $headers[$name] = (string)$value;
  }
  if (function_exists('getallheaders')) {
    foreach ((array)getallheaders() as $name => $value) {
      $headers[strtolower((string)$name)] = (string)$value;
    }
  }
  return $headers;
}

function is_trusted_local_admin_request(): bool
{
  $remoteAddr = trim((string)($_SERVER['REMOTE_ADDR'] ?? ''));
  return in_array($remoteAddr, ['127.0.0.1', '::1'], true);
}

function sanitize_risk_level($value): string
{
  $level = clean_key($value);
  return in_array($level, ['unclassified', 'low', 'medium', 'high', 'critical'], true) ? $level : 'unclassified';
}

function sanitize_automation_decision($value): string
{
  $decision = clean_key($value);
  $allowed = ['unclassified', 'auto_publish', 'ready_but_disabled', 'awaiting_validation', 'manual_approval'];
  return in_array($decision, $allowed, true) ? $decision : 'unclassified';
}

function sanitize_text_list($values, int $maxItems, int $maxLength): array
{
  if (!is_array($values)) return [];
  $clean = [];
  foreach (array_slice($values, 0, $maxItems) as $value) {
    $text = clean_text($value, $maxLength);
    if ($text !== '') $clean[] = $text;
  }
  return array_values(array_unique($clean));
}

function clean_key($value): string
{
  return preg_replace('/[^a-z0-9_\-]/i', '', (string)$value) ?: '';
}

function clean_id($value): string
{
  $id = preg_replace('/[^a-z0-9_\-]/i', '-', (string)$value) ?: '';
  return trim(substr($id, 0, 140), '-') ?: 'news-' . time();
}

function clean_text($value, int $limit): string
{
  $text = trim(preg_replace('/\s+/u', ' ', strip_tags((string)$value)) ?: '');
  if (function_exists('mb_substr')) return mb_substr($text, 0, $limit);
  return substr($text, 0, $limit);
}

function clean_body_text($value, int $limit): string
{
  $text = html_entity_decode(strip_tags((string)$value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
  $text = str_replace(["\r\n", "\r"], "\n", $text);
  $text = preg_replace('/[ \t]+\n/u', "\n", $text) ?? $text;
  $text = preg_replace('/\n{3,}/u', "\n\n", $text) ?? $text;
  $text = preg_replace('/[ \t]{2,}/u', ' ', $text) ?? $text;
  $text = preg_replace('/[ \t]+([,.;:!?])/u', '$1', $text) ?? $text;
  $text = trim($text);

  if (function_exists('mb_substr')) return mb_substr($text, 0, $limit);
  return substr($text, 0, $limit);
}

function clean_url($value): string
{
  $url = trim((string)$value);
  if ($url === '') return '';
  if (preg_match('/^https?:\/\//i', $url) || preg_match('/^assets\//i', $url)) return $url;
  return '';
}

function slugify(string $value): string
{
  $slug = normalize_ascii($value);
  $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?: '';
  return trim(substr($slug, 0, 100), '-') ?: 'noticia-' . time();
}

function normalize_ascii(string $value): string
{
  $value = strtr($value, [
    'á'=>'a','à'=>'a','ã'=>'a','â'=>'a','ä'=>'a','Á'=>'a','À'=>'a','Ã'=>'a','Â'=>'a','Ä'=>'a',
    'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e','É'=>'e','È'=>'e','Ê'=>'e','Ë'=>'e',
    'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i','Í'=>'i','Ì'=>'i','Î'=>'i','Ï'=>'i',
    'ó'=>'o','ò'=>'o','õ'=>'o','ô'=>'o','ö'=>'o','Ó'=>'o','Ò'=>'o','Õ'=>'o','Ô'=>'o','Ö'=>'o',
    'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u','Ú'=>'u','Ù'=>'u','Û'=>'u','Ü'=>'u',
    'ç'=>'c','Ç'=>'c','ñ'=>'n','Ñ'=>'n'
  ]);
  return strtolower($value);
}

function json_response(array $payload, int $status = 200): void
{
  http_response_code($status);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
