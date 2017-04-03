define(
  'tinymce.themes.mobile.channels.TinyChannels',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    var formatChanged = 'formatChanged';

    return {
      formatChanged: Fun.constant(formatChanged)
    };
  }
);
