import type { Song } from '../types';
import { writable } from 'svelte/store';

export enum PlayerStatus {
	PLAY,
	PAUSE
}

export type PlayerState = {
	status: PlayerStatus;
	currentPosition: number;
};

export const playerState = writable<PlayerState>({
	status: PlayerStatus.PAUSE,
	currentPosition: 0
});

export const selectedSong = writable<Song>(undefined);

export const audioElement = writable<HTMLAudioElement | null>(null);
