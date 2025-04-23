import type { Game } from '../scenes/Game';
import { Slime } from '../Entities/Slime';
import type { Player } from '../Entities/Player';

export class EnemyManager {
	private scene: Game;
	private slimeEntities: Slime[] = [];
	private slimeSpawnTimer: Phaser.Time.TimerEvent | undefined;
	private difficultyTimer: Phaser.Time.TimerEvent | undefined; // Timer to increase difficulty
	private spawnDelay: number = 5000; // Initial time between spawns in ms (increased for group spawning)
	private maxEnemies: number = 40; // Maximum number of enemies
	private slimesPerSpawn: number = 2; // Initial number of slimes per spawn
	private difficultyInterval: number = 30000; // Increase difficulty every 30 seconds

	constructor(scene: Game) {
		this.scene = scene;
	}

	// Start the enemy spawner and difficulty timer
	setupSpawner() {
		// Create a timer to spawn slime groups periodically
		this.slimeSpawnTimer = this.scene.time.addEvent({
			delay: this.spawnDelay,
			callback: this.spawnSlimeGroup, // Changed to spawn group
			callbackScope: this,
			loop: true
		});

		// Spawn an initial group
		this.spawnSlimeGroup();

		// Timer to increase difficulty over time
		this.difficultyTimer = this.scene.time.addEvent({
			delay: this.difficultyInterval,
			callback: this.increaseDifficulty,
			callbackScope: this,
			loop: true
		});
	}

	// Spawn a group of slime enemies
	spawnSlimeGroup() {
		const playerEntity = this.scene.getPlayerEntity();
		if (!playerEntity) return;

		// Check if max enemies limit is reached
		if (this.slimeEntities.filter((s) => s.getSprite()?.active).length >= this.maxEnemies) {
			return; // Don't spawn if limit is reached
		}

		const mapWidth = this.scene.physics.world.bounds.width;
		const mapHeight = this.scene.physics.world.bounds.height;

		// Define spawn areas near the corners of the map
		const spawnAreas = [
			{ x: 50, y: 50, width: 100, height: 100 }, // Top-left
			{ x: mapWidth - 150, y: 50, width: 100, height: 100 }, // Top-right
			{ x: 50, y: mapHeight - 150, width: 100, height: 100 }, // Bottom-left
			{ x: mapWidth - 150, y: mapHeight - 150, width: 100, height: 100 } // Bottom-right
		];

		// Select a random spawn area
		const area = Phaser.Utils.Array.GetRandom(spawnAreas);

		// Spawn multiple slimes in the chosen area
		for (let i = 0; i < this.slimesPerSpawn; i++) {
			// Calculate a random position within the selected area with slight offset
			const x =
				Phaser.Math.Between(area.x, area.x + area.width) + Phaser.Math.Between(-10, 10);
			const y =
				Phaser.Math.Between(area.y, area.y + area.height) + Phaser.Math.Between(-10, 10);

			// Ensure we don't exceed max enemies during a single spawn group
			if (this.slimeEntities.filter((s) => s.getSprite()?.active).length < this.maxEnemies) {
				const slime = new Slime(this.scene, x, y, playerEntity);
				this.slimeEntities.push(slime);
			} else {
				break; // Stop spawning if max limit reached
			}
		}
	}

	// Increase difficulty by adding more slimes per spawn or reducing delay
	increaseDifficulty() {
		this.slimesPerSpawn += 1; // Increase slimes per group
		// Optionally, decrease spawn delay slightly, but be careful not to make it too fast
		// this.spawnDelay = Math.max(1000, this.spawnDelay - 500);
		// this.slimeSpawnTimer?.reset({ delay: this.spawnDelay, callback: this.spawnSlimeGroup, callbackScope: this, loop: true });

		console.log(
			`Difficulty increased: Spawning ${this.slimesPerSpawn} slimes every ${this.spawnDelay / 1000}s`
		);
	}

	// Update all slime entities
	update() {
		// Filter out inactive slimes before updating
		this.slimeEntities = this.slimeEntities.filter((slime) => slime.getSprite()?.active);
		this.slimeEntities.forEach((slime) => slime.update());
	}

	// Set up collision handling for slimes
	setupCollisions() {
		if (!this.scene.enemies || !this.scene.doors) return;

		// Set up slime collisions with environment and other entities
		this.scene.physics.add.collider(this.scene.enemies, this.scene.trees);
		this.scene.physics.add.collider(this.scene.enemies, this.scene.rocks);
		this.scene.physics.add.collider(this.scene.enemies, this.scene.walls);
		this.scene.physics.add.collider(this.scene.enemies, this.scene.doors); // Slimes collide with doors
		this.scene.physics.add.collider(this.scene.enemies, this.scene.enemies); // Slimes collide with each other

		if (this.scene.towers) {
			this.scene.physics.add.collider(this.scene.enemies, this.scene.towers); // Enemies collide with towers
		}
	}

	// Handle player attacking a slime
	handlePlayerAttack(targetSprite: Phaser.Physics.Arcade.Sprite) {
		const playerEntity = this.scene.getPlayerEntity();
		if (!playerEntity) return;

		// Find the slime entity associated with this sprite
		const attackedSlime = this.findSlimeBySprite(targetSprite);

		if (attackedSlime) {
			// Apply damage from player to slime
			attackedSlime.takeDamage(playerEntity.getAttackDamage());

			// If the slime was destroyed, remove it from our array (handled in update now)
			// No need to drop chicken here, Slime.destroy handles it
		}
	}

	// Get all active slime entities
	getActiveSlimes(): Slime[] {
		return this.slimeEntities.filter((slime) => slime.getSprite()?.active);
	}

	// Find a slime by its sprite
	findSlimeBySprite(sprite: Phaser.GameObjects.GameObject): Slime | undefined {
		return this.slimeEntities.find((slime) => slime.getSprite() === sprite);
	}

	// Clean up resources when scene is shutdown
	shutdown() {
		if (this.slimeSpawnTimer) {
			this.slimeSpawnTimer.remove();
		}
		if (this.difficultyTimer) {
			this.difficultyTimer.remove(); // Stop difficulty timer
		}

		this.slimeEntities.forEach((slime) => {
			if (slime.getSprite()?.active) {
				slime.destroy(); // Use slime's own destroy method
			}
		});

		this.slimeEntities = [];
	}
}
