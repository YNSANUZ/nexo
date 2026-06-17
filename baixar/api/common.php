<?php
declare(strict_types=1);

const BAIXANEXO_MAX_OUTPUT = 31457280;

if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool
    {
        return $needle === '' || strpos($haystack, $needle) === 0;
    }
}

if (!function_exists('str_ends_with')) {
    function str_ends_with(string $haystack, string $needle): bool
    {
        if ($needle === '') return true;
        return substr($haystack, -strlen($needle)) === $needle;
    }
}

if (!function_exists('str_contains')) {
    function str_contains(string $haystack, string $needle): bool
    {
        return $needle === '' || strpos($haystack, $needle) !== false;
    }
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 81920) {
        json_response(['ok' => false, 'error' => 'Requisicao muito grande.'], 413);
    }

    $body = json_decode($raw, true);
    return is_array($body) ? $body : [];
}

function root_dir(): string
{
    return dirname(__DIR__);
}

function local_binary(string $name): ?string
{
    $root = root_dir();
    $candidates = PHP_OS_FAMILY === 'Windows'
        ? ["$root/bin/$name.exe", "$root/bin/$name", $name]
        : ["$root/bin/$name", $name];

    foreach ($candidates as $candidate) {
        if ($candidate === $name || is_file($candidate)) {
            return $candidate;
        }
    }

    return null;
}

function ensure_executable(?string $path): ?string
{
    if (!$path || $path === basename($path)) {
        return $path;
    }

    if (is_file($path) && !is_executable($path)) {
        @chmod($path, 0755);
    }

    return $path;
}

function ytdlp_path(): ?string
{
    return ensure_executable(getenv('YTDLP_PATH') ?: local_binary('yt-dlp'));
}

function ffmpeg_path(): ?string
{
    return ensure_executable(getenv('FFMPEG_PATH') ?: local_binary('ffmpeg'));
}

function process_tmp_dir(): string
{
    $dir = root_dir() . '/tmp';
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
    return is_dir($dir) ? $dir : sys_get_temp_dir();
}

function command_available(?string $command): bool
{
    if (!$command) return false;
    if ($command !== basename($command)) return is_file($command) && is_executable($command);
    return true;
}

function with_process_tmp_env(callable $callback)
{
    $tmp = process_tmp_dir();
    $names = ['TMPDIR', 'TMP', 'TEMP', 'PYTHON_EGG_CACHE'];
    $previous = [];
    foreach ($names as $name) {
        $value = getenv($name);
        $previous[$name] = $value === false ? null : $value;
        putenv("$name=$tmp");
    }

    try {
        return $callback();
    } finally {
        foreach ($previous as $name => $value) {
            if ($value === null) {
                putenv($name);
            } else {
                putenv("$name=$value");
            }
        }
    }
}

function run_command(array $args, int $timeout = 60): array
{
    $descriptor = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $command = implode(' ', array_map('escapeshellarg', $args));
    $pipes = [];
    $process = with_process_tmp_env(function () use ($command, $descriptor, &$pipes) {
        return proc_open($command, $descriptor, $pipes, root_dir());
    });

    if (!is_resource($process)) {
        throw new RuntimeException('Nao foi possivel iniciar o processo de extracao.');
    }

    fclose($pipes[0]);
    stream_set_blocking($pipes[1], false);
    stream_set_blocking($pipes[2], false);

    $stdout = '';
    $stderr = '';
    $started = time();

    while (true) {
        $status = proc_get_status($process);
        $stdout .= stream_get_contents($pipes[1]);
        $stderr .= stream_get_contents($pipes[2]);

        if (strlen($stdout) > BAIXANEXO_MAX_OUTPUT || strlen($stderr) > BAIXANEXO_MAX_OUTPUT) {
            proc_terminate($process, 9);
            throw new RuntimeException('A resposta da extracao ficou grande demais.');
        }

        if (!$status['running']) break;

        if ((time() - $started) > $timeout) {
            proc_terminate($process, 9);
            throw new RuntimeException('Tempo esgotado ao analisar este link.');
        }

        usleep(100000);
    }

    $stdout .= stream_get_contents($pipes[1]);
    $stderr .= stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $exitCode = proc_close($process);

    if ($exitCode !== 0) {
        $message = trim(preg_replace('/\s+/', ' ', $stderr ?: $stdout ?: 'yt-dlp falhou.'));
        throw new RuntimeException(substr($message, 0, 900));
    }

    return ['stdout' => $stdout, 'stderr' => $stderr];
}

function command_probe(?string $command, array $args = [], int $timeout = 15): array
{
    if (!command_available($command)) {
        return ['ok' => false, 'error' => 'Comando indisponivel.'];
    }

    try {
        $result = run_command(array_merge([(string) $command], $args), $timeout);
        $output = trim(preg_replace('/\s+/', ' ', $result['stdout'] ?: $result['stderr']));
        return ['ok' => true, 'output' => substr($output, 0, 300)];
    } catch (Throwable $error) {
        return ['ok' => false, 'error' => substr($error->getMessage(), 0, 500)];
    }
}

function is_private_ip(string $ip): bool
{
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $long = ip2long($ip);
        $ranges = [
            ['0.0.0.0', '0.255.255.255'],
            ['10.0.0.0', '10.255.255.255'],
            ['127.0.0.0', '127.255.255.255'],
            ['169.254.0.0', '169.254.255.255'],
            ['172.16.0.0', '172.31.255.255'],
            ['192.168.0.0', '192.168.255.255'],
        ];
        foreach ($ranges as [$start, $end]) {
            if ($long >= ip2long($start) && $long <= ip2long($end)) return true;
        }
        return false;
    }

    return str_starts_with($ip, '::1') || str_starts_with(strtolower($ip), 'fc') || str_starts_with(strtolower($ip), 'fd') || str_starts_with(strtolower($ip), 'fe80');
}

function validate_public_url(string $value): string
{
    $url = trim($value);
    if (strlen($url) < 8 || strlen($url) > 4096) {
        throw new InvalidArgumentException('Cole um link valido.');
    }

    $parts = parse_url($url);
    if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
        throw new InvalidArgumentException('Cole um link completo, com http ou https.');
    }

    $scheme = strtolower($parts['scheme']);
    if (!in_array($scheme, ['http', 'https'], true)) {
        throw new InvalidArgumentException('Use apenas links http ou https.');
    }

    if (!empty($parts['user']) || !empty($parts['pass'])) {
        throw new InvalidArgumentException('Este link nao pode ser analisado.');
    }

    $host = strtolower($parts['host']);
    if ($host === 'localhost' || str_ends_with($host, '.localhost') || str_ends_with($host, '.local') || is_private_ip($host)) {
        throw new InvalidArgumentException('Este host nao pode ser analisado.');
    }

    $records = gethostbynamel($host) ?: [];
    foreach ($records as $ip) {
        if (is_private_ip($ip)) {
            throw new InvalidArgumentException('Este host resolve para uma rede privada.');
        }
    }

    return $url;
}

function detect_source(string $url): array
{
    $parts = parse_url($url);
    $host = strtolower(preg_replace('/^www\./', '', $parts['host'] ?? ''));
    $path = strtolower($parts['path'] ?? '');

    if ($host === 'youtu.be' || str_ends_with($host, 'youtube.com') || str_ends_with($host, 'youtube-nocookie.com')) {
        if (str_starts_with($path, '/shorts/')) return ['source' => 'YouTube', 'kind' => 'Shorts', 'accent' => '#ff3158'];
        if (str_starts_with($path, '/live/')) return ['source' => 'YouTube', 'kind' => 'Live', 'accent' => '#ff3158'];
        return ['source' => 'YouTube', 'kind' => 'Video YouTube', 'accent' => '#ff3158'];
    }

    if (str_ends_with($host, 'instagram.com')) {
        if (str_contains($path, '/reel/') || str_contains($path, '/reels/')) return ['source' => 'Instagram', 'kind' => 'Reels', 'accent' => '#ff3d8f'];
        if (str_contains($path, '/stories/highlights/')) return ['source' => 'Instagram', 'kind' => 'Destaque', 'accent' => '#ff3d8f'];
        if (str_contains($path, '/stories/')) return ['source' => 'Instagram', 'kind' => 'Story', 'accent' => '#ff3d8f'];
        if (str_contains($path, '/p/')) return ['source' => 'Instagram', 'kind' => 'Foto ou video', 'accent' => '#ff3d8f'];
        return ['source' => 'Instagram', 'kind' => 'Instagram', 'accent' => '#ff3d8f'];
    }

    if (str_ends_with($host, 'tiktok.com') || str_ends_with($host, 'tiktokv.com')) return ['source' => 'TikTok', 'kind' => 'TikTok', 'accent' => '#10e0d7'];
    if (str_ends_with($host, 'x.com') || str_ends_with($host, 'twitter.com')) return ['source' => 'X/Twitter', 'kind' => 'Video social', 'accent' => '#ffffff'];
    if (str_ends_with($host, 'facebook.com') || str_ends_with($host, 'fb.watch')) return ['source' => 'Facebook', 'kind' => 'Video social', 'accent' => '#78a8ff'];
    if (str_ends_with($host, 'vimeo.com')) return ['source' => 'Vimeo', 'kind' => 'Video externo', 'accent' => '#55c6ff'];
    if (str_ends_with($host, 'dailymotion.com') || str_ends_with($host, 'dai.ly')) return ['source' => 'Dailymotion', 'kind' => 'Video externo', 'accent' => '#7bd1ff'];

    return ['source' => $host, 'kind' => 'Site externo', 'accent' => '#54f2c7'];
}

function seconds_to_label($seconds): ?string
{
    $seconds = (int) round((float) $seconds);
    if ($seconds <= 0) return null;
    $hours = intdiv($seconds, 3600);
    $minutes = intdiv($seconds % 3600, 60);
    $secs = $seconds % 60;
    return $hours > 0
        ? sprintf('%d:%02d:%02d', $hours, $minutes, $secs)
        : sprintf('%d:%02d', $minutes, $secs);
}

function bytes_to_label($bytes): ?string
{
    $bytes = (float) $bytes;
    if ($bytes <= 0) return null;
    $units = ['B', 'KB', 'MB', 'GB'];
    $index = 0;
    while ($bytes >= 1024 && $index < count($units) - 1) {
        $bytes /= 1024;
        $index++;
    }
    return ($bytes >= 10 || $index === 0 ? number_format($bytes, 0) : number_format($bytes, 1)) . ' ' . $units[$index];
}

function safe_text($value, string $fallback = ''): string
{
    $text = trim(preg_replace('/\s+/', ' ', (string) ($value ?? '')));
    return $text !== '' ? $text : $fallback;
}

function is_http_url($value): bool
{
    $parts = parse_url((string) $value);
    return $parts && !empty($parts['scheme']) && in_array(strtolower($parts['scheme']), ['http', 'https'], true);
}

function ext_from_url($value): string
{
    $path = parse_url((string) $value, PHP_URL_PATH) ?: '';
    return strtolower(pathinfo($path, PATHINFO_EXTENSION));
}

function media_flags(array $format, string $ext): array
{
    $videoExts = ['mp4', 'webm', 'mov', 'mkv', 'm4v'];
    $audioExts = ['mp3', 'm4a', 'aac', 'opus', 'ogg', 'wav', 'flac'];
    $imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $hasVideo = !empty($format['vcodec']) && $format['vcodec'] !== 'none';
    $hasAudio = !empty($format['acodec']) && $format['acodec'] !== 'none';
    $hasImage = in_array($ext, $imageExts, true);

    if (!$hasVideo && !$hasAudio && !$hasImage) {
        if (in_array($ext, $videoExts, true)) {
            $hasVideo = true;
            $hasAudio = true;
        } elseif (in_array($ext, $audioExts, true)) {
            $hasAudio = true;
        }
    }

    return ['hasVideo' => $hasVideo, 'hasAudio' => $hasAudio, 'hasImage' => $hasImage];
}

function format_type(array $format, string $ext): string
{
    $flags = media_flags($format, $ext);
    if ($flags['hasVideo'] && $flags['hasAudio']) return 'video';
    if ($flags['hasVideo']) return 'video_only';
    if ($flags['hasAudio']) return 'audio';
    if ($flags['hasImage']) return 'image';
    return 'file';
}

function format_quality(array $format): string
{
    if (!empty($format['format_note']) && !preg_match('/storyboard/i', (string) $format['format_note'])) return safe_text($format['format_note']);
    if (!empty($format['resolution']) && $format['resolution'] !== 'audio only') return safe_text($format['resolution']);
    if (!empty($format['height'])) return (string) $format['height'] . 'p' . (!empty($format['fps']) ? ' ' . $format['fps'] . 'fps' : '');
    if (!empty($format['abr'])) return round((float) $format['abr']) . ' kbps';
    if (!empty($format['tbr'])) return round((float) $format['tbr']) . ' kbps';
    return 'Original';
}

function encoded_url(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function pick_thumbnail(array $item): ?string
{
    $thumbs = $item['thumbnails'] ?? [];
    if (is_array($thumbs) && count($thumbs) > 0) {
        usort($thumbs, function ($a, $b) {
            return (($b['width'] ?? 0) * ($b['height'] ?? 0)) <=> (($a['width'] ?? 0) * ($a['height'] ?? 0));
        });
        foreach ($thumbs as $thumb) {
            if (!empty($thumb['url'])) return $thumb['url'];
        }
    }
    return $item['thumbnail'] ?? null;
}

function normalize_formats(array $item, string $inputUrl, int $playlistIndex): array
{
    $raw = is_array($item['formats'] ?? null) ? $item['formats'] : [];
    $directCandidate = $item['url'] ?? $item['webpage_url'] ?? $inputUrl;
    $directExt = ext_from_url((string) $directCandidate);
    $known = ['mp4', 'webm', 'mov', 'mkv', 'm4v', 'mp3', 'm4a', 'aac', 'opus', 'ogg', 'wav', 'flac', 'jpg', 'jpeg', 'png', 'webp', 'gif'];

    if (!$raw && is_http_url($directCandidate) && in_array($directExt, $known, true)) {
        $raw = [[
            'format_id' => $directExt,
            'ext' => $directExt,
            'url' => $directCandidate,
            'isDirectFallback' => true,
        ]];
    }

    $seen = [];
    $formats = [];
    foreach ($raw as $format) {
        if (!is_array($format) || empty($format['format_id'])) continue;
        $descriptor = (string) (($format['format_note'] ?? '') . ' ' . ($format['format'] ?? ''));
        if (preg_match('/storyboard|images/i', $descriptor)) continue;

        $ext = strtolower(safe_text($format['ext'] ?? 'file'));
        $type = format_type($format, $ext);
        $flags = media_flags($format, $ext);
        $size = (float) ($format['filesize'] ?? $format['filesize_approx'] ?? 0);
        $label = format_quality($format);
        $directUrl = is_http_url($format['url'] ?? null) ? $format['url'] : null;
        $key = implode('|', [$type, $ext, $label, $format['height'] ?? '', $format['width'] ?? '', $format['abr'] ?? '', $size ?: '']);
        if (isset($seen[$key])) continue;
        $seen[$key] = true;

        $downloadInputUrl = !empty($format['isDirectFallback']) ? (string) $directUrl : $inputUrl;
        $params = http_build_query([
            'u' => encoded_url($downloadInputUrl),
            'formatId' => !empty($format['isDirectFallback']) ? '' : (string) $format['format_id'],
            'mode' => !empty($format['isDirectFallback']) ? 'direct' : ($type === 'audio' ? 'audio-original' : 'video'),
            'playlistIndex' => !empty($format['isDirectFallback']) ? '0' : (string) $playlistIndex,
        ]);

        $formats[] = [
            'id' => (string) $format['format_id'],
            'label' => $label,
            'ext' => $ext,
            'type' => $type,
            'height' => !empty($format['height']) ? (int) $format['height'] : null,
            'fps' => !empty($format['fps']) ? (float) $format['fps'] : null,
            'hasAudio' => $flags['hasAudio'],
            'hasVideo' => $flags['hasVideo'],
            'size' => $size ?: null,
            'sizeLabel' => bytes_to_label($size),
            'directUrl' => $directUrl,
            'downloadUrl' => '/api/download?' . $params,
        ];
    }

    $rank = ['video' => 0, 'image' => 1, 'video_only' => 2, 'audio' => 3, 'file' => 4];
    usort($formats, function ($a, $b) use ($rank) {
        $ra = $rank[$a['type']] ?? 9;
        $rb = $rank[$b['type']] ?? 9;
        if ($ra !== $rb) return $ra <=> $rb;
        return ((int) ($b['height'] ?? 0) <=> (int) ($a['height'] ?? 0)) ?: ((float) ($b['size'] ?? 0) <=> (float) ($a['size'] ?? 0));
    });

    return array_slice($formats, 0, 18);
}

function choose_preview(array $formats): ?array
{
    $playable = array_values(array_filter($formats, function ($format) {
        return !empty($format['directUrl']) && $format['type'] === 'video' && in_array($format['ext'], ['mp4', 'webm', 'mov'], true);
    }));
    usort($playable, function ($a, $b) {
        return ((int) ($b['height'] ?? 0)) <=> ((int) ($a['height'] ?? 0));
    });
    foreach ($playable as $format) {
        if ($format['ext'] === 'mp4') return $format;
    }
    if ($playable) return $playable[0];
    foreach ($formats as $format) {
        if (!empty($format['directUrl']) && $format['type'] === 'image') return $format;
    }
    return null;
}

function normalize_item(array $item, string $inputUrl, array $classifier, int $index): array
{
    $playlistIndex = (int) ($item['playlist_index'] ?? ($index + 1));
    $formats = normalize_formats($item, $inputUrl, $playlistIndex);
    $previewFormat = choose_preview($formats);
    $thumbnail = pick_thumbnail($item);
    $title = safe_text($item['title'] ?? $item['fulltitle'] ?? $item['alt_title'] ?? null, $classifier['kind']);
    $isImagePrimary = ($previewFormat['type'] ?? '') === 'image';
    $primaryDownloadInput = $isImagePrimary ? (string) $previewFormat['directUrl'] : $inputUrl;

    return [
        'index' => $index,
        'playlistIndex' => $playlistIndex,
        'id' => safe_text($item['id'] ?? null, (string) ($index + 1)),
        'title' => $title,
        'source' => $classifier['source'],
        'kind' => $classifier['kind'],
        'accent' => $classifier['accent'],
        'uploader' => safe_text($item['uploader'] ?? $item['channel'] ?? $item['creator'] ?? ''),
        'duration' => !empty($item['duration']) ? (float) $item['duration'] : null,
        'durationLabel' => seconds_to_label($item['duration'] ?? 0),
        'webpageUrl' => $item['webpage_url'] ?? $inputUrl,
        'thumbnail' => $thumbnail,
        'preview' => $previewFormat ? [
            'type' => $isImagePrimary ? 'image' : 'video',
            'url' => $previewFormat['directUrl'],
            'label' => $previewFormat['label'],
            'ext' => $previewFormat['ext'],
        ] : ($thumbnail ? ['type' => 'image', 'url' => $thumbnail, 'label' => 'Imagem', 'ext' => 'jpg'] : null),
        'formats' => $formats,
        'primaryDownloadLabel' => $isImagePrimary ? 'Imagem' : 'MP4 melhor',
        'bestVideoDownloadUrl' => '/api/download?' . http_build_query([
            'u' => encoded_url($primaryDownloadInput),
            'mode' => $isImagePrimary ? 'direct' : 'video',
            'playlistIndex' => $isImagePrimary ? '0' : (string) $playlistIndex,
        ]),
        'mp3DownloadUrl' => '/api/download?' . http_build_query([
            'u' => encoded_url($inputUrl),
            'mode' => 'audio',
            'playlistIndex' => (string) $playlistIndex,
        ]),
    ];
}

function normalize_info(array $info, string $inputUrl, array $classifier): array
{
    $rawEntries = !empty($info['entries']) && is_array($info['entries']) ? $info['entries'] : [$info];
    $items = [];
    foreach (array_slice($rawEntries, 0, 20) as $index => $entry) {
        if (is_array($entry)) $items[] = normalize_item($entry, $inputUrl, $classifier, $index);
    }
    if (!$items) $items[] = normalize_item($info, $inputUrl, $classifier, 0);
    $first = $items[0];

    return [
        'ok' => true,
        'source' => $classifier['source'],
        'kind' => $classifier['kind'],
        'accent' => $classifier['accent'],
        'title' => $first['title'],
        'uploader' => $first['uploader'],
        'duration' => $first['duration'],
        'durationLabel' => $first['durationLabel'],
        'thumbnail' => $first['thumbnail'],
        'webpageUrl' => $info['webpage_url'] ?? $inputUrl,
        'items' => $items,
    ];
}

function base_ytdlp_args(string $url): array
{
    $ytdlp = ytdlp_path();
    if (!command_available($ytdlp)) {
        throw new RuntimeException('yt-dlp nao esta disponivel no servidor.');
    }

    $args = [
        $ytdlp,
        '--dump-single-json',
        '--no-warnings',
        '--no-playlist',
        '--skip-download',
        '--socket-timeout', '20',
        '--no-check-certificates',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
    ];

    $ffmpeg = ffmpeg_path();
    if (command_available($ffmpeg)) {
        $args[] = '--ffmpeg-location';
        $args[] = $ffmpeg;
    }

    $args[] = $url;
    return $args;
}

function decode_url_param(?string $value): string
{
    $value = (string) $value;
    $padding = strlen($value) % 4;
    if ($padding) $value .= str_repeat('=', 4 - $padding);
    return (string) base64_decode(strtr($value, '-_', '+/'), true);
}

function content_type_for(string $file): string
{
    switch (strtolower(pathinfo($file, PATHINFO_EXTENSION))) {
        case 'mp4':
            return 'video/mp4';
        case 'webm':
            return 'video/webm';
        case 'mov':
            return 'video/quicktime';
        case 'm4a':
            return 'audio/mp4';
        case 'mp3':
            return 'audio/mpeg';
        case 'aac':
            return 'audio/aac';
        case 'opus':
            return 'audio/opus';
        case 'ogg':
            return 'audio/ogg';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        default:
            return 'application/octet-stream';
    }
}

function safe_file_name(string $value, string $fallback = 'baixanexo'): string
{
    $ascii = function_exists('iconv') ? @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) : false;
    $clean = preg_replace('/[^\w.\- ]+/', '', $ascii !== false ? $ascii : $value);
    $clean = trim(preg_replace('/\s+/', '_', (string) $clean));
    return $clean !== '' ? substr($clean, 0, 120) : $fallback;
}
