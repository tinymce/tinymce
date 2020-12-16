// Use window object as the global if it's available since CSP will block script evals
// eslint-disable-next-line @typescript-eslint/no-implied-eval
export const Global = typeof window !== 'undefined' ? window : Function('return this;')();
