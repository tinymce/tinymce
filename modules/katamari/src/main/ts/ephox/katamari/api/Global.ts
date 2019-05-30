import { window } from '@ephox/dom-globals';

// Use window object as the global if it's available since CSP will block script evals
export const Global = typeof window !== 'undefined' ? window : Function('return this;')();