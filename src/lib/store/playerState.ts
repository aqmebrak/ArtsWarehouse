import type { Song } from '$lib/types';
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

export const selectedSong = writable<Song>();

export const audioElement = writable<HTMLAudioElement | null>(null);
