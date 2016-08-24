define(
  'ephox.katamari.api.Adt',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Type',
    'global!Array',
    'global!Error'
  ],

  function (Arr, Obj, Type, Array, Error) {
    // TODO: Probably accept the name ADT instead.

    /*
     * Generates a church encoded ADT. No, I'm not going to explain what that is here.
     *
     * The aim of this file is to replace the extreme ADT syntax we have been using
     * (50 lines of code for a simple variant with 4 cases). Specifying the ADT
     * can now be done in one line per case, and proper validation is included.
     *
     * For syntax and use, look at the test code.
     */
    var generate = function (cases) {
      // validation
      if (!Type.isArray(cases)) {
        throw 'cases must be an array';
      }
      if (cases.length === 0) {
        throw 'there must be at least one case';
      }

      var allKeys = Obj.keys(cases);

      // adt is mutated to add the individual cases
      var adt = {};
      Arr.each(cases, function (acase, count) {
        var keys = Obj.keys(acase);

        // validation
        if (keys.length !== 1) {
          throw 'one and only one name per case';
        }

        var key = keys[0];
        var value = acase[key];

        // validation
        if (adt[key] !== undefined) {
          throw 'duplicate key detected:' + key;
        } else if (key === 'cata') {
          throw 'cannot have a case named cata (sorry)';
        } else if (!Type.isArray(value)) {
          // this implicitly checks if acase is an object
          throw 'case arguments must be an array';
        }


        //
        // constructor for key
        //
        adt[key] = function () {
          var argLength = arguments.length;

          // validation
          if (argLength !== value.length) {
            throw 'Wrong number of arguments to case ' + key + '. Expected ' + value.length + ' (' + value + '), got ' + argLength;
          }

          // TBIO-4011: Don't use array slice(arguments), makes the whole function unoptimisable on Chrome
          var args = new Array(argLength);
          for (var i = 0; i < args.length; i++) args[i] = arguments[i];


          // INVESTIGATE: Can this be optimised?
          var match = function (branches) {
            var branchKeys = Obj.keys(branches);
            if (allKeys.length !== branchKeys.length) {
              throw new Error('Wrong arguments to match. Expected: ' + allKeys.join(',') + '\nActual: ' + branchKeys.join(','));
            }

            var allReqd = Arr.forall(keys, function (reqKey) {
              return Arr.contains(branchKeys, reqKey);
            });

            if (!allReqd) throw new Error('Not all branches were specified when using match. Specified: ' + branchKeys.join(', ') + '\nRequired: ' + allKeys.join(', '));

            return branches[key].apply(null, args);
          };

          //
          // the fold function for key
          //
          return {
            fold: function (/* arguments */) {
              // runtime validation
              if (arguments.length !== cases.length) {
                throw 'Wrong number of arguments to fold. Expected ' + cases.length + ', got ' + arguments.length;
              }
              var target = arguments[count];
              return target.apply(null, args);
            },
            match: match,
            inspect: function () {
              return {
                types: cases,
                constructor: key,
                params: args
              };
            }
          };
        };
      });

      return adt;
    };
    return {
      generate: generate
    };
  }
);