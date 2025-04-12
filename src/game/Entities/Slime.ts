import type { Game } from '../scenes/Game';
import type { Player } from './Player';

export class Slime {
    private scene: Game;
    private slime: Phaser.Physics.Arcade.Sprite;
    private target: Player;
    private speed: number = 40;
    private health: number = 10; // Initialize slime health to 10 points

    constructor(scene: Game, x: number, y: number, target: Player) {
        this.scene = scene;
        this.target = target;

        // Create the slime sprite
        this.slime = this.scene.physics.add.sprite(x, y, 'slime');

        // Add the sprite to the enemies physics group in the scene
        if (scene.enemies && scene.enemies instanceof Phaser.Physics.Arcade.Group) {
            scene.enemies.add(this.slime);
        }

        this.setupPhysics();
        this.createAnimations();
    }

    setupPhysics() {
        // Set up physics properties
        this.slime.setCollideWorldBounds(true);
        this.slime.setSize(16, 16);
        this.slime.setOffset(8, 10);
        this.slime.setDepth(1);
        this.slime.setBounce(0.2);
        this.slime.setFriction(0.2);
    }

    createAnimations() {
        if (!this.scene.anims.exists('slime-move')) {
            // Create animation for slime movement
            this.scene.anims.create({
                key: 'slime-move',
                frames: this.scene.anims.generateFrameNumbers('slime', { start: 0, end: 3 }),
                frameRate: 4,
                repeat: -1
            });
        }

        // Start playing the animation
        this.slime.anims.play('slime-move', true);
    }

    update() {
        if (!this.slime.active || this.health <= 0) return;

        // Get target position
        const targetSprite = this.target.getSprite();

        // Calculate direction to player
        const directionX = targetSprite.x - this.slime.x;
        const directionY = targetSprite.y - this.slime.y;

        // Normalize the direction vector
        const length = Math.sqrt(directionX * directionX + directionY * directionY);

        if (length > 0) {
            const normalizedX = directionX / length;
            const normalizedY = directionY / length;

            // Move toward the player
            this.slime.setVelocity(
                normalizedX * this.speed,
                normalizedY * this.speed
            );

            // Flip the sprite based on movement direction
            if (directionX < 0) {
                this.slime.setFlipX(true);
            } else {
                this.slime.setFlipX(false);
            }
        }
    }

    getSprite() {
        return this.slime;
    }

    takeDamage(amount: number) {
        this.health -= amount;
        
        // Flash the slime red when damaged
        this.slime.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.slime.clearTint();
        });
        
        // If health drops to zero or below, destroy the slime
        if (this.health <= 0) {
            this.destroy();
        }
    }

    getHealth() {
        return this.health;
    }

    destroy() {
        this.slime.destroy();
    }
}