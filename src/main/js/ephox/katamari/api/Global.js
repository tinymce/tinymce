// Use window object as the global if it's available since CSP will block script evals
var global = typeof window !== 'undefined' ? window : Function('return this;')();

export default <any> global;