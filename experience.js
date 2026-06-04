const canvas = document.getElementById("world");
const networkCanvas = document.getElementById("network");
const sound = document.getElementById("sound");
const phoneFrame = document.querySelector(".phone-shell iframe");
const questItems = [...document.querySelectorAll(".quest-trail li")];
const questCount = document.getElementById("quest-count");
const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
const networkNodes = [];
let networkContext;
let networkWidth = 0;
let networkHeight = 0;
let audioContext;
let music;
let soundWanted = true;
let activeSound = true;
let soundManuallyChanged = false;
let currentQuest = "inicio";
let THREE;
let renderer;
let scene;
let camera;
let rig;
let cube;
let particles;
let webglReady = false;
let lastNetworkDraw = 0;

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.addEventListener("load", () => {
  if (!window.location.hash) window.scrollTo(0, 0);
});

const musicTrack = "assets/paulyudin-technology-tech-technology-484304.mp3";
const musicVolume = 0.035;
const pingVolume = 0.055;
const renderPixelRatio = Math.min(window.devicePixelRatio || 1, 1.35);
const isCompact = window.matchMedia("(max-width: 920px)");

async function setupWorld() {
  if (!canvas || isCompact.matches) {
    if (canvas) canvas.style.display = "none";
    return;
  }

  try {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js");
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(renderPixelRatio);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    rig = new THREE.Group();
    scene.add(rig);

    cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.12, 1.12, 1.12),
      new THREE.MeshStandardMaterial({
        color: "#19e0bd",
        emissive: "#087f71",
        emissiveIntensity: 0.95,
        metalness: 0.28,
        roughness: 0.3,
        transparent: true,
        opacity: 0.84
      })
    );
    cube.rotation.set(0.72, 0.68, 0.2);
    cube.position.set(2.4, 0.2, 0.8);
    rig.add(cube);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 420;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: "#72ffe7", size: 0.018, transparent: true, opacity: 0.62 })
    );
    scene.add(particles);

    scene.add(new THREE.AmbientLight("#35a7ff", 1.4));
    const light = new THREE.PointLight("#72ffe7", 52, 20);
    light.position.set(3, 3, 6);
    scene.add(light);
    webglReady = true;
  } catch {
    webglReady = false;
    canvas.style.display = "none";
  }
}

function resize() {
  if (webglReady) {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resizeNetwork();
}

function animate() {
  if (!webglReady) return;

  rig.rotation.z += 0.0008;
  cube.rotation.x += 0.006;
  cube.rotation.y += 0.008;
  particles.rotation.y -= 0.0007;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resizeNetwork() {
  if (!networkCanvas) return;
  const ratio = renderPixelRatio;
  networkWidth = window.innerWidth;
  networkHeight = window.innerHeight;
  networkCanvas.width = Math.floor(networkWidth * ratio);
  networkCanvas.height = Math.floor(networkHeight * ratio);
  networkCanvas.style.width = `${networkWidth}px`;
  networkCanvas.style.height = `${networkHeight}px`;
  networkContext = networkCanvas.getContext("2d");
  networkContext.setTransform(ratio, 0, 0, ratio, 0, 0);

  networkNodes.length = 0;
  const total = Math.max(48, Math.floor((networkWidth * networkHeight) / 22000));
  const nodeTarget = isCompact.matches ? 26 : total;
  for (let i = 0; i < nodeTarget; i += 1) {
    networkNodes.push({
      x: Math.random() * networkWidth,
      y: Math.random() * networkHeight,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      pulse: Math.random() * Math.PI * 2
    });
  }
}

function setupPhonePreview() {
  if (!phoneFrame || isCompact.matches) return;
  const source = phoneFrame.dataset.src;
  if (!source) return;
  phoneFrame.src = source;
}

function drawNetwork(time = 0) {
  if (!networkContext) {
    requestAnimationFrame(drawNetwork);
    return;
  }

  if (time - lastNetworkDraw < 33) {
    requestAnimationFrame(drawNetwork);
    return;
  }
  lastNetworkDraw = time;

  networkContext.clearRect(0, 0, networkWidth, networkHeight);
  networkContext.lineWidth = 1;

  networkNodes.forEach((node, index) => {
    node.x += node.vx + pointer.sx * 0.018;
    node.y += node.vy - pointer.sy * 0.018;

    if (node.x < -30) node.x = networkWidth + 30;
    if (node.x > networkWidth + 30) node.x = -30;
    if (node.y < -30) node.y = networkHeight + 30;
    if (node.y > networkHeight + 30) node.y = -30;

    for (let j = index + 1; j < networkNodes.length; j += 1) {
      const other = networkNodes[j];
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) {
        const alpha = (1 - distance / 150) * 0.28;
        networkContext.strokeStyle = `rgba(114, 255, 231, ${alpha})`;
        networkContext.beginPath();
        networkContext.moveTo(node.x, node.y);
        networkContext.lineTo(other.x, other.y);
        networkContext.stroke();
      }
    }

    const glow = 0.45 + Math.sin(time * 0.001 + node.pulse) * 0.35;
    networkContext.fillStyle = `rgba(114, 255, 231, ${0.16 + glow * 0.18})`;
    networkContext.beginPath();
    networkContext.arc(node.x, node.y, 1.2 + glow, 0, Math.PI * 2);
    networkContext.fill();
  });

  requestAnimationFrame(drawNetwork);
}

function playQuestPing() {
  if (!activeSound || !audioContext || audioContext.state !== "running") return;
  const now = audioContext.currentTime;
  const ping = audioContext.createOscillator();
  const pingGain = audioContext.createGain();
  ping.type = "sine";
  ping.frequency.setValueAtTime(880, now);
  ping.frequency.exponentialRampToValueAtTime(1320, now + 0.07);
  pingGain.gain.setValueAtTime(0.0001, now);
  pingGain.gain.exponentialRampToValueAtTime(pingVolume, now + 0.012);
  pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  ping.connect(pingGain);
  pingGain.connect(audioContext.destination);
  ping.start(now);
  ping.stop(now + 0.19);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
});

document.documentElement.classList.add("animations-ready");

document.querySelectorAll(".reveal").forEach((item) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        item.classList.add("visible");
        observer.disconnect();
      }
    },
    { threshold: 0.18 }
  );
  observer.observe(item);
});

const questState = new Set(["inicio"]);
const questObserver = new IntersectionObserver(
  (entries) => {
    let newestQuest = currentQuest;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        newestQuest = entry.target.id;
        if (!questState.has(entry.target.id)) {
          questState.add(entry.target.id);
          playQuestPing();
        }
      }
    });

    currentQuest = newestQuest;
    questItems.forEach((item) => {
      item.classList.toggle("active", questState.has(item.dataset.target));
      item.classList.toggle("current", item.dataset.target === currentQuest);
    });

    if (questCount) questCount.textContent = String(questState.size);
  },
  { rootMargin: "-35% 0px -35% 0px", threshold: 0.01 }
);

questItems.forEach((item) => {
  const section = document.getElementById(item.dataset.target);
  if (section) questObserver.observe(section);
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${y * -4}deg) rotateY(${x * 5}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.querySelectorAll("[data-share-title]").forEach((button) => {
  const defaultLabel = button.textContent;

  const getShareData = () => {
    const title = button.dataset.shareTitle || "App PrimusDF";
    const description = button.dataset.shareDescription || "Conheça esta solução digital da PrimusDF.";
    const shareUrl = new URL(button.dataset.shareUrl || "./", window.location.href).href;
    const text = button.dataset.shareMessage
      ? button.dataset.shareMessage.replace(button.dataset.shareUrl || shareUrl, shareUrl)
      : `Conheça o ${title} da PrimusDF:\n${description}\n\n🔷 ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    return { title, text, shareUrl, whatsappUrl };
  };

  const setWhatsAppLink = () => {
    if (!button.matches("a")) return;
    button.href = getShareData().whatsappUrl;
  };

  setWhatsAppLink();

  button.addEventListener("click", async (event) => {
    const { title, text, shareUrl } = getShareData();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const copyShareText = async () => {
      if (!navigator.clipboard) return;
      await navigator.clipboard.writeText(text);
    };

    try {
      if (isMobile && navigator.share) {
        event.preventDefault();
        await navigator.share({ title, text });
      } else {
        copyShareText().catch(() => {});
        button.textContent = "Abrindo WhatsApp";
        window.setTimeout(() => {
          button.textContent = defaultLabel;
        }, 1800);
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      button.textContent = "Abrindo WhatsApp";
      window.setTimeout(() => {
        button.textContent = defaultLabel;
      }, 1800);
    }
  });
});

async function playMusicTrack() {
  if (!music) {
    music = new Audio(musicTrack);
    music.loop = true;
    music.preload = "auto";
    music.volume = musicVolume;
    music.playsInline = true;
  }
  music.volume = musicVolume;
  await music.play();
}

function syncSoundButton() {
  sound?.setAttribute("aria-pressed", String(activeSound));
  if (sound) sound.textContent = activeSound ? "sem som" : "som";
}

async function startSound() {
  try {
    soundWanted = true;
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === "suspended") await audioContext.resume();
    activeSound = true;
    await playMusicTrack();
    syncSoundButton();
  } catch {
    activeSound = false;
    syncSoundButton();
  }
}

function armFirstInteractionSound() {
  const tryStart = (event) => {
    if (sound?.contains(event.target)) return;
    if (soundWanted && !soundManuallyChanged) startSound();
  };

  window.addEventListener("pointerdown", tryStart, { once: true, passive: true });
  window.addEventListener("click", tryStart, { once: true, passive: true });
  window.addEventListener("touchstart", tryStart, { once: true, passive: true });
  window.addEventListener("keydown", tryStart, { once: true });
  window.addEventListener("scroll", tryStart, { once: true, passive: true });
}

sound?.addEventListener("click", async () => {
  soundManuallyChanged = true;
  if (!audioContext) audioContext = new AudioContext();

  if (audioContext.state === "suspended") await audioContext.resume();
  activeSound = !activeSound;
  soundWanted = activeSound;
  if (activeSound) {
    await playMusicTrack();
  }

  if (!activeSound) {
    if (music) music.pause();
  }

  syncSoundButton();
});

async function init() {
  await setupWorld();
  setupPhonePreview();
  resize();
  animate();
  drawNetwork();
  startSound();
  armFirstInteractionSound();
}

init();
