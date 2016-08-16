define(
  'ephox.katamari.api.Augment',

  [
    'ephox.katamari.api.Obj'
  ],

  function (Obj) {
    // Do we like this API? Should it be here?
    var augment = function(base, extras) {
      Obj.each(extras, function(x, i) {
        base[i] = x;
      });
    };

    return {
      augment: augment
    };
  }
);
