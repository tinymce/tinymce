define(
  'tinymce.themes.mobile.channels.TinyChannels',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    var formatChanged = 'formatChanged';
    var orientationChanged = 'orientationChanged';

    return {
      formatChanged: Fun.constant(formatChanged),
      orientationChanged: Fun.constant(orientationChanged)
    };
  }
);
