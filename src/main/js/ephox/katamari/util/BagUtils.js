define(
  'ephox.katamari.util.BagUtils',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Arr'
  ],

  function (Type, Arr) {
    var sort = function (arr) {
      return arr.slice(0).sort();
    };

    var reqMessage = function (required, keys) {
      throw 'All required keys (' + sort(required).join(', ') + ') were not specified. Specified keys were: ' + sort(keys).join(', ') + '.';
    };

    var unsuppMessage = function (unsupported) {
      throw 'Unsupported keys for object: ' + sort(unsupported).join(', ');
    };

    var validateStrArr = function (label, array) {
      if (!Type.isArray(array)) throw 'The ' + label + ' fields must be an array. Was: ' + array + '.';
      Arr.each(array, function (a) {
        if (!Type.isString(a)) throw 'The value ' + a + ' in the ' + label + ' fields was not a string.';
      });
    };

    var invalidTypeMessage = function (incorrect, type) {
      throw 'All values need to be of type: ' + type + '. Keys (' + sort(incorrect).join(', ') + ') were not.';
    };

    var checkDupes = function (everything) {
      var sorted = sort(everything);
      var dupe = Arr.find(sorted, function (s, i) {
        return i < sorted.length -1 && s === sorted[i + 1];
      });

      if (dupe !== undefined && dupe !== null) throw 'The field: ' + dupe + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].';
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