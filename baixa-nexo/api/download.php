<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

function rrmdir(string $dir): void
{
    if (!is_dir($dir)) return;
    foreach (scandir($dir) ?: [] as $file) {
        if ($file === '.' || $file === '..') continue;
        $path = "$dir/$file";
        is_dir($path) ? rrmdir($path) : @unlink($path);
    }
    @rmdir($dir);
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        json_response(['ok' => false, 'error' => 'Metodo nao permitido.'], 405);
    }

    if (isset($_GET['vidsave'])) {
        $targetUrl = vidsave_prepare_download(decode_url_param($_GET['vidsave']));
        header('Location: ' . $targetUrl, true, 302);
        header('Cache-Control: no-store');
        exit;
    }

    $url = validate_public_url(decode_url_param($_GET['u'] ?? ''));
    set_youtube_clients_override($_GET['yc'] ?? null);
    $mode = (string) ($_GET['mode'] ?? 'video');
    $formatId = trim((string) ($_GET['formatId'] ?? ''));
    $playlistIndex = (int) ($_GET['playlistIndex'] ?? 0);
    $ytdlp = ytdlp_path();
    if (!command_available($ytdlp)) {
        throw new RuntimeException('yt-dlp nao esta disponivel no servidor.');
    }

    $jobDir = sys_get_temp_dir() . '/baixanexo-' . bin2hex(random_bytes(8));
    if (!mkdir($jobDir, 0775, true) && !is_dir($jobDir)) {
        throw new RuntimeException('Nao foi possivel criar pasta temporaria.');
    }

    $outputTemplate = $jobDir . '/%(title).120s-%(id)s.%(ext)s';
    $args = [$ytdlp];
    $ffmpeg = ffmpeg_path();
    $hasFfmpeg = command_available($ffmpeg);

    if ($mode === 'direct') {
        // Sem seletor: baixa o arquivo apontado pelo link final.
    } elseif ($mode === 'audio') {
        if (!$hasFfmpeg) throw new RuntimeException('FFmpeg nao esta disponivel para gerar MP3.');
        array_push($args, '-f', 'bestaudio/best', '--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0');
    } elseif ($mode === 'audio-original') {
        array_push($args, '-f', $formatId !== '' ? $formatId : 'bestaudio/best');
    } elseif ($formatId !== '') {
        array_push($args, '-f', $formatId);
        if ($hasFfmpeg) array_push($args, '--merge-output-format', 'mp4');
    } else {
        if ($hasFfmpeg) {
            array_push($args, '-f', 'bv*+ba/best', '--merge-output-format', 'mp4');
        } else {
            array_push($args, '-f', 'best[ext=mp4]/best');
        }
    }

    array_push(
        $args,
        '--no-warnings',
        '--no-check-certificates',
        '--restrict-filenames',
        '--windows-filenames',
        '--no-mtime',
        '--max-filesize',
        getenv('BAIXANEXO_MAX_FILESIZE') ?: '1024M',
        '--socket-timeout',
        '20'
    );

    foreach (youtube_extractor_args() as $arg) {
        $args[] = $arg;
    }

    foreach (impersonate_args_for_url($url) as $arg) {
        $args[] = $arg;
    }

    foreach (cookie_args_for_url($url) as $arg) {
        $args[] = $arg;
    }

    array_push(
        $args,
        '--user-agent',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36'
    );

    if ($hasFfmpeg) array_push($args, '--ffmpeg-location', (string) $ffmpeg);
    array_push($args, '-o', $outputTemplate);
    if ($playlistIndex > 0) {
        array_push($args, '--playlist-items', (string) $playlistIndex);
    } else {
        $args[] = '--no-playlist';
    }
    $args[] = $url;

    try {
        run_command($args, 300);
    } catch (Throwable $error) {
        if (!is_impersonate_error($error)) throw $error;
        $args = array_values(array_filter($args, function ($arg, $index) use ($args) {
            return $arg !== '--impersonate' && ($index === 0 || $args[$index - 1] !== '--impersonate');
        }, ARRAY_FILTER_USE_BOTH));
        run_command($args, 300);
    }

    $files = array_values(array_filter(glob($jobDir . '/*') ?: [], function ($file) {
        return is_file($file) && !str_ends_with($file, '.part');
    }));
    usort($files, function ($a, $b) {
        return filesize($b) <=> filesize($a);
    });
    if (!$files) throw new RuntimeException('Nenhum arquivo foi gerado.');

    $file = $files[0];
    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $name = safe_file_name(pathinfo($file, PATHINFO_FILENAME)) . ($extension ? ".$extension" : '');

    header('Content-Type: ' . content_type_for($file));
    header('Content-Length: ' . filesize($file));
    header('Content-Disposition: attachment; filename="' . addslashes($name) . '"');
    header('Cache-Control: no-store');
    readfile($file);
    rrmdir($jobDir);
} catch (Throwable $error) {
    if (isset($jobDir)) rrmdir($jobDir);
    json_response(['ok' => false, 'error' => $error->getMessage()], 400);
}
