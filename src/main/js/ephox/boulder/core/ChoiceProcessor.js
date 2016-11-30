define(
  'ephox.boulder.core.ChoiceProcessor',

  [
    'ephox.boulder.api.Objects',
    'ephox.boulder.core.SchemaError',
    'ephox.boulder.core.ValueProcessor',
    'ephox.compass.Obj',
    'ephox.perhaps.Result'
  ],

  function (Objects, SchemaError, ValueProcessor, Obj, Result) {
    var chooseFrom = function (path, strength, input, branches, ch) {
      var fields = Objects.readOptFrom(branches, ch);
      return fields.fold(function () {
        return SchemaError.missingBranch(path, branches, ch);
      }, function (fs) {
        return ValueProcessor.obj(fs).extract(path.concat([ 'branch: ' + ch ]), strength, input);  
      });         
    };

    // The purpose of choose is to have a key which picks which of the schemas to follow.
    // The key will index into the object of schemas: branches
    var choose = function (key, branches) {
      var extract = function (path, strength, input) {
        var choice = Objects.readOptFrom(input, key);
        return choice.fold(function () {
          return SchemaError.missingKey(path, key);
        }, function (chosen) {
          return chooseFrom(path, strength, input, branches, chosen);
        });
      };

      var toString = function () {
        return 'chooseOn(' + key + '). Possible values: ' + Obj.keys(branches);
      };

      return {
        extract: extract,
        toString: toString
      };
    };

    return {
      choose: choose
    };
  }
);