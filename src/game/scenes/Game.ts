import type VirtualJoyStick from 'phaser3-rex-plugins/plugins/input/virtualjoystick/VirtualJoyStick';

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Player } from '../Entities/Player';
import { Tree } from '../Entities/Tree';
import { Rock } from '../Entities/Rock';
import { Basecamp } from '../Entities/Basecamp';
import { BuildManager } from '../Managers/BuildManager';
import { EnemyManager } from '../Managers/EnemyManager';
import { ResourceManager } from '../Managers/ResourceManager';

export class Game extends Scene {
	// Game variables
	private playerEntity: Player | undefined;
	joystick: VirtualJoyStick | undefined;
	cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

	// Entity collections
	private treeEntities: Tree[] = [];
	private rockEntities: Rock[] = [];
	private basecamp: Basecamp | undefined;

	// Managers
	private buildManager: BuildManager | undefined;
	private enemyManager: EnemyManager | undefined;
	private resourceManager: ResourceManager | undefined;

	// Physics groups for collision detection - these need to be public so entities can access them
	trees: Phaser.Physics.Arcade.StaticGroup | undefined;
	rocks: Phaser.Physics.Arcade.StaticGroup | undefined;
	walls: Phaser.Physics.Arcade.StaticGroup | undefined;
	doors: Phaser.Physics.Arcade.StaticGroup | undefined;
	enemies: Phaser.Physics.Arcade.Group | undefined;
	chickens: Phaser.Physics.Arcade.Group | undefined;
	buildSpots: Phaser.Physics.Arcade.StaticGroup | undefined;
	towers: Phaser.Physics.Arcade.Group | undefined;
	projectiles: Phaser.Physics.Arcade.Group | undefined;

	// UI elements
	private healthText: Phaser.GameObjects.Text | undefined;

	constructor() {
		super('Game');
	}

	create() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Add grass background with tiling
		const backgroundImage = this.add.tileSprite(0, 0, width * 2, height * 2, 'grass');
		backgroundImage.setOrigin(0, 0);
		backgroundImage.setPosition(0, 0);

		// Create physics groups
		this.initPhysicsGroups();

		// Set world center
		const centerX = width / 2;
		const centerY = height / 2;

		// Create basecamp
		this.basecamp = new Basecamp(this, centerX, centerY);
		const basecampDimensions = this.basecamp.getDimensions();

		// Create player
		this.playerEntity = new Player(this, centerX, centerY);

		// Initialize managers
		this.initManagers();

		// Place build spots at basecamp corners
		this.buildManager?.createBuildSpots(basecampDimensions);

		// Calculate clear area around basecamp
		const clearPadding = 32;
		const clearAreaLeft = centerX - (basecampDimensions.width / 2) - clearPadding;
		const clearAreaRight = centerX + (basecampDimensions.width / 2) + clearPadding;
		const clearAreaTop = centerY - (basecampDimensions.height / 2) - clearPadding;
		const clearAreaBottom = centerY + (basecampDimensions.height / 2) + clearPadding;

		// Helper function to check if position is in the clear area
		const isInsideClearArea = (x: number, y: number) => {
			return x >= clearAreaLeft && x <= clearAreaRight &&
				y >= clearAreaTop && y <= clearAreaBottom;
		};

		// Place environment objects
		this.createEnvironment(width, height, isInsideClearArea);

		// Set up collisions
		this.setupCollisions();

		// Set up virtual joystick
		this.setupJoystick();

		EventBus.emit('current-scene-ready', this);

		// Add player attack event listener
		this.events.on('player-attack', this.handlePlayerAttack, this);

		// Add health display
		this.createHealthDisplay();
	}

	// Initialize all physics groups
	private initPhysicsGroups() {
		this.trees = this.physics.add.staticGroup();
		this.rocks = this.physics.add.staticGroup();
		this.walls = this.physics.add.staticGroup();
		this.doors = this.physics.add.staticGroup();
		this.enemies = this.physics.add.group();
		this.chickens = this.physics.add.group();
		this.buildSpots = this.physics.add.staticGroup();
		this.towers = this.physics.add.group();
		this.projectiles = this.physics.add.group({
			classType: Phaser.Physics.Arcade.Sprite,
			runChildUpdate: true
		});
	}

	// Initialize manager classes
	private initManagers() {
		// Create managers
		this.buildManager = new BuildManager(this);
		this.enemyManager = new EnemyManager(this);
		this.resourceManager = new ResourceManager(this);

		// Start enemy spawning
		this.enemyManager.setupSpawner();
	}

	// Set up collision detection between entities
	private setupCollisions() {
		if (!this.playerEntity) return;

		const playerSprite = this.playerEntity.getSprite();

		// Enable collisions for the player with environment
		if (this.trees) this.physics.add.collider(playerSprite, this.trees);
		if (this.rocks) this.physics.add.collider(playerSprite, this.rocks);
		if (this.walls) this.physics.add.collider(playerSprite, this.walls);

		// Set up chicken collection overlap
		this.resourceManager?.setupCollections();

		// Set up build spot interaction
		if (this.buildSpots) {
			this.physics.add.overlap(
				playerSprite,
				this.buildSpots,
				(player, buildSpot) => this.buildManager?.handleBuildAttempt(player, buildSpot),
				undefined,
				this
			);
		}

		// Set up slime collisions
		if (this.enemyManager) this.enemyManager.setupCollisions();

		// Set up projectile collisions
		this.buildManager?.setupProjectileCollisions();
	}

	// Set up the virtual joystick
	private setupJoystick() {
		const rexPlugin = this.plugins.get('rexVirtualJoystick');
		if (rexPlugin) {
			// eslint-disable-next-line
			// @ts-ignore
			this.joystick = rexPlugin.add(this, {
				x: 0,
				y: 0,
				radius: 30,
				base: this.add.circle(0, 0, 30, 0x888888, 0.5).setDepth(101),
				thumb: this.add.circle(0, 0, 15, 0xcccccc, 0.8).setDepth(101),
				visible: false
			});
			this.joystick?.setScrollFactor(0);
		}

		// Create cursor keys for desktop controls
		this.cursorKeys = this.input.keyboard?.createCursorKeys();

		// Handle joystick visibility
		this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			if (pointer.x >= 0 && pointer.x <= this.cameras.main.width &&
				pointer.y >= 0 && pointer.y <= this.cameras.main.height) {
				this.joystick?.setPosition(pointer.x, pointer.y);
				this.joystick?.setVisible(true);
				this.joystick?.setEnable(true);
			}
		});

		this.input.on('pointerup', () => {
			this.joystick?.setVisible(false);
			this.joystick?.setEnable(false);
		});
	}

	// Create the player health display
	private createHealthDisplay() {
		this.healthText = this.add.text(16, 16, 'Health: 1000', {
			fontSize: '14px',
			color: '#ffffff',
			backgroundColor: '#000000',
			padding: { x: 4, y: 4 }
		});
		this.healthText.setScrollFactor(0);
		this.healthText.setDepth(100);
	}

	createEnvironment(width: number, height: number, isInsideClearArea: (x: number, y: number) => boolean) {
		// Place trees randomly across the map
		const numberOfTrees = 25;
		const worldBoundsX = width;
		const worldBoundsY = height;

		for (let i = 0; i < numberOfTrees; i++) {
			// Generate random positions within the world bounds
			const x = Phaser.Math.Between(0, worldBoundsX);
			const y = Phaser.Math.Between(0, worldBoundsY);

			// Only place trees outside the clear area
			if (isInsideClearArea(x, y)) {
				i--;
				continue;
			}

			// Create tree entity and add to collection
			const treeEntity = new Tree(this, x, y);
			this.treeEntities.push(treeEntity);
		}

		// Place rocks randomly across the map
		const numberOfRocks = 15;
		for (let i = 0; i < numberOfRocks; i++) {
			const x = Phaser.Math.Between(0, worldBoundsX);
			const y = Phaser.Math.Between(0, worldBoundsY);

			if (isInsideClearArea(x, y)) {
				i--;
				continue;
			}

			const frame = Phaser.Math.Between(0, 3);

			// Create rock entity and add to collection
			const rockEntity = new Rock(this, x, y, frame);
			this.rockEntities.push(rockEntity);
		}
	}

	update(time: number, delta: number) {
		// Update the player entity
		if (this.playerEntity && this.healthText) {
			this.playerEntity.update();

			// Update health display
			this.healthText.setText(`Health: ${this.playerEntity.getHealth()}`);
		}

		// Update enemy manager
		this.enemyManager?.update();

		// Update build manager (towers)
		this.buildManager?.update(time, delta);
	}

	handlePlayerAttack(targetSprite: Phaser.Physics.Arcade.Sprite) {
		this.enemyManager?.handlePlayerAttack(targetSprite);
	}

	// --- Accessor methods for managers ---
	getPlayerEntity(): Player | undefined {
		return this.playerEntity;
	}

	getEnemyManager(): EnemyManager | undefined {
		return this.enemyManager;
	}

	getBuildManager(): BuildManager | undefined {
		return this.buildManager;
	}

	getResourceManager(): ResourceManager | undefined {
		return this.resourceManager;
	}
}
