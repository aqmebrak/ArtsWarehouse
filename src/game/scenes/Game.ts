import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
	// Game variables
	player: any;
	joystick: any;
	cursorKeys: any;
	trees: any;
	rocks: any;
	walls: any;
	doors: any;
	playerDirection: string = 'down'; // Track player direction for animations
	isPlayerMoving: boolean = false;

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

		// Create trees group with physics
		this.trees = this.physics.add.staticGroup();

		// Create rocks group with physics
		this.rocks = this.physics.add.staticGroup();

		// Create walls group with physics
		this.walls = this.physics.add.staticGroup();

		// Create doors group with physics
		this.doors = this.physics.add.staticGroup();

		// Set world center
		const centerX = width / 2;
		const centerY = height / 2;

		// Define basecamp dimensions
		const basecampWidth = 224;
		const basecampHeight = 128;
		const clearPadding = 32; // Additional clear area around the basecamp

		// Calculate clear area boundaries
		const clearAreaLeft = centerX - (basecampWidth / 2) - clearPadding;
		const clearAreaRight = centerX + (basecampWidth / 2) + clearPadding;
		const clearAreaTop = centerY - (basecampHeight / 2) - clearPadding;
		const clearAreaBottom = centerY + (basecampHeight / 2) + clearPadding;

		// Create basecamp in the center
		this.createBasecamp(centerX, centerY);

		// Helper function to check if position is in the clear area
		const isInsideClearArea = (x, y) => {
			return x >= clearAreaLeft && x <= clearAreaRight &&
				y >= clearAreaTop && y <= clearAreaBottom;
		};

		// Place only a few trees randomly across the map
		const numberOfTrees = 60; // Adjust this number to control tree density
		const worldBoundsX = width;
		const worldBoundsY = height;

		for (let i = 0; i < numberOfTrees; i++) {
			// Generate random positions within the world bounds
			const x = Phaser.Math.Between(0, worldBoundsX);
			const y = Phaser.Math.Between(0, worldBoundsY);

			// Only place trees outside the clear rectangular area
			// If position is inside clear area, try again
			if (isInsideClearArea(x, y)) {
				i--; // Try again
				continue;
			}

			// Add some natural-looking variation to tree size
			const scale = Phaser.Math.FloatBetween(1, 1.4);
			const tree = this.trees.create(x, y, 'tree');
			tree.setScale(scale);
		}

		// Place some rocks across the map
		const numberOfRocks = 35; // Adjust as needed

		for (let i = 0; i < numberOfRocks; i++) {
			// Generate random positions within the world bounds
			const x = Phaser.Math.Between(0, worldBoundsX);
			const y = Phaser.Math.Between(0, worldBoundsY);

			// Only place rocks outside the clear rectangular area
			if (isInsideClearArea(x, y)) {
				i--; // Try again
				continue;
			}

			// Select a random rock type/frame from the spritesheet
			const frame = Phaser.Math.Between(0, 3); // Adjust based on actual frames in your spritesheet

			// Add some natural-looking variation to rock size
			const scale = Phaser.Math.FloatBetween(0.8, 1.2);
			const rock = this.rocks.create(x, y, 'rocks', frame);
			rock.setScale(scale);
		}

		// Create player at the center of the game world
		this.player = this.physics.add.sprite(centerX, centerY + 100, 'player');
		this.player.setCollideWorldBounds(true);
		this.player.setOrigin(0.5, 1.0); // Set origin to bottom center of the sprite
		this.player.setDepth(1); // Set depth to ensure player is above other objects
		this.player.setSize(16, 24); // Set player size to match sprite dimensions
		this.player.setOffset(16, 21); // Offset the hitbox to position it correctly relative to the visible sprite
		this.player.setAlpha(1); // Set player alpha to fully visible
		this.player.setTint(0xffffff); // Set player tint to white (no tint)
		this.player.setVisible(true); // Ensure player is visible	

		// Create player animations based on spritesheet rows with 6 frames per row
		// Row 1: Idle animations
		this.anims.create({
			key: 'idle-down',
			frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
			frameRate: 6,
			repeat: -1
		});

		// Row 2: Moving right (and flipped for left)
		this.anims.create({
			key: 'move-right',
			frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
			frameRate: 6,
			repeat: -1
		});

		this.anims.create({
			key: 'move-left',
			frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
			frameRate: 6,
			repeat: -1
		});

		// Row 3: Moving up
		this.anims.create({
			key: 'move-up',
			frames: this.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
			frameRate: 6,
			repeat: -1
		});

		// Row 4: Moving down
		this.anims.create({
			key: 'move-down',
			frames: this.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
			frameRate: 6,
			repeat: -1
		});

		// Enable collision between player and trees
		this.physics.add.collider(this.player, this.trees);

		// Enable collision between player and rocks
		this.physics.add.collider(this.player, this.rocks);

		// Enable collision between player and walls
		this.physics.add.collider(this.player, this.walls);

		// Add virtual joystick
		const rexPlugin = this.plugins.get('rexvirtualjoystickplugin') as any;
		this.joystick = rexPlugin.add(this, {
			x: 100,
			y: this.cameras.main.height - 100,
			radius: 60,
			base: this.add.circle(0, 0, 60, 0x888888, 0.5),
			thumb: this.add.circle(0, 0, 30, 0xcccccc, 0.8)
		});

		// Create cursor keys for desktop controls
		this.cursorKeys = this.input.keyboard?.createCursorKeys();
		// this.dumpJoyStickState();

		EventBus.emit('current-scene-ready', this);
	}

	createBasecamp(centerX: number, centerY: number) {
		// Define basecamp dimensions
		const basecampWidth = 224;
		const basecampHeight = 128;
		const wallThickness = 16;
		const doorWidth = 32;

		// Calculate basecamp boundaries
		const left = centerX - basecampWidth / 2;
		const right = centerX + basecampWidth / 2;
		const top = centerY - basecampHeight / 2;
		const bottom = centerY + basecampHeight / 2;

		// Create walls
		// Top wall (with door in the middle)
		// Left section - horizontal wall
		for (let x = left; x < centerX - doorWidth / 2; x += 48) {
			const width = Math.min(48, centerX - doorWidth / 2 - x);
			this.walls.create(x, top, 'wall').setOrigin(0, 0).refreshBody()
		}

		// Right section - horizontal wall
		for (let x = centerX + doorWidth / 2; x < right; x += 48) {
			const width = Math.min(48, right - x);
			this.walls.create(x, top, 'wall').setOrigin(0, 0).refreshBody()
		}

		// Bottom wall (with door in the middle)
		// Left section - horizontal wall
		for (let x = left; x < centerX - doorWidth / 2; x += 48) {
			const width = Math.min(48, centerX - doorWidth / 2 - x);
			this.walls.create(x, bottom - wallThickness, 'wall').setOrigin(0, 0).refreshBody()
		}

		// Right section - horizontal wall
		for (let x = centerX + doorWidth / 2; x < right; x += 48) {
			const width = Math.min(48, right - x);
			this.walls.create(x, bottom - wallThickness, 'wall').setOrigin(0, 0).refreshBody()
		}

		// Left wall (no door) - vertical wall
		for (let y = top + wallThickness; y < bottom - wallThickness; y += 48) {
			const height = Math.min(48, bottom - wallThickness - y);
			this.walls.create(left, y, 'wall-vertical').setOrigin(0, 0).refreshBody()
		}

		// Right wall (no door) - vertical wall
		for (let y = top + wallThickness; y < bottom - wallThickness; y += 48) {
			const height = Math.min(48, bottom - wallThickness - y);
			this.walls.create(right - wallThickness, y, 'wall-vertical').setOrigin(0, 0).refreshBody()
		}

		// Create doors
		this.createDoor(centerX, top + wallThickness / 2); // Top door
		this.createDoor(centerX, bottom - wallThickness / 2); // Bottom door

		// Add a label for the basecamp
		const text = this.add.text(centerX, top - 30, 'BASECAMP', {
			fontFamily: 'Arial',
			fontSize: '24px',
			color: '#000000'
		}).setOrigin(0.5);
	}

	createDoor(x, y) {
		const door = this.doors.create(x, y, 'door');
		// door.setOrigin(0.5);
		door.width = 32;
		door.refreshBody(); // Required after resize to update physics body
	}

	update() {
		// Player speed
		const speed = 200;

		// Reset velocity and track if player is moving
		this.player.setVelocity(0);
		this.isPlayerMoving = false;

		// Variables to track movement direction
		let velocityX = 0;
		let velocityY = 0;

		// Handle joystick input
		if (this.joystick.force > 0) {
			// Convert angle to radians and calculate velocity components
			const angleRad = Phaser.Math.DegToRad(this.joystick.angle);
			velocityX = Math.cos(angleRad) * speed;
			velocityY = Math.sin(angleRad) * speed;

			// Set player velocity based on joystick angle
			this.player.setVelocity(velocityX, velocityY);
			this.isPlayerMoving = true;
		}

		// Handle keyboard input as alternative
		if (this.cursorKeys.left.isDown) {
			velocityX = -speed;
			this.player.setVelocityX(-speed);
			this.isPlayerMoving = true;
		} else if (this.cursorKeys.right.isDown) {
			velocityX = speed;
			this.player.setVelocityX(speed);
			this.isPlayerMoving = true;
		}

		if (this.cursorKeys.up.isDown) {
			velocityY = -speed;
			this.player.setVelocityY(-speed);
			this.isPlayerMoving = true;
		} else if (this.cursorKeys.down.isDown) {
			velocityY = speed;
			this.player.setVelocityY(speed);
			this.isPlayerMoving = true;
		}

		// Determine animation based on direction and movement
		if (this.isPlayerMoving) {
			// Determine the primary direction of movement
			if (Math.abs(velocityX) > Math.abs(velocityY)) {
				// Moving horizontally
				if (velocityX > 0) {
					// Right movement
					this.playerDirection = 'right';
					this.player.setFlipX(false);
					this.player.anims.play('move-right', true);
				} else {
					// Left movement
					this.playerDirection = 'left';
					this.player.setFlipX(true); // Flip sprite horizontally for left movement
					this.player.anims.play('move-left', true);
				}
			} else {
				// Moving vertically
				if (velocityY > 0) {
					// Down movement
					this.playerDirection = 'down';
					this.player.setFlipX(false);
					this.player.anims.play('move-down', true);
				} else {
					// Up movement
					this.playerDirection = 'up';
					this.player.setFlipX(false);
					this.player.anims.play('move-up', true);
				}
			}
		} else {
			// Player is idle - play idle animation based on last direction
			this.player.anims.play('idle-down', true);
			// For now we just use the idle-down animation
			// Later we can add directional idle animations if needed
		}
	}
}