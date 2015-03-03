define(
  'ephox.polaris.string.Sanitise',

  [

  ],

  function () {
    var css = function (str) {
      var r = '';

      // special case; the first character must a letter. More strict than CSS, but easier to implement.
      if (/[a-zA-Z]/.exec(str[0]) === null) r = 'e';

      // any non-word character becomes a hyphen
      var sanitised = str.replace(/[^\w]/gi, '-');

      return r + sanitised;
    };

    return {
      css: css
    }
  }
);