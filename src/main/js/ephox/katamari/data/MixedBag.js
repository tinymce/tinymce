define(
  'ephox.katamari.data.MixedBag',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Option',
    'ephox.katamari.util.BagUtils',
    'global!Error',
    'global!Object'
  ],

  function (Arr, Fun, Obj, Option, BagUtils, Error, Object) {
    
    return function (required, optional) {
      var everything = required.concat(optional);
      if (everything.length === 0) throw new Error('You must specify at least one required or optional field.');

      BagUtils.validateStrArr('required', required);
      BagUtils.validateStrArr('optional', optional);

      BagUtils.checkDupes(everything);

      return function (obj) {
        var keys = Obj.keys(obj);

        // Ensure all required keys are present.
        var allReqd = Arr.forall(required, function (req) {
          return Arr.contains(keys, req);
        });

        if (! allReqd) BagUtils.reqMessage(required, keys);

        var unsupported = Arr.filter(keys, function (key) {
          return !Arr.contains(everything, key);
        });

        if (unsupported.length > 0) BagUtils.unsuppMessage(unsupported);

        var r = {};
        Arr.each(required, function (req) {
          r[req] = Fun.constant(obj[req]);
        });

        Arr.each(optional, function (opt) {
          r[opt] = Fun.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]): Option.none());
        });

        return r;
      };
    };
  }
);