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
    if (instagram_story_profile_username($url) !== null) {
        json_response(vidsave_instagram_profile_stories($url, $classifier));
    }
    if (is_tiktok_url($url)) {
        try {
            // TikTok costuma entregar URLs CDN temporarias pelo yt-dlp. O fluxo
            // preparado evita os 403 e os resultados somente de audio.
            json_response(vidsave_analyze($url, $classifier));
        } catch (Throwable $preferredTikTokError) {
            // Mantem o yt-dlp como segunda fonte quando o preparador estiver indisponivel.
        }
    }
    try {
        $result = run_command(base_ytdlp_args($url), 70);
    } catch (Throwable $error) {
        try {
            if (!is_impersonate_error($error)) throw $error;
            $result = run_command(base_ytdlp_args($url, false), 70);
        } catch (Throwable $extractError) {
            if (vidsave_supported_url($url)) {
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

    $normalized = normalize_info($info, $url, $classifier);
    if (!normalized_has_downloads($normalized) && vidsave_supported_url($url)) {
        try {
            json_response(vidsave_analyze($url, $classifier));
        } catch (Throwable $fallbackError) {
            // Se o fallback nao liberar nada, conserva a resposta original do extrator principal.
        }
    }

    json_response($normalized);
} catch (Throwable $error) {
    $message = $error->getMessage();
    $source = $classifier['source'] ?? '';
    if (str_contains($message, 'Unsupported URL')) {
        $message = 'Ainda nao consegui extrair midia desse link.';
    } elseif ($source === 'Instagram' && (str_contains($message, 'log in') || str_contains($message, 'login') || str_contains($message, '--cookies'))) {
        $message = 'O Instagram nao liberou esse conteudo. Se for um Story, confirme que o link ainda esta ativo; Stories expiram em 24 horas.';
    } elseif ($source === 'YouTube' && (str_contains($message, 'Sign in to confirm') || str_contains($message, '--cookies'))) {
        $message = 'YouTube bloqueou o IP do servidor. O suporte a cookies ja esta pronto; coloque cookies/youtube.txt no servidor para liberar esses links.';
    } elseif ($source === 'TikTok' && (str_contains($message, 'Your IP address is blocked') || str_contains($message, 'Unexpected response') || str_contains($message, '--cookies'))) {
        $message = 'O TikTok nao liberou esse video. Confirme que o link ainda esta publico ou tente novamente mais tarde.';
    }
    json_response(['ok' => false, 'error' => $message], 400);
}
