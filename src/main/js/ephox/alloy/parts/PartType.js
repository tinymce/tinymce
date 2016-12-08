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
      { internal: [ 'factory', 'name', 'pname', 'defaults', 'overrides' ] },
      { external: [ 'factory', 'name', 'defaults', 'overrides' ] },
      { optional: [ 'factory', 'name', 'pname', 'defaults', 'overrides' ] }
    ]);

    // TODO: Make more functional if performance isn't an issue.

    var schemas = function (parts) {
      var required = [ ];
      var optional = [ ];

      Arr.each(parts, function (part) {
        part.fold(
          function (factory, name, pname, defaults, overrides) {
            required.push(name);
          },
          function (name) {
            required.push(name);
          },
          function (factory, name, pname, defaults, overrides) {
            optional.push(name);
          }
        );
      });

      return {
        required: Fun.constant(required),
        optional: Fun.constant(optional)
      };
    };

    var combine = function (factory, name, detail, defaults, spec, overrides) {
      return Merger.deepMerge(
        defaults(detail),
        spec,
        { uid: detail.partUids()[name] },
        overrides(detail),
        {
          uiType: 'custom'
        }
      );
    };

    var generate = function (owner, parts) {
      var r = { };

      Arr.each(parts, function (part) {
        part.fold(
          function (factory, name, pname, defaults, overrides) {
            r[name] = {
              placeholder: Fun.constant({uiType: 'placeholder', owner: owner, name: pname }),
              build: function (spec) {
                return UiSubstitutes.single(true, function (detail) {
                  return factory.build(function () {
                    return combine(factory, name, detail, defaults, spec, overrides);
                  });
                });
              }
            };
          },
          function (factory, name, defaults, overrides) {
            r[name] = {
              placeholder: Fun.die('The part: ' + name + ' should not appear in components for: ' + owner),
              build: function (spec) {
                return spec;
              }
            };
            // Do nothing ... has no placeholder.
          },
          function (factory, name, pname, defaults, overrides) {
            r[name] = {
              placeholder: Fun.constant({uiType: 'placeholder', owner: owner, name: pname }),
              build: function (spec) {
                return UiSubstitutes.single(false, function (detail) {
                  return factory.build(function () {
                    return combine(factory, name, detail, defaults, spec, overrides);
                  });
                });
              }
            };
          }
        );
      });

      return Obj.map(r, Fun.constant);

    };

    var externals = function (owner, detail, parts) {
      var ex = { };
      Arr.each(parts, function (part) {
        part.fold(
          function (factory, name, pname, defaults, overrides) {
            //
          },
          function (factory, name, defaults, overrides) {
            ex[name] = Fun.constant(
              combine(factory, name, detail, defaults, detail.parts()[name](), overrides)
            );
            // do nothing ... should not be in components
          },
          function (factory, name, pname, defaults, overrides) {
            // ps[pname] = detail.parts()[name]();
          }
        );
      });

      return ex;
    };

    var components = function (owner, detail, parts) {
      var ps = { };
      Arr.each(parts, function (part) {
        part.fold(
          function (factory, name, pname, defaults, overrides) {
            ps[pname] = detail.parts()[name]();
          },
          function (name) {
            // do nothing ... should not be in components
          },
          function (factory, name, pname, defaults, overrides) {
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
      components: components,
      externals: externals
    };
  }
);