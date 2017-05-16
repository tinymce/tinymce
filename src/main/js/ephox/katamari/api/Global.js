define(
  'ephox.katamari.api.Global',

  [
  ],

  function () {
    // Use window object as the global if it's available since CSP will block script evals
    if (typeof window !== 'undefined') {
      return window;
    } else {
      return Function('return this;')();
    }
  }
);

