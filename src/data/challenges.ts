import type { Challenge } from '../types';

// Production starts with an empty public challenge board. New challenges are stored by the API server.
export const challenges: Challenge[] = [];
export const myChallengeIds: string[] = [];
