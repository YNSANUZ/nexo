<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_response(['ok' => false, 'error' => 'Metodo nao permitido.'], 405);
    }

    $body = read_json_body();
    $url = validate_public_url((string) ($body['url'] ?? ''));
    $classifier = detect_source($url);
    $result = run_command(base_ytdlp_args($url), 70);
    $info = json_decode($result['stdout'], true);

    if (!is_array($info)) {
        throw new RuntimeException('Resposta invalida do extrator.');
    }

    json_response(normalize_info($info, $url, $classifier));
} catch (Throwable $error) {
    $message = $error->getMessage();
    if (str_contains($message, 'Unsupported URL')) {
        $message = 'Ainda nao consegui extrair midia desse link.';
    }
    json_response(['ok' => false, 'error' => $message], 400);
}
