This repository consists of a SvelteKit project with TypeScript.
The goal of the website is to store every piece of art the author has done, so there is a gallery page, a music page, a breathing exercise page in p5.js, and a game page.

#Breathing Exercise
The project is using p5.js, it consist of a canvas where a circle goes up and down every 5 seconds, for 5 minutes
Audio sound is associated to every up and down movement of the circle.
The user can start the exercise by clicking a button, and the button will change to a stop button.

#Game 
The project is using Phaser.js. 
The game is about a player who has to defend their base camp from waves of enemies. 
The game is a top-down 2D game with a camera that follows the player. 
The player can move around the map and kill enemies (auto attack).
The game has a health system for player and enemies.
The game spawns enemies every few seconds in the corners of the map.
The game follows the Component Entity System (ECS) architecture.
The game has a Boot, Preload and Game Scene.