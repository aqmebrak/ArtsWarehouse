import type { Game } from '../scenes/Game';

export class Player {
    private scene: Game;
    private player: Phaser.Physics.Arcade.Sprite;
    private playerDirection: string = 'down';
    private isPlayerMoving: boolean = false;
    private speed = 100;

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
        }
    }

    update(controls: { velocityX: number, velocityY: number }, cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys) {
        const { velocityX, velocityY } = controls;
        this.isPlayerMoving = velocityX !== 0 || velocityY !== 0;

        this.player.setVelocity(velocityX, velocityY);
        this.updateAnimation(velocityX, velocityY, cursorKeys);
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

    getSprite() {
        return this.player;
    }
}