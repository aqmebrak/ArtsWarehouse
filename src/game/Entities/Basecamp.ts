import type { Game } from '../scenes/Game';
import { Door } from './Door';

export class Basecamp {
    private scene: Game;
    private walls: Phaser.Physics.Arcade.StaticGroup;
    private doors: Door[] = [];
    private centerX: number;
    private centerY: number;
    private width: number = 224;
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
        this.addLabel();
    }

    createWalls() {
        // Calculate basecamp boundaries
        const left = this.centerX - this.width / 2;
        const right = this.centerX + this.width / 2;
        const top = this.centerY - this.height / 2;
        const bottom = this.centerY + this.height / 2;

        // Top wall (with door in the middle)
        // Left section - horizontal wall
        for (let x = left; x < this.centerX - this.doorWidth / 2; x += 48) {
            const width = Math.min(48, this.centerX - this.doorWidth / 2 - x);
            const wall = this.walls.create(x, top, 'wall').setOrigin(0, 0);
            wall.setSize(width, this.wallThickness);
            wall.refreshBody();
        }

        // Right section - horizontal wall
        for (let x = this.centerX + this.doorWidth / 2; x < right; x += 48) {
            const width = Math.min(48, right - x);
            const wall = this.walls.create(x, top, 'wall').setOrigin(0, 0);
            wall.setSize(width, this.wallThickness);
            wall.refreshBody();
        }

        // Bottom wall (with door in the middle)
        // Left section - horizontal wall
        for (let x = left; x < this.centerX - this.doorWidth / 2; x += 48) {
            const width = Math.min(48, this.centerX - this.doorWidth / 2 - x);
            const wall = this.walls.create(x, bottom - this.wallThickness, 'wall').setOrigin(0, 0);
            wall.setSize(width, this.wallThickness);
            wall.refreshBody();
        }

        // Right section - horizontal wall
        for (let x = this.centerX + this.doorWidth / 2; x < right; x += 48) {
            const width = Math.min(48, right - x);
            const wall = this.walls.create(x, bottom - this.wallThickness, 'wall').setOrigin(0, 0);
            wall.setSize(width, this.wallThickness);
            wall.refreshBody();
        }

        // Left wall (no door) - vertical wall
        for (let y = top + this.wallThickness; y < bottom - this.wallThickness; y += 48) {
            const height = Math.min(48, bottom - this.wallThickness - y);
            const wall = this.walls.create(left, y, 'wall-vertical').setOrigin(0, 0);
            wall.setSize(this.wallThickness, height);
            wall.refreshBody();
        }

        // Right wall (no door) - vertical wall
        for (let y = top + this.wallThickness; y < bottom - this.wallThickness; y += 48) {
            const height = Math.min(48, bottom - this.wallThickness - y);
            const wall = this.walls.create(right - this.wallThickness, y, 'wall-vertical').setOrigin(0, 0);
            wall.setSize(this.wallThickness, height);
            wall.refreshBody();
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

    addLabel() {
        const top = this.centerY - this.height / 2;
        this.scene.add.text(this.centerX, top - 30, 'BASECAMP', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);
    }

    getWalls() {
        return this.walls;
    }

    getDoorSprites() {
        return this.doors.map(door => door.getSprite());
    }

    getDimensions() {
        return {
            width: this.width,
            height: this.height,
            centerX: this.centerX,
            centerY: this.centerY
        };
    }
}