import * as THREE from "three";
import Ribbon from "./Ribbon.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Confetti from "./Confetti.js";

async function loadTextures(imagArray) {
  let textureLoader = new THREE.TextureLoader();
  const promise = imagArray.map((texture) => {
    return new Promise((resolve, reject) => {
      textureLoader.load(texture.path, resolve, undefined, reject);
    });
  });

  return Promise.all(promise);
}

function initScene(texture) {
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "100px";
  overlay.style.padding = "10px";
  overlay.style.color = "white";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  document.body.appendChild(overlay);

  let stats = new Stats();
  stats.showPanel(2);
  document.body.appendChild(stats.dom);

  // Scene setup
  const scene = new THREE.Scene();
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Camera setup
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.z = 5;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  const dLight = new THREE.DirectionalLight(0xffffff, 1.5);
  scene.add(dLight, ambientLight);

  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Overlay update
  function updateOverlay() {
    overlay.innerHTML = `
      <strong>Draw Calls:</strong> ${renderer.info.render.calls}<br>
      <strong>Frame:</strong> ${renderer.info.render.frame}<br>
      <strong>Textures:</strong> ${renderer.info.memory.textures}<br>
      <strong>Geometries:</strong> ${renderer.info.memory.geometries}
    `;
  }

  let clock = new THREE.Clock();
  let time = 0;

  // Instances of Ribbon and Confetti
  let ribbon = new Ribbon(scene, width, height, texture[0]);
  let confetti = new Confetti(scene, width, height, texture[0]);

  window.addEventListener("click", () => {
    confetti.dispose();
    // ribbon.dispose();
  });

  function animate() {
    stats.begin();
    requestAnimationFrame(animate);

    controls.update();
    const delta = clock.getDelta();
    time += delta;

    ribbon.animateRibbons(time);
    confetti.animateConfetti(time);

    updateOverlay();
    renderer.render(scene, camera);
    stats.end();
  }

  animate();

  // Window resize handler
  window.addEventListener("resize", onWindowResize, true);

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.floor(Math.min(window.devicePixelRatio, 2)));

    confetti.updateSize( width,height);
    ribbon.updateResize( width, height);
  }
}

const ribbonArray = [
  {
    name: "ribbon",
    path: "Images/Ri_C1.png",
  },
];

loadTextures(ribbonArray)
  .then((t) => initScene(t))
  .catch((e) => console.log(e));
