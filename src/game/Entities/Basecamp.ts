import type { Game } from '../scenes/Game';
import { Door } from './Door';

export class Basecamp {
    private scene: Game;
    private walls: Phaser.Physics.Arcade.StaticGroup | undefined;
    private doors: Door[] = [];
    private centerX: number;
    private centerY: number;
    private width: number = 128;
    private height: number = 128;
    private wallThickness: number = 16;
    private doorWidth: number = 32;

    constructor(scene: Game, centerX: number, centerY: number) {
        this.scene = scene;
        this.centerX = centerX;
        this.centerY = centerY;

        // Use the walls group from the scene instead of creating a new one
        this.walls = scene.walls;

        this.createWalls();
        this.createDoors();
    }

    createWalls() {
        // Calculate basecamp boundaries
        const left = this.centerX - this.width / 2;
        const right = this.centerX + this.width / 2;
        const top = this.centerY - this.height / 2;
        const bottom = this.centerY + this.height / 2;

        // Top wall (with door gap)
        const topWallLeftWidth = this.centerX - this.doorWidth / 2 - left;
        const topWallRightStart = this.centerX + this.doorWidth / 2;
        const topWallRightWidth = right - topWallRightStart;

        if (this.walls) {
            let wall = this.walls.create(left + topWallLeftWidth / 2, top + this.wallThickness / 2, 'wall');
            wall.setSize(topWallLeftWidth, this.wallThickness).setOrigin(0.5, 0.5).refreshBody();

            wall = this.walls.create(topWallRightStart + topWallRightWidth / 2, top + this.wallThickness / 2, 'wall');
            wall.setSize(topWallRightWidth, this.wallThickness).setOrigin(0.5, 0.5).refreshBody();

            // Bottom wall (with door gap)
            const bottomWallLeftWidth = topWallLeftWidth;
            const bottomWallRightStart = topWallRightStart;
            const bottomWallRightWidth = topWallRightWidth;

            wall = this.walls.create(left + bottomWallLeftWidth / 2, bottom - this.wallThickness / 2, 'wall');
            wall.setSize(bottomWallLeftWidth, this.wallThickness).setOrigin(0.5, 0.5).refreshBody();

            wall = this.walls.create(bottomWallRightStart + bottomWallRightWidth / 2, bottom - this.wallThickness / 2, 'wall');
            wall.setSize(bottomWallRightWidth, this.wallThickness).setOrigin(0.5, 0.5).refreshBody();

            // Left wall (full height)
            const sideWallHeight = this.height - 2 * this.wallThickness;
            wall = this.walls.create(left + this.wallThickness / 2, this.centerY, 'wall-vertical');
            wall.setSize(this.wallThickness, sideWallHeight).setOrigin(0.5, 0.5).refreshBody();

            // Right wall (full height)
            wall = this.walls.create(right - this.wallThickness / 2, this.centerY, 'wall-vertical');
            wall.setSize(this.wallThickness, sideWallHeight).setOrigin(0.5, 0.5).refreshBody();
        }
    }

    createDoors() {
        const top = this.centerY - this.height / 2;
        const bottom = this.centerY + this.height / 2;

        // Create top door
        const topDoor = new Door(this.scene, this.centerX, top + this.wallThickness / 2);
        this.doors.push(topDoor);

        // Create bottom door
        const bottomDoor = new Door(this.scene, this.centerX, bottom - this.wallThickness / 2);
        this.doors.push(bottomDoor);
    }

    getDimensions() {
        return {
            width: this.width,
            height: this.height,
            centerX: this.centerX,
            centerY: this.centerY
        };
    }

    // Method to get all door instances
    getDoors(): Door[] {
        return this.doors;
    }

    // Method to check if all doors are destroyed
    areAllDoorsDestroyed(): boolean {
        if (this.doors.length === 0) return false; // No doors to be destroyed
        return this.doors.every(door => door.isDestroyed());
    }

    // Clean up door resources
    shutdown() {
        this.doors.forEach(door => door.shutdown());
    }
}