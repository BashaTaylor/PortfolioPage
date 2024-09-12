import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Canvas
const canvas = document.querySelector('canvas.webgl');
if (!canvas) {
    console.error('Canvas element not found.');
}

// Scene
const scene = new THREE.Scene();

// Box Object (Main Cube)
const geometry = new THREE.BoxGeometry(4.5, 1, 0.51);
const material = new THREE.MeshBasicMaterial({ color: 0x36454f });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Create Smaller Cubes
const createSmallCube = (size, color, position) => {
    const smallGeometry = new THREE.BoxGeometry(size, size, size);
    const smallMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
    const smallCube = new THREE.Mesh(smallGeometry, smallMaterial);
    smallCube.position.set(position.x, position.y, position.z);
    return smallCube;
};

// Add smaller cubes in a 3D square formation
const smallCubeSize = 1;
const spacing = 2;
const colors = [0x008000, 0xffa500, 0x00ffff, 0xff00ff];
const positions = [
    { x: -spacing, y: -spacing, z: 0 },
    { x: spacing, y: -spacing, z: 0 },
    { x: -spacing, y: spacing, z: 0 },
    { x: spacing, y: spacing, z: 0 },
];

// Create and add the smaller cubes
const smallCubes = positions.map((pos, index) => {
    const color = colors[index % colors.length];
    const smallCube = createSmallCube(smallCubeSize, color, pos);
    scene.add(smallCube);
    return smallCube;
});

// Sizes (using depth instead of height)
const sizes = {
    width: window.innerWidth,
    depth: window.innerHeight // Adjusted to match window height
};

// Camera
const camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.depth, 0.1, 100);
camera.position.set(0, 0, 5);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.depth);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Update sizes and camera on window resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.depth = window.innerHeight;

    camera.aspect = sizes.width / sizes.depth;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.depth);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Load Font and Restore "Welcome" Text
const loader = new FontLoader();
loader.load('/fonts/droid_sans_regular.typeface.json', function (font) {
    const textGeometry = new TextGeometry('Welcome to my page', {
        font: font,
        size: 0.3,
        depth: 0.08,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.015,
        bevelSegments: 5
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Compute the bounding box of the text
    const textBox = new THREE.Box3().setFromObject(textMesh);
    const textSize = textBox.getSize(new THREE.Vector3());

    // Position the text correctly on the main cube
    textMesh.position.set(
        -textSize.x / 2, // Center horizontally
        -textSize.y / 4, // Center vertically
        0.26 // Slight offset from the cube surface
    );

    mesh.add(textMesh); // Add the text to the main cube
});

// Create the "Enter" button base cube
const buttonBaseGeometry = new THREE.BoxGeometry(1.5, 0.7, 0.8); // Adjust size as needed
const buttonBaseMaterial = new THREE.MeshBasicMaterial({ color: 0x333336, wireframe: true });
const buttonBaseMesh = new THREE.Mesh(buttonBaseGeometry, buttonBaseMaterial);

// Position the base cube under the main cube
buttonBaseMesh.position.set(0, -1.2, 0); // Adjust the y value to move it under the main cube

// Add the base cube to the scene
scene.add(buttonBaseMesh);

// Create the "Enter" text with adjusted font size
loader.load('/fonts/droid_sans_regular.typeface.json', function (font) {
    const enterGeometry = new TextGeometry('Enter', {
        font: font,
        size: 0.3, // Font size
        depth: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.000,
        bevelSize: 0.015,
        bevelSegments: 5
    });

    const enterMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff }); // Red for visibility
    const enterMesh = new THREE.Mesh(enterGeometry, enterMaterial);

    // Compute the bounding box of the text
    const textBox = new THREE.Box3().setFromObject(enterMesh);
    const textSize = textBox.getSize(new THREE.Vector3());

    
    
    // Adjust the text position relative to the base cube
    enterMesh.position.set(
        -textSize.x / 2., // Center horizontally
        buttonBaseMesh.geometry.parameters.height / 21.5 - textSize.y / 1.9, // Center vertically
        0 // Slight offset from the base
    );

    // Make the text a child of the button base
    buttonBaseMesh.add(enterMesh); // This ensures the text rotates with the button base
});


// Raycaster and Mouse for Click Detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const onMouseClick = (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycasting to detect intersection with the base cube for the Enter button
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(buttonBaseMesh); // Check against the cube, not the text

    if (intersects.length > 0) {
        console.log('Button clicked!');
        // Redirect to about.html when the base cube is clicked
        window.location.href = 'about.html';
    }
};

// Listen for mouse clicks
window.addEventListener('click', onMouseClick);

// Animation Loop
let time = Date.now();
const tick = () => {
    const currentTime = Date.now();
    const deltaTime = currentTime - time;
    time = currentTime;

    // Rotate the main cube
    mesh.rotation.y += 0.0006 * deltaTime;

    // Rotate each small cube
    smallCubes.forEach(cube => {
        cube.rotation.x += 0.015;
        cube.rotation.y += 0.014;
    });

    // Rotate the button base and its text
    buttonBaseMesh.rotation.y -= 0.0005 * deltaTime;

    // Render the scene
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};
tick();
