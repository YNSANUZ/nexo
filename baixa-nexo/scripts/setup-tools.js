const fs = require("fs");
const path = require("path");
const https = require("https");
const os = require("os");
const { spawn } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const binDir = path.join(rootDir, "bin");
const force = process.argv.includes("--force");

function getAsset() {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === "win32") {
    return {
      fileName: "yt-dlp.exe",
      url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
    };
  }

  if (platform === "linux") {
    const asset = arch === "arm64" ? "yt-dlp_linux_aarch64" : "yt-dlp_linux";
    return {
      fileName: "yt-dlp",
      url: `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`
    };
  }

  if (platform === "darwin") {
    return {
      fileName: "yt-dlp",
      url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
    };
  }

  return {
    fileName: platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"
  };
}

function commandName(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

function quoteCmd(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    let commandToRun = command;
    let argsToRun = args;

    if (process.platform === "win32" && command.toLowerCase().endsWith(".cmd")) {
      commandToRun = process.env.ComSpec || "cmd.exe";
      argsToRun = ["/d", "/s", "/c", [command, ...args].map(quoteCmd).join(" ")];
    }

    const child = spawn(commandToRun, argsToRun, {
      windowsHide: true,
      stdio: "inherit",
      ...options
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}

function findInPath(binary) {
  const pathValue = process.env.Path || process.env.PATH || "";
  const extensions = process.platform === "win32" ? ["", ".exe", ".cmd", ".bat"] : [""];
  return pathValue.split(path.delimiter).some((dir) => {
    return extensions.some((ext) => fs.existsSync(path.join(dir, `${binary}${ext}`)));
  });
}

function download(url, targetPath, redirects = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        "User-Agent": "BaixaNEXO setup"
      }
    }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        if (!response.headers.location || redirects > 8) {
          reject(new Error("redirect_failed"));
          return;
        }
        const nextUrl = new URL(response.headers.location, url).toString();
        download(nextUrl, targetPath, redirects + 1).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`download_failed_${response.statusCode}`));
        return;
      }

      const tempPath = `${targetPath}.tmp`;
      const file = fs.createWriteStream(tempPath);
      response.pipe(file);
      file.on("finish", () => {
        file.close(() => {
          fs.renameSync(tempPath, targetPath);
          resolve();
        });
      });
      file.on("error", reject);
    });

    request.on("error", reject);
    request.setTimeout(120000, () => {
      request.destroy(new Error("download_timeout"));
    });
  });
}

async function main() {
  const asset = getAsset();
  fs.mkdirSync(binDir, { recursive: true });
  const targetPath = path.join(binDir, asset.fileName);

  if (!force && fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1024 * 1024) {
    console.log(`yt-dlp ja existe em ${targetPath}`);
    return;
  }

  console.log(`Baixando yt-dlp de ${asset.url}`);
  await download(asset.url, targetPath);

  if (process.platform !== "win32") {
    fs.chmodSync(targetPath, 0o755);
  }

  console.log(`yt-dlp pronto em ${targetPath}`);

  await prepareFfmpeg();
}

async function prepareFfmpeg() {
  const localName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const localPath = path.join(binDir, localName);

  if (process.env.FFMPEG_PATH || fs.existsSync(localPath) || findInPath("ffmpeg")) {
    console.log("FFmpeg ja esta disponivel.");
    return;
  }

  const tempDir = path.join(os.tmpdir(), `baixanexo-ffmpeg-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(path.join(tempDir, "package.json"), "{\"private\":true}\n");

  try {
    console.log("Preparando FFmpeg estatico em pasta temporaria...");
    await run(commandName("npm"), [
      "install",
      "ffmpeg-static@5.3.0",
      "--no-audit",
      "--no-fund",
      "--loglevel=error"
    ], { cwd: tempDir });

    const modulePath = path.join(tempDir, "node_modules", "ffmpeg-static", "index.js");
    const ffmpegSource = require(modulePath);
    if (!ffmpegSource || !fs.existsSync(ffmpegSource)) {
      throw new Error("ffmpeg-static nao retornou um binario valido");
    }

    fs.copyFileSync(ffmpegSource, localPath);
    if (process.platform !== "win32") fs.chmodSync(localPath, 0o755);
    console.log(`FFmpeg pronto em ${localPath}`);
  } catch (error) {
    console.warn(`FFmpeg nao foi instalado automaticamente: ${error.message}`);
    console.warn("O app ainda analisa e baixa formatos diretos; MP3/mesclagem exigem FFmpeg.");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`Falha ao preparar yt-dlp: ${error.message}`);
  process.exitCode = 1;
});
