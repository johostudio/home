import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Setup Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Insert canvas into the DOM ensuring it's behind content but visible
const container = document.createElement('div');
container.id = 'canvas-3d';
container.style.position = 'fixed';
container.style.top = '0';
container.style.left = '0';
container.style.width = '100%';
container.style.height = '100%';
container.style.zIndex = '0'; // Behind interactive elements
container.style.pointerEvents = 'none'; // Allow clicks through to gallery
document.body.appendChild(container);
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

// Placeholder Models (Replace with GLTFLoader later)
// 1. MP3 Player (Vertical Box)
const mp3Geo = new THREE.BoxGeometry(0.8, 1.4, 0.2);
const mp3Mat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2, metalness: 0.8 });
const mp3Player = new THREE.Mesh(mp3Geo, mp3Mat);
mp3Player.position.set(-2, 0, 0); // Left side
scene.add(mp3Player);

// 2. Nintendo 3DS (Two Boxes Hinged)
const dsGroup = new THREE.Group();
const bottomGeo = new THREE.BoxGeometry(1.2, 0.1, 0.8);
const bottomMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.5 });
const bottomScreen = new THREE.Mesh(bottomGeo, bottomMat);

const topGeo = new THREE.BoxGeometry(1.2, 0.1, 0.8);
const topMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.5 });
const topScreen = new THREE.Mesh(topGeo, topMat);
topScreen.position.y = 0.05; // Hinge point
topScreen.position.z = -0.4; // Back edge
topScreen.rotation.x = -Math.PI / 4; // Open angle

dsGroup.add(bottomScreen); // Add bottom first
dsGroup.add(topScreen);    // Add top (hinged)
dsGroup.position.set(2, -0.5, 0); // Right side
scene.add(dsGroup);

// Mouse Interaction variables
let mouseX = 0;
let mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
});

// GSAP Hover Effects (Simulated for now on mouse proximity or specific elements)
// Ideally, attach to DOM elements. Here we simulate idle float + mouse follow.

function animate() {
    requestAnimationFrame(animate);

    // Idle Animation
    mp3Player.rotation.y += 0.005;
    mp3Player.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;

    dsGroup.rotation.y -= 0.005;
    dsGroup.rotation.x = Math.cos(Date.now() * 0.001) * 0.1;

    // Mouse Parallax (Ease)
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
