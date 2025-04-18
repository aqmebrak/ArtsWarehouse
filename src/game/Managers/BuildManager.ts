import type { Game } from '../scenes/Game';
import { Tower } from '../Entities/Tower';

export class BuildManager {
    private scene: Game;
    private towerEntities: Tower[] = [];

    constructor(scene: Game) {
        this.scene = scene;
    }

    createBuildSpots(basecampDimensions: { width: number, height: number, centerX: number, centerY: number }) {
        const halfWidth = basecampDimensions.width / 2;
        const halfHeight = basecampDimensions.height / 2;
        const cornerOffset = 16; // Offset from the exact corner

        const positions = [
            { x: basecampDimensions.centerX - halfWidth - cornerOffset, y: basecampDimensions.centerY - halfHeight - cornerOffset }, // Top-left
            { x: basecampDimensions.centerX + halfWidth + cornerOffset, y: basecampDimensions.centerY - halfHeight - cornerOffset }, // Top-right
            { x: basecampDimensions.centerX - halfWidth - cornerOffset, y: basecampDimensions.centerY + halfHeight + cornerOffset }, // Bottom-left
            { x: basecampDimensions.centerX + halfWidth + cornerOffset, y: basecampDimensions.centerY + halfHeight + cornerOffset }  // Bottom-right
        ];

        positions.forEach(pos => {
            const spot = this.scene.buildSpots?.create(pos.x, pos.y, 'blue_tile');
            if (spot) {
                spot.setData('isBuilt', false); // Mark spot as not built initially
                spot.refreshBody(); // Apply physics changes
            }
        });
    }

    // Handle building towers at build spots
    handleBuildAttempt(playerSprite: Phaser.GameObjects.GameObject, buildSpotSprite: Phaser.GameObjects.GameObject) {
        // Get the resource manager from the scene
        const resourceManager = this.scene.getResourceManager();
        if (!resourceManager) return;

        // Cast to specific types
        const spot = buildSpotSprite as Phaser.Physics.Arcade.Sprite;
        const towerCost = resourceManager.getTowerCost();

        // Check if a tower is already built here and if player has enough chickens
        if (!spot.getData('isBuilt') && resourceManager.getChickenCount() >= towerCost) {
            // Deduct cost
            resourceManager.removeChicken(towerCost);

            // Mark spot as built
            spot.setData('isBuilt', true);
            spot.setVisible(false); // Hide the blue tile
            spot.disableBody(true, true); // Disable physics and hide

            // Create the tower entity
            const tower = new Tower(this.scene, spot.x, spot.y);
            this.towerEntities.push(tower); // Add to our list for updates

            // Optional: Add a build sound effect
            // this.scene.sound.play('build_sound');
        }
    }

    // Update all towers
    update(time: number, delta: number) {
        this.towerEntities.forEach(tower => tower.update(time, delta));
    }

    // Get the tower entities
    getTowerEntities(): Tower[] {
        return this.towerEntities;
    }

    // Set up collision between projectiles and enemies
    setupProjectileCollisions() {
        if (this.scene.projectiles && this.scene.enemies) {
            this.scene.physics.add.overlap(
                this.scene.projectiles,
                this.scene.enemies,
                this.handleProjectileHit,
                null,
                this
            );
        }
    }

    // Handle projectile hitting an enemy
    private handleProjectileHit(projectileSprite: Phaser.GameObjects.GameObject, enemySprite: Phaser.GameObjects.GameObject) {
        // Get the enemy manager from the scene
        const enemyManager = this.scene.getEnemyManager();
        if (!enemyManager) return;

        // Find the Slime instance associated with this sprite
        const hitSlime = enemyManager.findSlimeBySprite(enemySprite);

        if (hitSlime && projectileSprite.active) {
            // Get damage from projectile data
            const damage = projectileSprite.getData('damage') as number || 0;

            if (damage > 0) {
                hitSlime.takeDamage(damage);
            }

            // Destroy the projectile
            projectileSprite.destroy();
        }
    }
}