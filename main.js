import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let mixer = null;

let enterMixer = null;
let enterKeyAction = null;
// Light up below the "Enter" key when the Enter-key animation is running
let enterKeyLight = null;
// Start time of "flying away" animation of Enter key
let enterKeyFlyStartTime = 0;
let enterKeyUrlOpened = false;
let enterKeyMesh = null;

let f1Mixer = null;
let f1KeyAction = null;
let f1KeyLight = null;
let f1KeyFlyStartTime = 0;
let f1KeyUrlOpened = false;
let f1KeyMesh = null;

let spaceMixer = null;
let spaceKeyAction = null;
let spaceKeyLight = null;
let spaceKeyFlyStartTime = 0;
let spaceKeyUrlOpened = false;
let spaceKeyMesh = null;

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
// Camera position near Enter key
camera.position.set(15.98, 9.41, -8.09);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
// Add shadows of text onto keyboard
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Mouse/Key controls
const controls = new OrbitControls(camera, renderer.domElement);
// Initial camera looking at this point
controls.target.set(-2.8, -1.1, -9);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Loader for glb files exported from Blender
const gltfLoader = new GLTFLoader();

gltfLoader.load('models/message.glb', (gltf) => {
    const message = gltf.scene;
    message.position.set(0, 0, -0.5); // Initial position
    scene.add(message);

    // Play text animation (rotation in Z-axis)
    mixer = new THREE.AnimationMixer(message);
    const clip = THREE.AnimationClip.findByName(gltf.animations, 'TextAction');
    if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
    }

    message.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
});

gltfLoader.load('models/keyboard.glb', (gltf) => {
    const keyboard = gltf.scene;
    keyboard.position.set(0, 0, 0);
    scene.add(keyboard);

    keyboard.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
});

gltfLoader.load('models/enter_key.glb', (gltf) => {
    const enterKey = gltf.scene;
    enterKey.position.set(8.8, -0.1, -28);
    enterKey.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(enterKey);
    enterKeyMesh = enterKey;

    // Add point light just under the enter key (with offset)
    enterKeyLight = new THREE.PointLight(0xffff00, 100, 0, 2.5);
    enterKeyLight.position.set(1.5, 1.9, -9);
    enterKeyLight.visible = false;
    scene.add(enterKeyLight);


    // Create mixer and find both clips
    enterMixer = new THREE.AnimationMixer(enterKey);
    const keyEnterClip = THREE.AnimationClip.findByName(gltf.animations, 'key_enter.Action');

    if (keyEnterClip) {
        enterKeyAction = enterMixer.clipAction(keyEnterClip);
    }

    // Add spotlight on Enter key because it's the main key to press
    const spotlight = new THREE.SpotLight(0xffffff, 500, 20, 0.4, 1, 1.5);
    spotlight.position.set(5, 10, 0);

    const box = new THREE.Box3().setFromObject(enterKey);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const spotlightTarget = new THREE.Object3D();
    spotlightTarget.position.copy(center);
    scene.add(spotlightTarget);
    spotlight.target = spotlightTarget;

    // Enable shadowing for lights
    spotlight.castShadow = true;

    // Improve shadow quality
    spotlight.shadow.mapSize.set(1024, 1024);
    spotlight.shadow.bias = -0.0001;

    scene.add(spotlight);
    scene.add(spotlight.target);
});

gltfLoader.load('models/f1_key.glb', (gltf) => {
    // Add "hidden" key for login. Clicking on "F1" key forward to keycloack login
    const f1Key = gltf.scene;
    f1Key.position.set(0, -0.05, 0);
    f1Key.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(f1Key);
    f1KeyMesh = f1Key;

    // Add point light under the F1 key
    f1KeyLight = new THREE.PointLight(0xffff00, 10, 0, 2.5);
    f1KeyLight.position.set(-3.9, 2.9, 14.3);
    f1KeyLight.visible = false;
    scene.add(f1KeyLight);

    f1Mixer = new THREE.AnimationMixer(f1Key);
    const f1KeyClip = THREE.AnimationClip.findByName(gltf.animations, 'f1_key.Action');

    if (f1KeyClip) {
        f1KeyAction = f1Mixer.clipAction(f1KeyClip);
    }
});

gltfLoader.load('models/space_key.glb', (gltf) => {
    // Add "hidden" key for credits. Clicking on space bar forward to keyboard original link
    const spaceKey = gltf.scene;
    spaceKey.position.set(0, -0.05, 0);
    spaceKey.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(spaceKey);
    spaceKeyMesh = spaceKey;

    // Add point light under the space key
    spaceKeyLight = new THREE.PointLight(0xffff00, 50, 0, 2.5);
    spaceKeyLight.position.set(6.8, 1.4, 5.3);
    spaceKeyLight.visible = false;
    scene.add(spaceKeyLight);

    spaceMixer = new THREE.AnimationMixer(spaceKey);
    const spaceKeyClip = THREE.AnimationClip.findByName(gltf.animations, 'space_key.Action');


    if (spaceKeyClip) {
        spaceKeyAction = spaceMixer.clipAction(spaceKeyClip);
    }

    // Add light spotlight on space bar to see text
    const creditsSpotlight = new THREE.SpotLight(0xffffff, 175, 20, 0.4, 1, 1.5);
    creditsSpotlight.position.set(5, 10, 0);

    const box = new THREE.Box3().setFromObject(spaceKey);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const creditsSpotlightTarget = new THREE.Object3D();
    creditsSpotlightTarget.position.copy(center);
    scene.add(creditsSpotlightTarget);
    creditsSpotlight.target = creditsSpotlightTarget;

    // Enable shadowing for lights
    creditsSpotlight.castShadow = true;

    // Improve shadow quality
    creditsSpotlight.shadow.mapSize.set(1024, 1024);
    creditsSpotlight.shadow.bias = -0.0001;

    scene.add(creditsSpotlight);
    scene.add(creditsSpotlight.target);
});

// Add directional light
const dirlight = new THREE.DirectionalLight(0xffffff, 0.32);
dirlight.position.set(2, 10, 8);
dirlight.castShadow = true;
scene.add(dirlight);

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (enterKeyMesh) {
        const intersects = raycaster.intersectObject(enterKeyMesh, true);
        if (intersects.length > 0 && enterKeyAction) {
            enterKeyLight.visible = true;

            function onEnterKeyActionFinished() {
                enterKeyLight.visible = false;
                if (enterKeyFlyStartTime == 0) {
                    enterKeyFlyStartTime = performance.now();
                }
                // Stop animation after it finishes
                enterMixer.removeEventListener('finished', onEnterKeyActionFinished);
            }

            enterKeyAction.reset().play();
            enterKeyAction.clampWhenFinished = true;
            enterKeyAction.loop = THREE.LoopOnce;
            enterMixer.addEventListener('finished', onEnterKeyActionFinished);
        }
    }
    if (f1KeyMesh) {
        const intersects = raycaster.intersectObject(f1KeyMesh, true);
        if (intersects.length > 0 && f1KeyAction) {
            f1KeyLight.visible = true;

            function onF1KeyActionFinished() {
                f1KeyLight.visible = false;
                if (f1KeyFlyStartTime == 0) {
                    f1KeyFlyStartTime = performance.now();
                }
                f1Mixer.removeEventListener('finished', onF1KeyActionFinished);
            }

            f1KeyAction.reset().play();
            f1KeyAction.clampWhenFinished = true;
            f1KeyAction.loop = THREE.LoopOnce;
            f1Mixer.addEventListener('finished', onF1KeyActionFinished);
        }
    }
    if (spaceKeyMesh) {
        const intersects = raycaster.intersectObject(spaceKeyMesh, true);
        if (intersects.length > 0 && spaceKeyAction) {
            spaceKeyLight.visible = true;

            function onSpaceKeyActionFinished() {
                spaceKeyLight.visible = false;
                if (spaceKeyFlyStartTime == 0) {
                    spaceKeyFlyStartTime = performance.now();
                }
                spaceMixer.removeEventListener('finished', onSpaceKeyActionFinished);
            }

            spaceKeyAction.reset().play();
            spaceKeyAction.clampWhenFinished = true;
            spaceKeyAction.loop = THREE.LoopOnce;
            spaceMixer.addEventListener('finished', onSpaceKeyActionFinished);
        }
    }
}

window.addEventListener('click', onClick);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'Enter':
        case 'NumpadEnter':  // For people having a numpad on their keyboard.
            if (enterKeyAction) {
                enterKeyLight.visible = true;
                enterKeyAction.reset().play();
                enterKeyAction.clampWhenFinished = true;
                enterKeyAction.loop = THREE.LoopOnce;

                enterMixer.addEventListener('finished', function onEnterFinish() {
                    enterKeyLight.visible = false;
                    if (enterKeyFlyStartTime === 0) {
                        enterKeyFlyStartTime = performance.now();
                    }
                    enterMixer.removeEventListener('finished', onEnterFinish);
                });
            }
            break;

        case 'F1':
            // Prevent default browser help page shortcut using F1
            event.preventDefault();
            if (f1KeyAction) {
                f1KeyLight.visible = true;
                f1KeyAction.reset().play();
                f1KeyAction.clampWhenFinished = true;
                f1KeyAction.loop = THREE.LoopOnce;

                f1Mixer.addEventListener('finished', function onF1Finish() {
                    f1KeyLight.visible = false;
                    if (f1KeyFlyStartTime === 0) {
                        f1KeyFlyStartTime = performance.now();
                    }
                    f1Mixer.removeEventListener('finished', onF1Finish);
                });
            }
            break;

        case 'Space':
        case 'Spacebar':
            event.preventDefault();
            if (spaceKeyAction) {
                spaceKeyLight.visible = true;
                spaceKeyAction.reset().play();
                spaceKeyAction.clampWhenFinished = true;
                spaceKeyAction.loop = THREE.LoopOnce;

                spaceMixer.addEventListener('finished', function onSpaceFinish() {
                    spaceKeyLight.visible = false;
                    if (spaceKeyFlyStartTime === 0) {
                        spaceKeyFlyStartTime = performance.now();
                    }
                    spaceMixer.removeEventListener('finished', onSpaceFinish);
                });
            }
            break;
    }
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);
    if (enterMixer) enterMixer.update(delta);
    if (f1Mixer) f1Mixer.update(delta);
    if (spaceMixer) spaceMixer.update(delta);

    controls.update();
    if (enterKeyFlyStartTime != 0) {
        const elapsed = (performance.now() - enterKeyFlyStartTime) / 1000; // in seconds

        // Fly away movements
        camera.position.z -= elapsed * 5;
        camera.position.y -= elapsed * 2;
        // slight shake
        camera.position.x += Math.sin(elapsed * 5) * 0.1;

        // Zoom out effect
        camera.fov = THREE.MathUtils.lerp(camera.fov, 100, 0.05);
        camera.updateProjectionMatrix();
        if (!enterKeyUrlOpened && elapsed > 0.5) {
            enterKeyUrlOpened = true;
            window.location.href = 'https://stilmant.dev/blog/';
        }
    }
    else if (f1KeyFlyStartTime != 0) {
        const elapsed = (performance.now() - enterKeyFlyStartTime) / 1000; // in seconds

        // Fly away movements
        camera.position.z -= elapsed * 5;
        camera.position.y -= elapsed * 2;
        // slight shake
        camera.position.x += Math.sin(elapsed * 5) * 0.1;

        // Zoom out effect
        camera.fov = THREE.MathUtils.lerp(camera.fov, 100, 0.05);
        camera.updateProjectionMatrix();
        if (!f1KeyUrlOpened && elapsed > 1.0) {
            f1KeyUrlOpened = true;
            window.location.href = 'https://stilmant.dev/auth/realms/Organization/protocol/openid-connect/auth?client_id=menu-page&redirect_uri=https://stilmant.dev/menu&response_type=code';
        }
    }
    else if (spaceKeyFlyStartTime != 0) {
        const elapsed = (performance.now() - enterKeyFlyStartTime) / 1000; // in seconds

        // Fly away movements
        camera.position.z -= elapsed * 5;
        camera.position.y -= elapsed * 2;
        // slight shake
        camera.position.x += Math.sin(elapsed * 5) * 0.1;

        // Zoom out effect
        camera.fov = THREE.MathUtils.lerp(camera.fov, 100, 0.05);
        camera.updateProjectionMatrix();
        if (!spaceKeyUrlOpened && elapsed > 1.5) {
            spaceKeyUrlOpened = true;
            window.location.href = 'https://www.blenderkit.com/asset-gallery-detail/1db0380b-c09a-43e6-94e7-fc85cd580b79/?query=author_id:791292';
        }
    }
    renderer.render(scene, camera);
}


animate();
