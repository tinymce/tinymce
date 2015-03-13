define(
  'ephox.snooker.demo.DemoTranslations',

  [
    'global!Array'
  ],

  function (Array) {
    var keys = {
      'table.picker.rows': '{0} high',
      'table.picker.cols': '{0} wide'
    };

    return function (key) {
      if (keys[key] === undefined) throw 'key ' + key + ' not found';
      var r = keys[key];

      if (arguments.length > 1) {
        var parameters = Array.prototype.slice.call(arguments, 1);
        return r.replace(/\{(\d+)\}/g, function (match, contents) {
          var index = parseInt(contents, 10);
          if (parameters[index] === undefined) throw 'No value for token: ' + match + ' in translation: ' + r;
          return parameters[index];
        });
      } else {
        return r;
      }
    };
  }
);