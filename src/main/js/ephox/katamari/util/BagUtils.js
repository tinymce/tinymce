define(
  'ephox.katamari.util.BagUtils',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Type',
    'global!Error'
  ],

  function (Arr, Type, Error) {
    var sort = function (arr) {
      return arr.slice(0).sort();
    };

    var reqMessage = function (required, keys) {
      throw new Error('All required keys (' + sort(required).join(', ') + ') were not specified. Specified keys were: ' + sort(keys).join(', ') + '.');
    };

    var unsuppMessage = function (unsupported) {
      throw new Error('Unsupported keys for object: ' + sort(unsupported).join(', '));
    };

    var validateStrArr = function (label, array) {
      if (!Type.isArray(array)) throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
      Arr.each(array, function (a) {
        if (!Type.isString(a)) throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
      });
    };

    var invalidTypeMessage = function (incorrect, type) {
      throw new Error('All values need to be of type: ' + type + '. Keys (' + sort(incorrect).join(', ') + ') were not.');
    };

    var checkDupes = function (everything) {
      var sorted = sort(everything);
      var dupe = Arr.find(sorted, function (s, i) {
        return i < sorted.length -1 && s === sorted[i + 1];
      });

      dupe.each(function (d) {
        throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
      });
    };

    return {
      sort: sort,
      reqMessage: reqMessage,
      unsuppMessage: unsuppMessage,
      validateStrArr: validateStrArr,
      invalidTypeMessage: invalidTypeMessage,
      checkDupes: checkDupes
    };
  }
);