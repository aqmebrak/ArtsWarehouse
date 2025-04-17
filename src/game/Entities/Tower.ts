import type { Game } from '../scenes/Game';
import type { Slime } from './Slime';
import { Projectile } from './Projectile';

export class Tower {
    private scene: Game;
    private towerSprite: Phaser.Physics.Arcade.Sprite;
    private range: number = 100; // Range for detecting enemies
    private fireRate: number = 800; // Milliseconds between shots
    private lastFired: number = 0;
    private towerDamage: number = 5; // Damage per projectile

    constructor(scene: Game, x: number, y: number) {
        this.scene = scene;

        // Create the tower sprite (using 'barrel' image)
        this.towerSprite = this.scene.physics.add.sprite(x, y, 'barrel');

        // Add to the scene's towers *physics* group for collision
        if (this.scene.towers && this.scene.towers instanceof Phaser.Physics.Arcade.Group) {
            this.scene.towers.add(this.towerSprite);
        }

        this.setupPhysics();
    }

    setupPhysics() {
        this.towerSprite.setImmovable(true); // Towers don't move
        this.towerSprite.setDepth(1); // Ensure it's above ground
        this.towerSprite.body?.setSize(this.towerSprite.width * 0.8, this.towerSprite.height * 0.8); // Adjust hitbox if needed
        this.towerSprite.refreshBody(); // Apply physics changes
    }

    update(time: number, delta: number) {
        // Check fire cooldown
        if (time > this.lastFired + this.fireRate) {
            this.findAndShootTarget(time);
        }
    }

    findAndShootTarget(time: number) {
        let closestEnemy: Slime | null = null;
        let minDistanceSq = this.range * this.range; // Use squared distance for efficiency

        // Access slimes directly from the Game scene's helper method
        const enemies = this.scene.getSlimeEntities();

        enemies.forEach(enemy => {
            if (enemy.getSprite().active) {
                const distanceSq = Phaser.Math.Distance.Squared(
                    this.towerSprite.x, this.towerSprite.y,
                    enemy.getSprite().x, enemy.getSprite().y
                );

                if (distanceSq < minDistanceSq) {
                    minDistanceSq = distanceSq;
                    closestEnemy = enemy;
                }
            }
        });

        if (closestEnemy) {
            this.fire(closestEnemy, time);
        }
    }

    fire(target: Slime, time: number) {
        this.lastFired = time;

        // Create a projectile aimed at the target's current position
        // The projectile will continue in a straight line
        new Projectile(
            this.scene,
            this.towerSprite.x,
            this.towerSprite.y,
            target.getSprite().x,
            target.getSprite().y,
            this.towerDamage // Pass damage to projectile
        );

        // Optional: Add firing animation or sound effect here
        // e.g., this.scene.sound.play('tower_shoot');
    }

    getSprite() {
        return this.towerSprite;
    }
}
