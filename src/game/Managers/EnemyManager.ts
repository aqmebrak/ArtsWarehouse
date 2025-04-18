import type { Game } from '../scenes/Game';
import { Slime } from '../Entities/Slime';
import type { Player } from '../Entities/Player';

export class EnemyManager {
    private scene: Game;
    private slimeEntities: Slime[] = [];
    private slimeSpawnTimer: Phaser.Time.TimerEvent | undefined;
    private spawnDelay: number = 1200; // Time between spawns in ms
    private maxEnemies: number = 40;  // Maximum number of enemies to prevent overwhelming the player

    constructor(scene: Game) {
        this.scene = scene;
    }

    // Start the enemy spawner
    setupSpawner() {
        // Create a timer to spawn slimes periodically
        this.slimeSpawnTimer = this.scene.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnSlime,
            callbackScope: this,
            loop: true
        });

        // Spawn an initial slime
        this.spawnSlime();
    }

    // Spawn a single slime enemy
    spawnSlime() {
        const playerEntity = this.scene.getPlayerEntity();
        if (!playerEntity) return;

        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Define spawn areas near the corners of the map
        const spawnAreas = [
            { x: 50, y: 50, width: 100, height: 100 }, // Top-left
            { x: width - 150, y: 50, width: 100, height: 100 }, // Top-right
            { x: 50, y: height - 150, width: 100, height: 100 }, // Bottom-left
            { x: width - 150, y: height - 150, width: 100, height: 100 } // Bottom-right
        ];

        // Select a random spawn area
        const area = Phaser.Utils.Array.GetRandom(spawnAreas);

        // Calculate a random position within the selected area
        const x = Phaser.Math.Between(area.x, area.x + area.width);
        const y = Phaser.Math.Between(area.y, area.y + area.height);

        // Create new slime and add to the collection
        const slime = new Slime(this.scene, x, y, playerEntity);
        this.slimeEntities.push(slime);

        // Limit the number of slimes
        if (this.slimeEntities.length > this.maxEnemies) {
            const oldestSlime = this.slimeEntities.shift();
            if (oldestSlime) {
                oldestSlime.destroy();
            }
        }
    }

    // Update all slime entities
    update() {
        this.slimeEntities.forEach(slime => slime.update());
    }

    // Set up collision handling for slimes
    setupCollisions() {
        if (!this.scene.enemies) return;

        // Set up slime collisions with environment and other entities
        this.scene.physics.add.collider(this.scene.enemies, this.scene.trees);
        this.scene.physics.add.collider(this.scene.enemies, this.scene.rocks);
        this.scene.physics.add.collider(this.scene.enemies, this.scene.walls);
        this.scene.physics.add.collider(this.scene.enemies, this.scene.doors);
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
        const attackedSlime = this.slimeEntities.find(
            slime => slime.getSprite() === targetSprite
        );

        if (attackedSlime) {
            // Apply damage from player to slime
            attackedSlime.takeDamage(playerEntity.getAttackDamage());

            // If the slime was destroyed, remove it from our array
            if (!targetSprite.active) {
                this.slimeEntities = this.slimeEntities.filter(
                    slime => slime.getSprite() !== targetSprite
                );

                // Get the ResourceManager to drop a chicken
                const resourceManager = this.scene.getResourceManager();
                if (resourceManager) {
                    resourceManager.dropChicken(targetSprite.x, targetSprite.y);
                }
            }
        }
    }

    // Get all active slime entities
    getActiveSlimes(): Slime[] {
        return this.slimeEntities.filter(slime => slime.getSprite()?.active);
    }

    // Find a slime by its sprite
    findSlimeBySprite(sprite: Phaser.GameObjects.GameObject): Slime | undefined {
        return this.slimeEntities.find(slime => slime.getSprite() === sprite);
    }

    // Clean up resources when scene is shutdown
    shutdown() {
        if (this.slimeSpawnTimer) {
            this.slimeSpawnTimer.remove();
        }

        this.slimeEntities.forEach(slime => {
            if (slime.getSprite()?.active) {
                slime.getSprite().destroy();
            }
        });

        this.slimeEntities = [];
    }
}