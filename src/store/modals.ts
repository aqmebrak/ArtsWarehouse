import { writable } from 'svelte/store';
import images from '../images';

export const modals = writable(Object.fromEntries(images.map((img) => [img, false])));
