import type { Game } from '../scenes/Game';
import type { Player } from './Player';

export class Slime {
    private scene: Game;
    private slime: Phaser.Physics.Arcade.Sprite;
    private target: Player;
    private speed: number = 40;
    private health: number = 10; // Initialize slime health to 10 points

    // Attack properties
    private attackRange: number = 10; // Much lower than player's 24
    private attackDamage: number = 5; // Damage per attack as requested
    private attackCooldown: number = 1500; // 1.5 seconds between attacks
    private canAttack: boolean = true; // Flag to track if slime can attack
    private lastAttackTime: number = 0; // Timestamp of the last attack
    private isAttacking: boolean = false; // Flag to indicate if currently attacking

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

        // Calculate distance to player
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);

        // Check if within attack range
        if (distance <= this.attackRange) {
            this.checkForAttack();
        } else {
            // Move toward the player if not in attack range
            this.moveTowardPlayer(directionX, directionY, distance);
        }
    }

    private moveTowardPlayer(directionX: number, directionY: number, length: number) {
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

    private checkForAttack() {
        // Don't attack if already attacking
        if (this.isAttacking) return;

        // Check cooldown
        const currentTime = this.scene.time.now;
        if (!this.canAttack && currentTime - this.lastAttackTime >= this.attackCooldown) {
            this.canAttack = true;
        }

        // If can attack, do it
        if (this.canAttack) {
            this.attack();
        }
    }

    private attack() {
        // Set attacking state and start cooldown
        this.canAttack = false;
        this.isAttacking = true;
        this.lastAttackTime = this.scene.time.now;

        // Flash slime to indicate attack
        this.slime.setTint(0x00ff00); // Green tint for attack

        // Stop movement during attack
        this.slime.setVelocity(0, 0);

        // Deal damage to player after a short delay (simulating attack animation)
        this.scene.time.delayedCall(300, () => {
            // Only damage player if still active and in range
            if (this.slime.active) {
                const targetSprite = this.target.getSprite();
                const distance = Phaser.Math.Distance.Between(
                    this.slime.x, this.slime.y,
                    targetSprite.x, targetSprite.y
                );

                if (distance <= this.attackRange) {
                    this.target.takeDamage(this.attackDamage);
                }
            }

            // Clear tint and reset attacking state
            this.slime.clearTint();
            this.isAttacking = false;
        });
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

    getAttackRange() {
        return this.attackRange;
    }

    getAttackDamage() {
        return this.attackDamage;
    }
}