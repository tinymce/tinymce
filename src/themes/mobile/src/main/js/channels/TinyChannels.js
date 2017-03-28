define(
  'tinymce.themes.mobile.channels.TinyChannels',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    var refreshUi = 'channel.refreshUi';

    return {
      refreshUi: Fun.constant(refreshUi)
    };
  }
);
