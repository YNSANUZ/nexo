import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const canvas = document.querySelector("#loginCubeCanvas");
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const pointer = { active: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 };
  const maxInertia = 0.26;

  camera.position.z = 5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 1.75, 1.75),
    new THREE.MeshStandardMaterial({
      color: "#18d6bf",
      roughness: 0.3,
      metalness: 0.3,
      emissive: "#08756d",
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.88,
    })
  );
  cube.rotation.set(0.72, 0.68, 0.2);
  scene.add(cube);

  cube.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(cube.geometry),
    new THREE.LineBasicMaterial({ color: "#b8fff3", transparent: true, opacity: 0.24 })
  ));

  scene.add(new THREE.AmbientLight("#35a7ff", 1.35));
  const light = new THREE.PointLight("#72ffe7", 54, 20);
  light.position.set(2.4, 3.1, 4.2);
  scene.add(light);

  function resizeRenderer() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function pointerDown(event) {
    pointer.active = true;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    pointer.velocityX = 0;
    pointer.velocityY = 0;
    canvas.setPointerCapture(event.pointerId);
  }

  function pointerMove(event) {
    if (!pointer.active) return;
    const deltaX = event.clientX - pointer.lastX;
    const deltaY = event.clientY - pointer.lastY;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    pointer.velocityX = THREE.MathUtils.clamp(deltaX * 0.007, -maxInertia, maxInertia);
    pointer.velocityY = THREE.MathUtils.clamp(deltaY * 0.007, -maxInertia, maxInertia);
    cube.rotation.y += deltaX * 0.0048;
    cube.rotation.x += deltaY * 0.0048;
  }

  function pointerUp(event) {
    pointer.active = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  window.addEventListener("resize", resizeRenderer);
  resizeRenderer();

  function render() {
    if (!pointer.active) {
      cube.rotation.x += 0.005 + pointer.velocityY;
      cube.rotation.y += 0.008 + pointer.velocityX;
      pointer.velocityX *= 0.988;
      pointer.velocityY *= 0.988;
    }
    renderer.render(scene, camera);
    window.requestAnimationFrame(render);
  }
  render();
}
