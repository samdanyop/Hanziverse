import * as THREE from "three";

const levelColors = {
  1: 0xff8a3d,
  2: 0xffd166,
  3: 0x35d3a8,
  4: 0x5c7cfa,
  5: 0x9c6cff,
  6: 0xee4d5f,
};

const canvas = document.querySelector("#hanziverse-canvas");
const levelLabel = document.querySelector("#active-level-label");
const levelLinks = document.querySelectorAll(".level-link");
const filterButtons = document.querySelectorAll(".filter-button");
const levelSections = document.querySelectorAll(".level-section");
const sidebarToggle = document.querySelector(".sidebar-toggle");
const levelNavigation = document.querySelector("#level-navigation");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x090d19, 9, 25);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
camera.position.set(0, 4.2, 9.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x090d19, 1);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffd166, 3, 32);
pointLight.position.set(3, 5, 4);
scene.add(pointLight);

const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.3, 3),
  new THREE.MeshStandardMaterial({
    color: levelColors[1],
    emissive: levelColors[1],
    emissiveIntensity: 0.22,
    roughness: 0.35,
    metalness: 0.25,
  })
);
scene.add(core);

const ringGroup = new THREE.Group();
scene.add(ringGroup);

for (let index = 0; index < 6; index += 1) {
  const radius = 2.15 + index * 0.48;
  const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.54, 0, Math.PI * 2);
  const points = curve.getPoints(96).map((point) => new THREE.Vector3(point.x, 0, point.y));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const ring = new THREE.LineLoop(
    geometry,
    new THREE.LineBasicMaterial({ color: levelColors[index + 1], transparent: true, opacity: 0.52 })
  );
  ring.rotation.x = Math.PI / 2.7;
  ring.rotation.z = index * 0.32;
  ringGroup.add(ring);
}

const satellites = [];
for (let index = 0; index < 18; index += 1) {
  const level = (index % 6) + 1;
  const satellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.09 + level * 0.012, 24, 24),
    new THREE.MeshStandardMaterial({ color: levelColors[level], emissive: levelColors[level], emissiveIntensity: 0.35 })
  );
  satellite.userData = {
    level,
    angle: index * 0.7,
    radius: 2.05 + level * 0.46,
    speed: 0.25 + level * 0.025,
  };
  satellites.push(satellite);
  scene.add(satellite);
}

const starGeometry = new THREE.BufferGeometry();
const starPositions = [];
for (let index = 0; index < 420; index += 1) {
  starPositions.push(
    THREE.MathUtils.randFloatSpread(28),
    THREE.MathUtils.randFloatSpread(20),
    THREE.MathUtils.randFloatSpread(28)
  );
}
starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.72 })
);
scene.add(stars);

let activeLevel = 1;
let targetColor = new THREE.Color(levelColors[activeLevel]);

function resizeRenderer() {
  const { clientWidth, clientHeight } = canvas.parentElement;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

function setActiveLevel(level) {
  activeLevel = Number(level);
  targetColor = new THREE.Color(levelColors[activeLevel]);
  levelLabel.textContent = `HSK ${activeLevel}`;

  levelLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.level === String(activeLevel));
  });
}

function filterVocabulary(level) {
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === level);
  });

  levelSections.forEach((section) => {
    section.classList.toggle("is-hidden", level !== "all" && section.dataset.level !== level);
  });
}

levelLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveLevel(link.dataset.level);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterVocabulary(button.dataset.filter);
  });
});

sidebarToggle.addEventListener("click", () => {
  const isOpen = levelNavigation.classList.toggle("is-open");
  sidebarToggle.setAttribute("aria-expanded", String(isOpen));
});

function animate(time = 0) {
  const elapsed = time * 0.001;
  core.rotation.x = elapsed * 0.18;
  core.rotation.y = elapsed * 0.32;
  ringGroup.rotation.y = elapsed * 0.08;
  stars.rotation.y = elapsed * 0.018;

  core.material.color.lerp(targetColor, 0.035);
  core.material.emissive.lerp(targetColor, 0.035);
  pointLight.color.lerp(targetColor, 0.03);

  satellites.forEach((satellite) => {
    const levelBoost = satellite.userData.level === activeLevel ? 0.55 : 0;
    const angle = satellite.userData.angle + elapsed * satellite.userData.speed;
    const radius = satellite.userData.radius + levelBoost;
    satellite.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 0.52, Math.sin(angle) * radius * 0.54);
    satellite.scale.setScalar(satellite.userData.level === activeLevel ? 1.9 : 1);
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resizeRenderer();
setActiveLevel(1);
filterVocabulary("all");
window.addEventListener("resize", resizeRenderer);
requestAnimationFrame(animate);
