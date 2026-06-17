<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$ytdlp = ytdlp_path();
$ffmpeg = ffmpeg_path();

json_response([
    'ok' => true,
    'php' => PHP_VERSION,
    'exec' => function_exists('proc_open'),
    'ytdlp' => $ytdlp,
    'ytdlpReady' => command_available($ytdlp),
    'ffmpeg' => $ffmpeg,
    'ffmpegReady' => command_available($ffmpeg),
]);
