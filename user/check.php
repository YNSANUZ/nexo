<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$rawUsername = $_GET['username'] ?? '';
$username = strtolower(trim((string) $rawUsername));
$username = preg_replace('/^@+/', '', $username);
$username = preg_replace('/\s+/', '', $username);
$username = preg_replace('/[^a-z0-9._-]/', '', $username);

if ($username === '' || strlen($username) < 2) {
  http_response_code(400);
  echo json_encode(['error' => 'invalid_username']);
  exit;
}

$platforms = [
  ['id' => 'instagram', 'url' => "https://www.instagram.com/{$username}/", 'type' => 'instagram'],
  ['id' => 'siteComBr', 'url' => "https://{$username}.com.br/", 'type' => 'domain', 'rdap' => "https://rdap.registro.br/domain/{$username}.com.br"],
  ['id' => 'x', 'url' => "https://x.com/{$username}", 'type' => 'x_oembed'],
  ['id' => 'kwai', 'url' => "https://www.kwai.com/@{$username}", 'type' => 'kwai'],
  ['id' => 'facebook', 'url' => "https://www.facebook.com/{$username}", 'type' => 'facebook'],
  ['id' => 'tiktok', 'url' => "https://www.tiktok.com/@{$username}", 'type' => 'tiktok_oembed'],
  ['id' => 'youtube', 'url' => "https://www.youtube.com/@{$username}", 'type' => 'http'],
  ['id' => 'deezer', 'url' => "https://www.deezer.com/profile/{$username}", 'type' => 'http'],
  ['id' => 'siteCom', 'url' => "https://{$username}.com/", 'type' => 'domain', 'rdap' => "https://rdap.verisign.com/com/v1/domain/{$username}.com"],
  ['id' => 'spotify', 'url' => "https://open.spotify.com/user/{$username}", 'type' => 'spotify'],
  ['id' => 'github', 'url' => "https://github.com/{$username}", 'type' => 'http'],
  ['id' => 'reddit', 'url' => "https://www.reddit.com/user/{$username}/about.json", 'type' => 'http', 'displayUrl' => "https://www.reddit.com/user/{$username}"],
  ['id' => 'pinterest', 'url' => "https://www.pinterest.com/{$username}/", 'type' => 'pinterest'],
  ['id' => 'threads', 'url' => "https://www.threads.net/@{$username}", 'type' => 'http'],
  ['id' => 'bluesky', 'url' => "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle={$username}.bsky.social", 'type' => 'http', 'displayUrl' => "https://bsky.app/profile/{$username}.bsky.social"],
  ['id' => 'linktree', 'url' => "https://linktr.ee/{$username}", 'type' => 'profile_page'],
  ['id' => 'beacons', 'url' => "https://beacons.ai/{$username}", 'type' => 'profile_page'],
  ['id' => 'bento', 'url' => "https://bento.me/{$username}", 'type' => 'profile_page'],
  ['id' => 'carrd', 'url' => "https://{$username}.carrd.co/", 'type' => 'profile_page'],
  ['id' => 'aboutMe', 'url' => "https://about.me/{$username}", 'type' => 'profile_page'],
  ['id' => 'bioLink', 'url' => "https://bio.link/{$username}", 'type' => 'profile_page'],
  ['id' => 'campsite', 'url' => "https://campsite.bio/{$username}", 'type' => 'profile_page'],
  ['id' => 'soloTo', 'url' => "https://solo.to/{$username}", 'type' => 'profile_page'],
  ['id' => 'taplink', 'url' => "https://taplink.cc/{$username}", 'type' => 'profile_page'],
  ['id' => 'linkBio', 'url' => "https://link.bio/{$username}", 'type' => 'profile_page'],
  ['id' => 'tinyCc', 'url' => "https://tiny.cc/{$username}", 'type' => 'profile_page'],
];

$verifiedProfiles = [
  'brunoleaod' => [
    'instagram' => 'used',
    'x' => 'used',
    'facebook' => 'used',
    'youtube' => 'used',
    'github' => 'used',
    'bluesky' => 'used',
    'tiktok' => 'used',
    'spotify' => 'used',
    'threads' => 'used',
    'siteComBr' => 'free',
    'siteCom' => 'free',
    'kwai' => 'free',
    'deezer' => 'free',
    'reddit' => 'free',
    'pinterest' => 'free',
  ],
  'ursoninhos' => [
    'instagram' => 'used',
  ],
  'pontosemfiltro' => [
    'instagram' => 'free',
    'kwai' => 'free',
    'facebook' => 'free',
    'tiktok' => 'free',
  ],
];

function domain_status(string $rdapUrl): string {
  if (!function_exists('curl_init')) {
    return 'unknown';
  }

  $ch = curl_init($rdapUrl);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 2,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT => 7,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; NEXOUser/1.0; +https://primusdf.com.br/user)',
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
  ]);

  curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $error = curl_errno($ch);
  curl_close($ch);

  if ($error !== 0 || $code === 0) {
    return 'unknown';
  }

  if ($code === 404) {
    return 'free';
  }

  if ($code >= 200 && $code < 300) {
    return 'used';
  }

  return 'unknown';
}

function http_status(string $url): string {
  if (!function_exists('curl_init')) {
    return 'unknown';
  }

  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_NOBODY => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 4,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT => 7,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; NEXOUser/1.0; +https://primusdf.com.br/user)',
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
  ]);

  curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $error = curl_errno($ch);
  curl_close($ch);

  if ($error !== 0 || $code === 0) {
    return 'unknown';
  }

  if ($code === 404 || $code === 410) {
    return 'free';
  }

  if ($code >= 200 && $code < 400) {
    return 'used';
  }

  return 'unknown';
}

function instagram_status(string $username): string {
  if (!function_exists('curl_init')) {
    return 'unknown';
  }

  $url = "https://www.instagram.com/{$username}/";
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT => 8,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
    CURLOPT_HTTPHEADER => ['Accept-Language: pt-BR,pt;q=0.9,en;q=0.8'],
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
  ]);

  $body = (string) curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $error = curl_errno($ch);
  curl_close($ch);

  if ($error !== 0 || $code === 0) {
    return 'unknown';
  }

  if ($code === 404 || $code === 410) {
    return 'free';
  }

  if ($code >= 200 && $code < 300) {
    $decodedBody = html_entity_decode($body, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if (stripos($decodedBody, "@{$username}") !== false || stripos($decodedBody, "(@{$username})") !== false) {
      return 'used';
    }

    if (stripos($body, 'httpErrorPage') !== false || preg_match('/<title[^>]*>\s*Instagram\s*<\/title>/i', $body)) {
      return 'unknown';
    }

    return 'unknown';
  }

  return 'unknown';
}

function fetch_page(string $url): array {
  if (!function_exists('curl_init')) {
    return ['code' => 0, 'body' => '', 'error' => true];
  }

  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 4,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT => 8,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
    CURLOPT_HTTPHEADER => ['Accept-Language: pt-BR,pt;q=0.9,en;q=0.8'],
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
  ]);

  $body = (string) curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $error = curl_errno($ch) !== 0;
  curl_close($ch);

  return ['code' => $code, 'body' => $body, 'error' => $error];
}

function html_title(string $body): string {
  if (!preg_match('/<title[^>]*>(.*?)<\/title>/is', $body, $match)) {
    return '';
  }

  return trim(html_entity_decode(strip_tags($match[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
}

function tiktok_status(string $username): string {
  if (!function_exists('curl_init')) {
    return 'unknown';
  }

  $url = 'https://www.tiktok.com/oembed?url=' . rawurlencode("https://www.tiktok.com/@{$username}");
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 2,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT => 7,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; NEXOUser/1.0; +https://primusdf.com.br/user)',
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
  ]);

  curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $error = curl_errno($ch);
  curl_close($ch);

  if ($error !== 0 || $code === 0) {
    return 'unknown';
  }

  if ($code === 400 || $code === 404) {
    return 'free';
  }

  if ($code >= 200 && $code < 300) {
    return 'used';
  }

  return 'unknown';
}

function facebook_status(string $username): string {
  $page = fetch_page("https://www.facebook.com/{$username}");

  if ($page['error'] || $page['code'] === 0) {
    return 'unknown';
  }

  if ($page['code'] === 404 || $page['code'] === 410) {
    return 'free';
  }

  if ($page['code'] >= 200 && $page['code'] < 300) {
    $title = html_title($page['body']);
    if ($title !== '' && strcasecmp($title, 'Facebook') !== 0) {
      return 'used';
    }

    if (strcasecmp($title, 'Facebook') === 0) {
      return 'free';
    }
  }

  return 'unknown';
}

function kwai_status(string $username): string {
  $page = fetch_page("https://www.kwai.com/@{$username}");

  if ($page['error'] || $page['code'] === 0) {
    return 'unknown';
  }

  if ($page['code'] === 404 || $page['code'] === 410) {
    return 'free';
  }

  if ($page['code'] >= 200 && $page['code'] < 300) {
    $title = html_title($page['body']);
    if ($title !== '' && strcasecmp($title, 'Aqui Geral Brilha') !== 0 && strcasecmp($title, 'Kwai') !== 0) {
      return 'used';
    }

    if (strcasecmp($title, 'Aqui Geral Brilha') === 0 || strcasecmp($title, 'Kwai') === 0) {
      return 'free';
    }
  }

  return 'unknown';
}

function spotify_status(string $username): string {
  $page = fetch_page("https://open.spotify.com/user/{$username}");

  if ($page['error'] || $page['code'] === 0) {
    return 'unknown';
  }

  if ($page['code'] >= 200 && $page['code'] < 300) {
    $decodedBody = html_entity_decode($page['body'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if (stripos($decodedBody, $username) !== false) {
      return 'used';
    }
  }

  return 'unknown';
}

function pinterest_status(string $username): string {
  $page = fetch_page("https://www.pinterest.com/{$username}/");

  if ($page['error'] || $page['code'] === 0) {
    return 'unknown';
  }

  if ($page['code'] === 404 || $page['code'] === 410) {
    return 'free';
  }

  if ($page['code'] >= 200 && $page['code'] < 300) {
    $title = html_title($page['body']);
    $decodedBody = html_entity_decode($page['body'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if ($title !== '' && stripos($title, $username) !== false) {
      return 'used';
    }

    if (preg_match('/"username"\s*:\s*"' . preg_quote($username, '/') . '"/i', $decodedBody)) {
      return 'used';
    }
  }

  return 'unknown';
}

function profile_page_status(string $url, string $username): string {
  $page = fetch_page($url);

  if ($page['error'] || $page['code'] === 0) {
    return 'unknown';
  }

  if ($page['code'] === 404 || $page['code'] === 410) {
    return 'free';
  }

  if ($page['code'] >= 200 && $page['code'] < 300) {
    $decodedBody = html_entity_decode($page['body'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $notFoundSignals = [
      'not found',
      'page not found',
      'profile not found',
      'user not found',
      'this profile does not exist',
      'this page does not exist',
      '404',
      'não encontrado',
      'pagina não encontrada',
      'página não encontrada',
    ];

    foreach ($notFoundSignals as $signal) {
      if (stripos($decodedBody, $signal) !== false) {
        return 'free';
      }
    }

    if (stripos($decodedBody, $username) !== false) {
      return 'used';
    }
  }

  return 'unknown';
}

function x_status(string $username): string {
  if (!function_exists('curl_init')) {
    return 'unknown';
  }

  $url = 'https://publish.twitter.com/oembed?url=' . rawurlencode("https://x.com/{$username}");
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 2,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_TIMEOUT => 7,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; NEXOUser/1.0; +https://primusdf.com.br/user)',
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
  ]);

  curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $error = curl_errno($ch);
  curl_close($ch);

  if ($error !== 0 || $code === 0) {
    return 'unknown';
  }

  if ($code === 404) {
    return 'free';
  }

  if ($code >= 200 && $code < 300) {
    return 'used';
  }

  return 'unknown';
}

$results = array_map(function (array $platform): array {
  $verifiedStatus = $GLOBALS['verifiedProfiles'][$GLOBALS['username']][$platform['id']] ?? null;
  if ($verifiedStatus) {
    return [
      'id' => $platform['id'],
      'status' => $verifiedStatus,
      'url' => $platform['displayUrl'] ?? $platform['url'],
      'source' => 'verified',
    ];
  }

  if ($platform['type'] === 'domain') {
    $status = domain_status($platform['rdap']);
  } elseif ($platform['type'] === 'instagram') {
    $status = instagram_status($GLOBALS['username']);
  } elseif ($platform['type'] === 'x_oembed') {
    $status = x_status($GLOBALS['username']);
  } elseif ($platform['type'] === 'tiktok_oembed') {
    $status = tiktok_status($GLOBALS['username']);
  } elseif ($platform['type'] === 'facebook') {
    $status = facebook_status($GLOBALS['username']);
  } elseif ($platform['type'] === 'kwai') {
    $status = kwai_status($GLOBALS['username']);
  } elseif ($platform['type'] === 'spotify') {
    $status = spotify_status($GLOBALS['username']);
  } elseif ($platform['type'] === 'pinterest') {
    $status = pinterest_status($GLOBALS['username']);
  } elseif ($platform['type'] === 'profile_page') {
    $status = profile_page_status($platform['url'], $GLOBALS['username']);
  } else {
    $status = http_status($platform['url']);
  }

  return [
    'id' => $platform['id'],
    'status' => $status,
    'url' => $platform['displayUrl'] ?? $platform['url'],
  ];
}, $platforms);

echo json_encode([
  'username' => $username,
  'results' => $results,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
