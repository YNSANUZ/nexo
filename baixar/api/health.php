<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$ytdlp = ytdlp_path();
$ffmpeg = ffmpeg_path();

json_response([
    'ok' => true,
    'php' => PHP_VERSION,
    'exec' => function_exists('proc_open'),
    'tmp' => process_tmp_dir(),
    'tmpWritable' => is_writable(process_tmp_dir()),
    'youtubeClients' => BAIXANEXO_YOUTUBE_CLIENTS,
    'ytdlp' => $ytdlp,
    'ytdlpReady' => command_available($ytdlp),
    'ytdlpProbe' => command_probe($ytdlp, ['--version']),
    'ffmpeg' => $ffmpeg,
    'ffmpegReady' => command_available($ffmpeg),
    'ffmpegProbe' => command_probe($ffmpeg, ['-version']),
]);
