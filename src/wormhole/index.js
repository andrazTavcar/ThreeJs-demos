import * as THREE from 'three';
import {EffectComposer} from 'jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'jsm/postprocessing/UnrealBloomPass.js';

import spline from './spline.js';


const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const scene = new THREE.Scene();
// Initialize EffectComposer
const composer = new EffectComposer(renderer);
// Add RenderPass
const renderPass = new RenderPass(scene, camera);
// Add UnrealBloomPass (example of a post-processing effect)
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),1.5, 0.4, 100);
bloomPass.threshold = 0.005;
bloomPass.strength = 5.5;
bloomPass.radius = 0;

composer.addPass(renderPass);
composer.addPass(bloomPass);

const ambientLight = new THREE.AmbientLight(0xffffff);
const fog = new THREE.Fog(0x000000, 1, 4)

const points = spline.getPoints(100);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({color: 0x123123})
const line = new THREE.Line(geometry, material);


const tubeGeometry = new THREE.TubeGeometry(spline, 222, 0.65, 16, true)
const tubeMaterial = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, vertexColors: true, wireframe: true});
const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);


scene.add(line);
scene.add(tube);
scene.add(ambientLight);
scene.fog = fog;


function animate(t = 0) {
    renderer.setAnimationLoop(animate);
    updateCamera(t);
    composer.render(scene, camera);
}

function  updateCamera(t) {
    const time = t * 0.5;
    const loopTime = 20 * 1000;
    const t1 = (time % loopTime) / loopTime;
    const pos = tubeGeometry.parameters.path.getPointAt(t1);
    const lookAt = tubeGeometry.parameters.path.getPointAt((t1 + 0.01) % 1);
    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

animate();
randomColor();

function randomColor() {
    const colors = new Float32Array(tubeGeometry.attributes.position.count * 3);
    setInterval(() => {
        for (let i = 0; i < colors.length; i += 4) {
            colors[i] = Math.random();     // Red
            colors[i + 1] = Math.random(); // Green
            colors[i + 2] = Math.random(); // Blue
        }
        tubeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }, 1000)
}