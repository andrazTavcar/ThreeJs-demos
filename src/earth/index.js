import * as THREE  from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const light = new THREE.DirectionalLight(0xffffff);
light.position.set(-2, 0.5, 1.5);

const loader = new THREE.TextureLoader();

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;

const earth = new THREE.IcosahedronGeometry(1, 16);
const material = new THREE.MeshStandardMaterial({
    map: loader.load("./textures/00_earthmap1k.jpg"),
    specularMap: loader.load("./textures/02_earthspec1k.jpg"),
    bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
    bumpScale: 0.04,
});
const earthMesh = new THREE.Mesh(earth, material);
earthGroup.add(earthMesh);

const lightMaterial = new THREE.MeshBasicMaterial({
    map: loader.load('textures/03_earthlights1k.jpg'),
    blending: THREE.AdditiveBlending,
});
const lightMesh = new THREE.Mesh(earth, lightMaterial);
earthGroup.add(lightMesh);

const cloudsMaterial = new THREE.MeshStandardMaterial(
    {
        map: loader.load("./textures/04_earthcloudmap.jpg"),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
    }
)
const cloudsMesh = new THREE.Mesh(earth, cloudsMaterial);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

earthGroup.add(createAtmosphere());

const scene = new THREE.Scene();

scene.add(earthGroup);
scene.add(createStars(300, 1000));
scene.add(light);


function animate(t = 0) {
    renderer.setAnimationLoop(animate);
    earthGroup.rotateY(0.001);
    cloudsMesh.rotateY(0.0005);
    renderer.render(scene, camera);
    controls.update();
}

animate();


function createStars(radius, count) {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

    const positions = [];
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        positions.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const stars = new THREE.Points(starGeometry, starMaterial);
    return stars;
}

function createAtmosphere() {
    const atmosphereGeometry = new THREE.SphereGeometry(1.1, 32, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });

    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    return atmosphereMesh;
}