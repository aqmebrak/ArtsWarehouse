import type { Game } from '../scenes/Game';
import type { Slime } from './Slime';

export class Player {
    private scene: Game;
    private player: Phaser.Physics.Arcade.Sprite;
    private isPlayerMoving: boolean = false;
    private speed = 100;

    // Attack properties
    private attackRange: number = 24; // Increased range from 24 to 50
    private attackDamage: number = 5; // Damage per attack (updated to match slime health)
    private attackCooldown: number = 400; // 1 second cooldown between attacks
    private canAttack: boolean = true; // Flag to track if player can attack
    private lastAttackTime: number = 0; // Timestamp of the last attack
    private isAttacking: boolean = false; // Flag to track if currently attacking

    constructor(scene: Game, x: number, y: number) {
        this.scene = scene;
        this.player = this.scene.physics.add.sprite(x, y + 100, 'player');
        this.setupPhysics();
        this.createAnimations();
    }

    setupPhysics() {
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0.5, 1.0); // Set origin to bottom center of the sprite
        this.player.setDepth(1); // Set depth to ensure player is above other objects
        this.player.setSize(16, 24); // Set player size to match sprite dimensions
        this.player.setOffset(16, 21); // Offset the hitbox to position it correctly relative to the visible sprite
        this.player.setAlpha(1); // Set player alpha to fully visible
        this.player.setTint(0xffffff); // Set player tint to white (no tint)
        this.player.setVisible(true); // Ensure player is visible	
    }

    createAnimations() {
        if (!this.scene.anims.exists('idle-down')) {
            // Create player animations based on spritesheet rows with 6 frames per row
            // Row 1: Idle animations
            this.scene.anims.create({
                key: 'idle-down',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
                frameRate: 6,
                repeat: -1
            });

            // Row 2: Moving right (and flipped for left)
            this.scene.anims.create({
                key: 'move-right',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
                frameRate: 6,
                repeat: -1
            });

            this.scene.anims.create({
                key: 'move-left',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
                frameRate: 6,
                repeat: -1
            });

            // Row 3: Moving up
            this.scene.anims.create({
                key: 'move-up',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
                frameRate: 6,
                repeat: -1
            });

            // Row 4: Moving down
            this.scene.anims.create({
                key: 'move-down',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
                frameRate: 6,
                repeat: -1
            });

            // Add attack animations
            // Bottom attack (row 7)
            this.scene.anims.create({
                key: 'attack-down',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 36, end: 39 }),
                frameRate: 14,
                repeat: 0
            });

            // Right attack (row 8)
            this.scene.anims.create({
                key: 'attack-right',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 42, end: 45 }),
                frameRate: 14,
                repeat: 0
            });

            // Top attack (row 9)
            this.scene.anims.create({
                key: 'attack-up',
                frames: this.scene.anims.generateFrameNumbers('player', { start: 48, end: 51 }),
                frameRate: 14,
                repeat: 0
            });
        }
    }

    update() {
        let velocityX = 0;
        let velocityY = 0;

        // Process joystick input
        if (this.scene.joystick && this.scene.joystick.force > 0) {
            const angleRad = Phaser.Math.DegToRad(this.scene.joystick.angle);
            velocityX = Math.cos(angleRad) * this.speed;
            velocityY = Math.sin(angleRad) * this.speed;
        }
        this.isPlayerMoving = velocityX !== 0 || velocityY !== 0;

        this.player.setVelocity(velocityX, velocityY);
        this.updateAnimation(velocityX, velocityY, this.scene.cursorKeys);

        // Check for nearby enemies to attack
        this.checkForAttack();
    }

    updateAnimation(velocityX: number, velocityY: number, cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys) {
        // Reset velocity and track if player is moving
        this.player.setVelocity(0);
        this.isPlayerMoving = false;

        // Handle joystick input
        if (this.scene.joystick.force > 0) {
            // Convert angle to radians and calculate velocity components
            const angleRad = Phaser.Math.DegToRad(this.scene.joystick.angle);
            velocityX = Math.cos(angleRad) * this.speed;
            velocityY = Math.sin(angleRad) * this.speed;

            // Set player velocity based on joystick angle
            this.player.setVelocity(velocityX, velocityY);
            this.isPlayerMoving = true;
        }

        // Handle keyboard input as alternative
        if (cursorKeys.left.isDown) {
            velocityX = -this.speed;
            this.player.setVelocityX(-this.speed);
            this.isPlayerMoving = true;
        } else if (cursorKeys.right.isDown) {
            velocityX = this.speed;
            this.player.setVelocityX(this.speed);
            this.isPlayerMoving = true;
        }

        if (cursorKeys.up.isDown) {
            velocityY = -this.speed;
            this.player.setVelocityY(-this.speed);
            this.isPlayerMoving = true;
        } else if (cursorKeys.down.isDown) {
            velocityY = this.speed;
            this.player.setVelocityY(this.speed);
            this.isPlayerMoving = true;
        }

        // Don't move or attack while already attacking
        if (this.isAttacking) {
            return;
        }

        // Determine animation based on direction and movement
        if (this.isPlayerMoving) {
            // Determine the primary direction of movement
            if (Math.abs(velocityX) > Math.abs(velocityY)) {
                // Moving horizontally
                if (velocityX > 0) {
                    // Right movement
                    this.player.setFlipX(false);
                    this.player.anims.play('move-right', true);
                } else {
                    // Left movement
                    this.player.setFlipX(true); // Flip sprite horizontally for left movement
                    this.player.anims.play('move-left', true);
                }
            } else {
                // Moving vertically
                if (velocityY > 0) {
                    // Down movement
                    this.player.setFlipX(false);
                    this.player.anims.play('move-down', true);
                } else {
                    // Up movement
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

    checkForAttack() {
        // Don't check for attacks if currently attacking
        if (this.isAttacking) return;

        // Check if we're still on cooldown
        const currentTime = this.scene.time.now;
        if (!this.canAttack && currentTime - this.lastAttackTime >= this.attackCooldown) {
            this.canAttack = true;
        }

        // If we can't attack, don't proceed
        if (!this.canAttack) return;

        // Get all slimes from the scene
        const slimes = (this.scene.enemies?.getChildren() || []) as Phaser.Physics.Arcade.Sprite[];
        if (slimes.length === 0) return;

        // Find the closest slime within attack range
        let closestSlime: Phaser.Physics.Arcade.Sprite | null = null;

        for (const enemySprite of slimes) {
            if (!enemySprite.active) continue;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemySprite.x, enemySprite.y
            );

            if (distance <= this.attackRange) {
                closestSlime = enemySprite;
            }
        }

        // If we found a slime in range, attack it
        if (closestSlime) {
            this.attack(closestSlime);
        }
    }

    attack(targetSprite: Phaser.Physics.Arcade.Sprite) {
        // Start cooldown and set attacking flag
        this.canAttack = false;
        this.isAttacking = true;
        this.lastAttackTime = this.scene.time.now;

        // Determine attack direction based on target position
        const directionX = targetSprite.x - this.player.x;
        const directionY = targetSprite.y - this.player.y;

        let animKey = '';

        // Play the appropriate attack animation based on direction
        if (Math.abs(directionX) > Math.abs(directionY)) {
            // Horizontal attack
            if (directionX > 0) {
                // Right attack
                this.player.setFlipX(false);
                animKey = 'attack-right';
            } else {
                // Left attack (use right animation, but flip)
                this.player.setFlipX(true);
                animKey = 'attack-right';
            }
        } else {
            // Vertical attack
            if (directionY > 0) {
                // Down attack
                animKey = 'attack-down';
            } else {
                // Up attack
                animKey = 'attack-up';
            }
        }

        // Safety timer in case animation completion doesn't fire
        const safetyTimer = this.scene.time.delayedCall(500, () => {
            if (this.isAttacking) {
                this.completeAttack(targetSprite);
            }
        });

        // Play animation and listen for completion
        this.player.anims.play(animKey);
        this.player.once('animationcomplete', () => {
            safetyTimer.remove(); // Cancel safety timer
            this.completeAttack(targetSprite);
        });
    }

    completeAttack(targetSprite: Phaser.Physics.Arcade.Sprite) {
        // Reset attacking state
        this.isAttacking = false;

        // Emit attack event with target information
        this.scene.events.emit('player-attack', targetSprite);
    }

    getSprite() {
        return this.player;
    }

    getAttackDamage() {
        return this.attackDamage;
    }

    getAttackRange() {
        return this.attackRange;
    }
}