<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_response(['ok' => false, 'error' => 'Metodo nao permitido.'], 405);
    }

    $body = read_json_body();
    set_youtube_clients_override($body['youtubeClients'] ?? null);
    $url = validate_public_url((string) ($body['url'] ?? ''));
    $classifier = detect_source($url);
    try {
        $result = run_command(base_ytdlp_args($url), 70);
    } catch (Throwable $error) {
        try {
            if (!is_impersonate_error($error)) throw $error;
            $result = run_command(base_ytdlp_args($url, false), 70);
        } catch (Throwable $extractError) {
            if (is_youtube_url($url)) {
                try {
                    json_response(vidsave_analyze($url, $classifier));
                } catch (Throwable $fallbackError) {
                    // Mantem a mensagem original do yt-dlp quando o fallback externo tambem falha.
                }
            }
            throw $extractError;
        }
    }
    $info = json_decode($result['stdout'], true);

    if (!is_array($info)) {
        throw new RuntimeException('Resposta invalida do extrator.');
    }

    json_response(normalize_info($info, $url, $classifier));
} catch (Throwable $error) {
    $message = $error->getMessage();
    if (str_contains($message, 'Unsupported URL')) {
        $message = 'Ainda nao consegui extrair midia desse link.';
    } elseif (str_contains($message, 'Sign in to confirm') || str_contains($message, '--cookies')) {
        $message = 'YouTube bloqueou o IP do servidor. O suporte a cookies ja esta pronto; coloque cookies/youtube.txt no servidor para liberar esses links.';
    } elseif (str_contains($message, '[TikTok]') && str_contains($message, 'Unexpected response')) {
        $message = 'TikTok bloqueou a resposta para este IP. O suporte a cookies ja esta pronto; coloque cookies/tiktok.txt no servidor ou tente novamente mais tarde.';
    }
    json_response(['ok' => false, 'error' => $message], 400);
}
