import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const canvas = document.querySelector("#userCubeCanvas");
const stage = canvas?.closest(".cube-scene");

if (canvas && stage) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const pointer = {
    active: false,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    velocityX: 0,
    velocityY: 0
  };
  const maxInertia = 0.28;

  camera.position.z = 5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.78, 1.78, 1.78),
    new THREE.MeshStandardMaterial({
      color: "#19e0bd",
      roughness: 0.3,
      metalness: 0.28,
      emissive: "#087f71",
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.84
    })
  );

  cube.rotation.set(0.72, 0.68, 0.2);
  scene.add(cube);

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(cube.geometry),
    new THREE.LineBasicMaterial({ color: "#72ffe7", transparent: true, opacity: 0.24 })
  );
  cube.add(edge);

  scene.add(new THREE.AmbientLight("#35a7ff", 1.35));

  const light = new THREE.PointLight("#72ffe7", 52, 20);
  light.position.set(2.5, 3.1, 4.2);
  scene.add(light);

  function resizeRenderer() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function handlePointerDown(event) {
    pointer.active = true;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    pointer.lastTime = performance.now();
    pointer.velocityX = 0;
    pointer.velocityY = 0;
    canvas.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!pointer.active) return;

    const deltaX = event.clientX - pointer.lastX;
    const deltaY = event.clientY - pointer.lastY;
    const now = performance.now();
    const elapsed = Math.max(12, now - pointer.lastTime);
    const frameSpeed = 16.67 / elapsed;

    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    pointer.lastTime = now;
    pointer.velocityX = THREE.MathUtils.clamp(deltaX * 0.009 * frameSpeed, -maxInertia, maxInertia);
    pointer.velocityY = THREE.MathUtils.clamp(deltaY * 0.009 * frameSpeed, -maxInertia, maxInertia);

    cube.rotation.y += deltaX * 0.0045;
    cube.rotation.x += deltaY * 0.0045;
  }

  function handlePointerUp(event) {
    pointer.active = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);
  window.addEventListener("resize", resizeRenderer);

  function renderCube() {
    if (!pointer.active) {
      cube.rotation.x += 0.006 + pointer.velocityY;
      cube.rotation.y += 0.008 + pointer.velocityX;
      pointer.velocityX *= 0.988;
      pointer.velocityY *= 0.988;

      if (Math.abs(pointer.velocityX) < 0.0004) pointer.velocityX = 0;
      if (Math.abs(pointer.velocityY) < 0.0004) pointer.velocityY = 0;
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(renderCube);
  }

  resizeRenderer();
  renderCube();
}
