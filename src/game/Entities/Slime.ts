import type { Game } from '../scenes/Game';
import type { Player } from './Player';
import type { Door } from './Door'; // Import Door type

export class Slime {
    private scene: Game;
    private slime: Phaser.Physics.Arcade.Sprite;
    private target: Player | Door | null = null; // Target can be Player or Door
    private speed: number = 40;
    private health: number = 10; // Initialize slime health to 10 points

    // Attack properties
    private attackRange: number = 10; // Much lower than player's 24
    private attackDamage: number = 5; // Damage per attack as requested
    private attackCooldown: number = 1500; // 1.5 seconds between attacks
    private canAttack: boolean = true; // Flag to track if slime can attack
    private lastAttackTime: number = 0; // Timestamp of the last attack
    private isAttacking: boolean = false; // Flag to indicate if currently attacking
    private currentTargetType: 'player' | 'door' | null = null;

    constructor(scene: Game, x: number, y: number, player: Player) {
        this.scene = scene;
        // Initial target is the player
        this.target = player;
        this.currentTargetType = 'player';

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

        // Determine the primary target (player)
        const playerEntity = this.scene.getPlayerEntity();
        if (!playerEntity) return; // Should not happen in Game scene
        const playerSprite = playerEntity.getSprite();

        // Find the closest door if any
        const closestDoor = this.findClosestDoor();

        // Decide target: Prioritize attacking a close door over the player
        let targetX: number;
        let targetY: number;
        let targetDistance: number;
        let targetIsDoor = false;

        if (closestDoor) {
            const doorSprite = closestDoor.getSprite();
            const distanceToDoor = Phaser.Math.Distance.Between(this.slime.x, this.slime.y, doorSprite.x, doorSprite.y);

            // If door is within attack range or slightly beyond, target it
            if (distanceToDoor <= this.attackRange + 5) { // Target door if close
                targetX = doorSprite.x;
                targetY = doorSprite.y;
                targetDistance = distanceToDoor;
                this.target = closestDoor;
                this.currentTargetType = 'door';
                targetIsDoor = true;
            } else {
                // Otherwise, target player
                targetX = playerSprite.x;
                targetY = playerSprite.y;
                targetDistance = Phaser.Math.Distance.Between(this.slime.x, this.slime.y, targetX, targetY);
                this.target = playerEntity;
                this.currentTargetType = 'player';
            }
        } else {
            // No doors, target player
            targetX = playerSprite.x;
            targetY = playerSprite.y;
            targetDistance = Phaser.Math.Distance.Between(this.slime.x, this.slime.y, targetX, targetY);
            this.target = playerEntity;
            this.currentTargetType = 'player';
        }

        // Calculate direction to target
        const directionX = targetX - this.slime.x;
        const directionY = targetY - this.slime.y;

        // Check if within attack range of the current target
        if (targetDistance <= this.attackRange) {
            this.checkForAttack();
        } else {
            // Move toward the target if not in attack range
            this.moveTowardTarget(directionX, directionY, targetDistance);
        }
    }

    // Helper to find the closest active door
    private findClosestDoor(): Door | null {
        const basecamp = this.scene.getBaseCamp();
        if (!basecamp) return null;

        const doors = basecamp.getDoors();
        let closestDoor: Door | null = null;
        let minDistance = Infinity;

        for (const door of doors) {
            if (!door.isDestroyed()) {
                const doorSprite = door.getSprite();
                const distance = Phaser.Math.Distance.Between(this.slime.x, this.slime.y, doorSprite.x, doorSprite.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestDoor = door;
                }
            }
        }
        return closestDoor;
    }

    private moveTowardTarget(directionX: number, directionY: number, length: number) {
        if (length > 0) {
            const normalizedX = directionX / length;
            const normalizedY = directionY / length;

            // Move toward the target
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
        // Don't attack if already attacking or no target
        if (this.isAttacking || !this.target) return;

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
        if (!this.target) return; // Need a target to attack

        // Set attacking state and start cooldown
        this.canAttack = false;
        this.isAttacking = true;
        this.lastAttackTime = this.scene.time.now;

        // Flash slime to indicate attack
        this.slime.setTint(0x00ff00); // Green tint for attack

        // Stop movement during attack
        this.slime.setVelocity(0, 0);

        // Deal damage after a short delay
        this.scene.time.delayedCall(300, () => {
            // Only damage if still active and target exists
            if (this.slime.active && this.target) {
                let targetSprite: Phaser.GameObjects.Sprite | null = null;

                if (this.currentTargetType === 'player' && this.target instanceof Player) {
                    targetSprite = this.target.getSprite();
                } else if (this.currentTargetType === 'door' && this.target instanceof Door) {
                    targetSprite = this.target.getSprite();
                }

                if (targetSprite) {
                    const distance = Phaser.Math.Distance.Between(
                        this.slime.x, this.slime.y,
                        targetSprite.x, targetSprite.y
                    );

                    if (distance <= this.attackRange) {
                        // Check target type and call appropriate takeDamage method
                        if (this.currentTargetType === 'player' && this.target instanceof Player) {
                            this.target.takeDamage(this.attackDamage);
                        } else if (this.currentTargetType === 'door' && this.target instanceof Door) {
                            this.target.takeDamage(this.attackDamage);
                        }
                    }
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
            if (this.slime.active) { // Check if still active before clearing tint
                this.slime.clearTint();
            }
        });

        // If health drops to zero or below, destroy the slime
        if (this.health <= 0 && this.slime.active) {
            this.destroy();
        }
    }

    destroy() {
        // Drop a chicken at the slime's position before destroying it
        if (this.slime.active) {
            const x = this.slime.x;
            const y = this.slime.y;
            this.scene.getResourceManager()?.dropChicken(x, y);
            this.slime.destroy(); // Destroy the sprite
        }
        // Nullify target to prevent further interactions
        this.target = null;
    }

}