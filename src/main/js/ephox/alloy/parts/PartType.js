define(
  'ephox.alloy.parts.PartType',

  [
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.ADT'
  ],

  function (UiSubstitutes, Arr, Obj, Merger, Fun, Option, Adt) {
    var adt = Adt.generate([
      { internal: [ 'name', 'pname', 'defaults', 'overrides' ] },
      { external: [ 'name', 'defaults', 'overrides' ] },
      { optional: [ 'name', 'pname', 'defaults', 'overrides' ] }
    ]);

    // TODO: Make more functional if performance isn't an issue.

    var schemas = function (parts) {
      var required = [ ];
      var optional = [ ];

      Arr.each(parts, function (part) {
        part.fold(
          function (name, pname, defaults, overrides) {
            required.push(name);
          },
          function (name) {
            required.push(name);
          },
          function (name, pname, defaults, overrides) {
            optional.push(name);
          }
        );
      });

      return {
        required: Fun.constant(required),
        optional: Fun.constant(optional)
      };
    };

    var generate = function (owner, parts) {
      var r = { };

      Arr.each(parts, function (part) {
        part.fold(
          function (name, pname, defaults, overrides) {
            r[name] = {
              placeholder: Fun.constant({uiType: 'placeholder', owner: owner, name: pname }),
              build: function (spec) {
                return UiSubstitutes.single(true, function (detail) {
                  return Merger.deepMerge(
                    defaults(detail),
                    spec,
                    {
                      uid: detail.partUids()[name]
                    },
                    overrides(detail)
                  );
                });
              }
            };
          },
          function (name) {
            r[name] = {
              placeholder: Fun.die('The part: ' + name + ' should not appear in components for: ' + owner),
              build: Fun.identity
            };
            // Do nothing ... has no placeholder.
          },
          function (name, pname, defaults, overrides) {
            r[name] = {
              placeholder: Fun.constant({uiType: 'placeholder', owner: owner, name: pname }),
              build: function (spec) {
                return UiSubstitutes.single(false, function (detail) {
                  return Merger.deepMerge(
                    defaults(detail),
                    spec,
                    {
                      uid: detail.partUids()[name]
                    },
                    overrides(detail)
                  );
                });
              }
            };
          }
        );
      });

      return Obj.map(r, Fun.constant);

    };

    var components = function (owner, detail, parts) {
      var ps = { };
      Arr.each(parts, function (part) {
        part.fold(
          function (name, pname, defaults, overrides) {
            ps[pname] = detail.parts()[name]();
          },
          function (name) {
            // do nothing ... should not be in components
          },
          function (name, pname, defaults, overrides) {
            ps[pname] = detail.parts()[name]();
          }
        );
      });

      return UiSubstitutes.substitutePlaces(Option.some(owner), detail, detail.components(), ps);
    };

    return {
      internal: adt.internal,
      external: adt.external,
      optional: adt.optional,

      schemas: schemas,
      generate: generate,
      components: components
    };
  }
);