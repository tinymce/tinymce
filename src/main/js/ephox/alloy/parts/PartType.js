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
      { optional: [ 'factory', 'name', 'pname', 'defaults', 'overrides' ] },
      { group: [ 'factory', 'name', 'unit', 'pname', 'defaults', 'overrides' ] }
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
          function (factory, name, _defaults, _overrides) {
            required.push(name);
          },
          function (factory, name, pname, defaults, overrides) {
            optional.push(name);
          },
          function (factory, name, unit, pname, defaults, overrides) {
            // TODO: Shell support
            // required.push(name);
          }
        );
      });

      return {
        required: Fun.constant(required),
        optional: Fun.constant(optional)
      };
    };

    var combine = function (name, detail, defaults, spec, overrides) {
      return Merger.deepMerge(
        defaults(detail, spec),
        spec,
        { uid: detail.partUids()[name] },
        overrides(detail, spec),
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
            r[name] = Fun.constant({ uiType: UiSubstitutes.placeholder(), owner: owner, name: pname });
          },
          function (factory, name, defaults, overrides) {
            // Do nothing ... has no placeholder.
          },
          function (factory, name, pname, defaults, overrides) {
            r[name] = Fun.constant({ uiType: UiSubstitutes.placeholder(), owner: owner, name: pname });
          },

          // Group
          function (factory, name, unit, pname, defualts, overrides) {
            r[name] = Fun.constant({ uiType: UiSubstitutes.placeholder(), owner: owner, name: pname });
          }
        );
      });

      return r;

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
              combine(name, detail, defaults, detail.parts()[name](), overrides)
            );
            // do nothing ... should not be in components
          },
          function (factory, name, pname, defaults, overrides) {
            // ps[pname] = detail.parts()[name]();
          },

          function (factory, name, unit, pname, defaults, overrides) {
            // not an external
          }
        );
      });

      return ex;
    };

    var placeholders = function (owner, detail, parts) {
      var ps = { };
      Arr.each(parts, function (part) {
        part.fold(
          function (factory, name, pname, defaults, overrides) {
            ps[pname] = UiSubstitutes.single(true, function (detail) {
              return factory.build(
                combine(name, detail, defaults, detail.parts()[name](), overrides)
              );
            });
          },

          function (factory, name, defaults, overrides) {
            // no placeholders
          },

          function (factory, name, pname, defaults, overrides) {
            ps[pname] = UiSubstitutes.single(false, function (detail) {
              if (! detail.parts) {
                debugger;
              }
              if (! detail.parts()[name]) {
                debugger;
              }
              return factory.build(
                combine(name, detail, defaults, detail.parts()[name](), overrides)
              );
            });
          },

          function (factory, name, unit, pname, defaults, overrides) {
            ps[pname] = UiSubstitutes.multiple(true, function (detail) {
              if (! detail[name]) {
                debugger;
              }
              var units = detail[name]();
              return Arr.map(units, function (u) {
                var munged = detail.members()[unit]().munge(u);

                // Group multiples do not take the uid because there is more than one.
                return factory.build(
                  Merger.deepMerge(
                    defaults(detail, u),
                    munged,
                    overrides(detail, u)
                  )
                );
              });
            });
          }
        );
      });

      return ps;
    };

    var components = function (owner, detail, parts) {
      var ps = placeholders(owner, detail, parts);      
      return UiSubstitutes.substitutePlaces(Option.some(owner), detail, detail.components(), ps);
    };

    return {
      internal: adt.internal,
      external: adt.external,
      optional: adt.optional,
      group: adt.group,

      schemas: schemas,
      generate: generate,
      components: components,
      externals: externals,
      placeholders: placeholders
    };
  }
);