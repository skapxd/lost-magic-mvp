import GUI from "lil-gui";
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Clock,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PCFSoftShadowMap,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "stats.js";
import { toggleFullScreen } from "./helpers/fullscreen";
import { resizeRendererToDisplaySize } from "./helpers/responsiveness";
import "./style.css";

// Game constants
const CANVAS_ID = "scene";
const HERO_MOVE_SPEED = 0.05;
const MAX_MANA = 100;
const MANA_REGEN_RATE = 5; // Per second

// Game state
interface GameState {
  heroPosition: Vector3;
  heroMana: number;
  selectedRunes: string[];
  activeSpell: string | null;
}

// Game objects
interface GameObject {
  mesh: Mesh | Group;
  update?: (deltaTime: number) => void;
}

// Rune system
interface Rune {
  name: string;
  color: Color;
  manaCost: number;
}

interface Spell {
  name: string;
  runeCombo: string[];
  manaCost: number;
  effect: () => void;
}

let canvas: HTMLElement;
let renderer: WebGLRenderer;
let scene: Scene;
let camera: OrthographicCamera;
let cameraControls: OrbitControls;
let loadingManager: LoadingManager;
let ambientLight: AmbientLight;
let directionalLight: DirectionalLight;
let clock: Clock;
let stats: Stats;
let gui: GUI;

// Game objects
let ground: Mesh;
let hero: GameObject;
let runePanel: HTMLDivElement;
let manaBar: HTMLDivElement;
let spellPanel: HTMLDivElement;

// Game state
const gameState: GameState = {
  heroPosition: new Vector3(0, 0.5, 0),
  heroMana: MAX_MANA,
  selectedRunes: [],
  activeSpell: null,
};

// Game objects collection for spells and effects
const gameObjects: GameObject[] = [];

// Available runes
const runes: Rune[] = [
  { name: "Fire", color: new Color(0xff0000), manaCost: 10 },
  { name: "Water", color: new Color(0x0000ff), manaCost: 10 },
  { name: "Projectile", color: new Color(0xffff00), manaCost: 5 },
  { name: "Area", color: new Color(0x00ff00), manaCost: 15 },
  { name: "Shield", color: new Color(0x888888), manaCost: 20 },
];

// Spells based on rune combinations
const spells: Spell[] = [
  {
    name: "Fireball",
    runeCombo: ["Fire", "Projectile"],
    manaCost: 15,
    effect: castFireball,
  },
  {
    name: "Water Jet",
    runeCombo: ["Water", "Projectile"],
    manaCost: 15,
    effect: castWaterJet,
  },
  {
    name: "Fire Nova",
    runeCombo: ["Fire", "Area"],
    manaCost: 25,
    effect: castFireNova,
  },
  {
    name: "Water Shield",
    runeCombo: ["Water", "Shield"],
    manaCost: 30,
    effect: castWaterShield,
  },
  {
    name: "Healing",
    runeCombo: ["Water", "Area"],
    manaCost: 25,
    effect: castHealing,
  },
];

// Game keyboard state
const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

init();
createUI();
animate();

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    scene = new Scene();
    scene.background = new Color(0x87ceeb); // Light blue sky
  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = new LoadingManager();

    loadingManager.onStart = () => {
      console.log("loading started");
    };
    loadingManager.onProgress = (url, loaded, total) => {
      console.log("loading in progress:");
      console.log(`${url} -> ${loaded} / ${total}`);
    };
    loadingManager.onLoad = () => {
      console.log("loaded!");
    };
    loadingManager.onError = () => {
      console.log("❌ error while loading");
    };
  }

  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight("white", 0.4);

    directionalLight = new DirectionalLight("white", 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;

    scene.add(ambientLight);
    scene.add(directionalLight);
  }

  // ===== 📦 GROUND =====
  {
    const groundGeometry = new PlaneGeometry(50, 50);
    const groundMaterial = new MeshStandardMaterial({
      color: 0x567d46, // Green grass color
      roughness: 0.8,
    });
    ground = new Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // ===== 🧙‍♂️ HERO =====
  {
    const heroGeometry = new BoxGeometry(1, 2, 1);
    const heroMaterial = new MeshStandardMaterial({
      color: 0x3366cc, // Blue for the hero
      roughness: 0.5,
    });
    const heroMesh = new Mesh(heroGeometry, heroMaterial);
    heroMesh.position.copy(gameState.heroPosition);
    heroMesh.castShadow = true;
    heroMesh.receiveShadow = true;

    hero = {
      mesh: heroMesh,
      update: (deltaTime: number) => {
        // Handle hero movement
        const moveVector = new Vector3(0, 0, 0);

        if (keys.up) moveVector.z -= HERO_MOVE_SPEED;
        if (keys.down) moveVector.z += HERO_MOVE_SPEED;
        if (keys.left) moveVector.x -= HERO_MOVE_SPEED;
        if (keys.right) moveVector.x += HERO_MOVE_SPEED;

        // Normalize diagonal movement
        if (moveVector.length() > 0) {
          moveVector
            .normalize()
            .multiplyScalar(HERO_MOVE_SPEED * deltaTime * 60);
          heroMesh.position.add(moveVector);
          gameState.heroPosition.copy(heroMesh.position);
        }

        // Mana regeneration
        gameState.heroMana = Math.min(
          MAX_MANA,
          gameState.heroMana + MANA_REGEN_RATE * deltaTime
        );
        updateManaBar();
      },
    };

    scene.add(heroMesh);
  }

  // ===== 🎥 CAMERA =====
  {
    // Isometric camera setup (orthographic)
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const cameraSize = 15;
    camera = new OrthographicCamera(
       -cameraSize * aspectRatio,
       cameraSize * aspectRatio,
       cameraSize,
       -cameraSize,
      -20,
      10000
    );

    // Position for isometric view
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas);
    cameraControls.enableDamping = true;
    cameraControls.dampingFactor = 0.05;
    cameraControls.screenSpacePanning = false;
    cameraControls.minDistance = 5;
    cameraControls.maxDistance = 30;
    cameraControls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera going below ground
    cameraControls.update();

    // Full screen
    window.addEventListener("dblclick", (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas);
      }
    });

    // Keyboard controls
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "w":
        case "ArrowUp":
          keys.up = true;
          break;
        case "s":
        case "ArrowDown":
          keys.down = true;
          break;
        case "a":
        case "ArrowLeft":
          keys.left = true;
          break;
        case "d":
        case "ArrowRight":
          keys.right = true;
          break;
      }
    });

    window.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "w":
        case "ArrowUp":
          keys.up = false;
          break;
        case "s":
        case "ArrowDown":
          keys.down = false;
          break;
        case "a":
        case "ArrowLeft":
          keys.left = false;
          break;
        case "d":
        case "ArrowRight":
          keys.right = false;
          break;
        case " ":
          castActiveSpell();
          break; // Space bar to cast active spell
      }
    });
  }

  // ===== 🪄 HELPERS =====
  {
    const axesHelper = new AxesHelper(5);
    axesHelper.visible = false;
    scene.add(axesHelper);

    const gridHelper = new GridHelper(50, 50, "teal", "darkgray");
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
  }

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock();
    stats = new Stats();
    document.body.appendChild(stats.dom);
  }

  // ==== 🐞 DEBUG GUI ====
  {
    gui = new GUI({ title: "🐞 Debug GUI", width: 300 });

    const heroFolder = gui.addFolder("Hero");
    heroFolder
      .add(gameState, "heroMana", 0, MAX_MANA, 5)
      .name("Mana")
      .onChange(updateManaBar);

    const cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(cameraControls, "autoRotate").name("Auto Rotate");

    gui.close();
  }
}

function createUI() {
  // Create mana bar
  manaBar = document.createElement("div");
  manaBar.className = "mana-bar";
  document.body.appendChild(manaBar);

  // Create rune panel
  runePanel = document.createElement("div");
  runePanel.className = "rune-panel";
  document.body.appendChild(runePanel);

  // Add runes to the panel
  runes.forEach((rune) => {
    const runeElement = document.createElement("div");
    runeElement.className = "rune";
    runeElement.textContent = rune.name;
    runeElement.style.backgroundColor = `#${rune.color.getHexString()}`;

    runeElement.addEventListener("click", () => selectRune(rune));

    runePanel.appendChild(runeElement);
  });

  // Create spell panel
  spellPanel = document.createElement("div");
  spellPanel.className = "spell-panel";
  document.body.appendChild(spellPanel);

  // Initial UI update
  updateManaBar();
  updateSpellPanel();
}

function selectRune(rune: Rune) {
  // Check if we can afford this rune
  if (gameState.heroMana < rune.manaCost) {
    console.log(`Not enough mana for ${rune.name} rune`);
    return;
  }

  // Add rune to selection (max 2 runes)
  if (gameState.selectedRunes.length < 2) {
    gameState.selectedRunes.push(rune.name);
    gameState.heroMana -= rune.manaCost;
    updateManaBar();

    // Check if we have a valid spell
    updateActiveSpell();
    updateSpellPanel();
  }
}

function updateActiveSpell() {
  // Check if our rune combination makes a valid spell
  gameState.activeSpell = null;

  if (gameState.selectedRunes.length === 2) {
    for (const spell of spells) {
      // Check if the selected runes match the spell (in any order)
      const hasAllRunes = spell.runeCombo.every((r) =>
        gameState.selectedRunes.includes(r)
      );
      const hasSameCount =
        spell.runeCombo.length === gameState.selectedRunes.length;

      if (hasAllRunes && hasSameCount) {
        gameState.activeSpell = spell.name;
        break;
      }
    }
  }
}

function castActiveSpell() {
  if (!gameState.activeSpell) return;

  // Find the spell and cast it
  const spell = spells.find((s) => s.name === gameState.activeSpell);
  if (spell) {
    spell.effect();

    // Reset selected runes
    gameState.selectedRunes = [];
    gameState.activeSpell = null;
    updateSpellPanel();
  }
}

function updateManaBar() {
  const percent = (gameState.heroMana / MAX_MANA) * 100;
  manaBar.innerHTML = `
    <div class="mana-fill" style="width: ${percent}%"></div>
    <div class="mana-text">Mana: ${Math.floor(
      gameState.heroMana
    )}/${MAX_MANA}</div>
  `;
}

function updateSpellPanel() {
  spellPanel.innerHTML = "";

  // Show selected runes
  const runesText = document.createElement("div");
  runesText.className = "selected-runes";
  runesText.textContent = `Selected Runes: ${gameState.selectedRunes.join(
    " + "
  )}`;
  spellPanel.appendChild(runesText);

  // Show active spell if any
  if (gameState.activeSpell) {
    const spellText = document.createElement("div");
    spellText.className = "active-spell";
    spellText.textContent = `Ready: ${gameState.activeSpell} (Spacebar to cast)`;
    spellPanel.appendChild(spellText);
  }

  // Add clear button
  if (gameState.selectedRunes.length > 0) {
    const clearButton = document.createElement("button");
    clearButton.textContent = "Clear Runes";
    clearButton.addEventListener("click", () => {
      gameState.selectedRunes = [];
      gameState.activeSpell = null;
      updateSpellPanel();
    });
    spellPanel.appendChild(clearButton);
  }
}

// Spell effects
function castFireball() {
  console.log("Casting Fireball!");

  const fireball = createSpellVisual(0xff0000, 0.5);
  const direction = new Vector3(1, 0, 0); // Default direction

  // Animation will happen in the update loop
  const projectile = {
    mesh: fireball,
    update: (deltaTime: number) => {
      // Move forward
      fireball.position.add(
        direction.clone().multiplyScalar(0.15 * deltaTime * 60)
      );

      // Remove after traveling some distance
      if (fireball.position.length() > 20) {
        scene.remove(fireball);
        return true; // Signals this object should be removed
      }
      return false;
    },
  };

  gameObjects.push(projectile);
}

function castWaterJet() {
  console.log("Casting Water Jet!");

  const waterJet = createSpellVisual(0x0088ff, 0.5);
  const direction = new Vector3(1, 0, 1).normalize();

  const projectile = {
    mesh: waterJet,
    update: (deltaTime: number) => {
      waterJet.position.add(
        direction.clone().multiplyScalar(0.2 * deltaTime * 60)
      );

      if (waterJet.position.length() > 20) {
        scene.remove(waterJet);
        return true;
      }
      return false;
    },
  };

  gameObjects.push(projectile);
}

function castFireNova() {
  console.log("Casting Fire Nova!");

  const novaMesh = createSpellVisual(0xff5500, 2);
  novaMesh.scale.y = 0.2; // Flatten it

  // Animation for expanding ring
  const nova = {
    mesh: novaMesh,
    update: (deltaTime: number) => {
      // Expand
      novaMesh.scale.x += 0.1 * deltaTime * 60;
      novaMesh.scale.z += 0.1 * deltaTime * 60;

      // Fade out
      if (novaMesh.material instanceof MeshStandardMaterial) {
        novaMesh.material.opacity -= 0.02 * deltaTime * 60;

        if (novaMesh.material.opacity <= 0) {
          scene.remove(novaMesh);
          return true;
        }
      }
      return false;
    },
  };

  gameObjects.push(nova);
}

function castWaterShield() {
  console.log("Casting Water Shield!");

  const shieldMesh = createSpellVisual(0x00aaff, 1.5);
  shieldMesh.position.copy(hero.mesh.position);

  // Make it transparent
  if (shieldMesh.material instanceof MeshStandardMaterial) {
    shieldMesh.material.opacity = 0.6;
  }

  // Shield follows hero and fades over time
  const shield = {
    mesh: shieldMesh,
    update: (deltaTime: number) => {
      // Follow hero
      shieldMesh.position.copy(hero.mesh.position);

      // Fade out slowly
      if (shieldMesh.material instanceof MeshStandardMaterial) {
        shieldMesh.material.opacity -= 0.005 * deltaTime * 60;

        if (shieldMesh.material.opacity <= 0) {
          scene.remove(shieldMesh);
          return true;
        }
      }
      return false;
    },
  };

  gameObjects.push(shield);
}

function castHealing() {
  console.log("Casting Healing!");

  const healMesh = createSpellVisual(0x00ff88, 1.5);
  healMesh.position.copy(hero.mesh.position);

  // Healing visual effect
  const healing = {
    mesh: healMesh,
    update: (deltaTime: number) => {
      // Follow hero
      healMesh.position.copy(hero.mesh.position);

      // Spiral upward and fade
      healMesh.position.y += 0.03 * deltaTime * 60;
      healMesh.rotation.y += 0.1 * deltaTime * 60;

      if (healMesh.material instanceof MeshStandardMaterial) {
        healMesh.material.opacity -= 0.02 * deltaTime * 60;

        if (healMesh.material.opacity <= 0) {
          scene.remove(healMesh);
          return true;
        }
      }
      return false;
    },
  };

  gameObjects.push(healing);
}

// Helper to create spell visuals
function createSpellVisual(color: number, size: number = 1): Mesh {
  const geometry = new BoxGeometry(size, size, size);
  const material = new MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8,
  });

  const mesh = new Mesh(geometry, material);
  mesh.position.copy(hero.mesh.position);
  mesh.castShadow = true;

  scene.add(mesh);
  return mesh;
}

function animate() {
  requestAnimationFrame(animate);

  stats.begin();

  // Calculate delta time
  const deltaTime = clock.getDelta();

  // Update hero
  if (hero.update) {
    hero.update(deltaTime);
  }

  // Update all game objects
  for (let i = gameObjects.length - 1; i >= 0; i--) {
    const gameObject = gameObjects[i];
    if (gameObject.update) {
      const shouldRemove = gameObject.update(deltaTime);
      if (shouldRemove) {
        gameObjects.splice(i, 1);
      }
    }
  }

  // Update controls
  cameraControls.update();

  // Resize renderer if needed
  if (resizeRendererToDisplaySize(renderer)) {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const cameraSize = 15;

    camera.left = -cameraSize * aspect;
    camera.right = cameraSize * aspect;
    camera.top = cameraSize;
    camera.bottom = -cameraSize;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
  stats.end();
}
