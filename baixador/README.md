# BaixaNEXO

Aplicacao limpa para analisar links publicos de video, audio e imagem, detectar a origem e oferecer opcoes de download sem depender de endpoints privados de terceiros.

## Rodar localmente

```bash
npm install
npm start
```

Depois abra:

```text
http://localhost:3100
```

O instalador baixa o binario do `yt-dlp` para `bin/` e usa `ffmpeg-static` para conversao/mesclagem quando necessario.
Se o FFmpeg nao existir no sistema, o setup tenta buscar um binario estatico e copia para `bin/`.

## Variaveis uteis

```bash
PORT=3100
YTDLP_PATH=C:\caminho\para\yt-dlp.exe
FFMPEG_PATH=C:\caminho\para\ffmpeg.exe
BAIXANEXO_MAX_FILESIZE=1024M
BAIXANEXO_YTDLP_TIMEOUT_MS=60000
BAIXANEXO_DOWNLOAD_TIMEOUT_MS=240000
```

Use apenas links publicos e conteudos que voce tem direito de baixar. O app nao baixa DRM ou conteudo privado; cookies opcionais podem ser usados no servidor apenas para liberar links publicos bloqueados por verificacao anti-bot.
