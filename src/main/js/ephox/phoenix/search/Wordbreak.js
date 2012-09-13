define(
  'ephox.phoenix.search.Wordbreak',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {

    return {
      chars: Fun.constant(',\\.?;\\s')
    };
  }
);
