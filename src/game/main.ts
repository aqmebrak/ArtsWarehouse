import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: window.innerWidth * 0.8,
	height: window.innerHeight * 0.8,
	parent: 'game-container',
	backgroundColor: '#028af8',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { x: 0, y: 0 },
			debug: true
		}
	},
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	scene: [Boot, Preloader, MainGame],
	plugins: {
		global: [
			{
				key: 'rexVirtualJoystick',
				plugin: VirtualJoystickPlugin,
				start: true
			}
		]
	}
};

const StartGame = (parent: string) => {
	return new Game({ ...config, parent });
};

export default StartGame;
