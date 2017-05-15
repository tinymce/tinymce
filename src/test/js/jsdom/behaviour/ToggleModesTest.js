/* global domtest */
domtest(
  'ToggleModesTest',

  [
    'global!Promise'
  ],

  function (Promise) {
    /*
     * This is not working yet because wrap-sizzle is using an incompatible with jsdom
     * means of getting the global exports
     */

    return Promise.resolve();
  }
);