define(
  'ephox.alloy.parts.PartSubstitutes',

  [
    'ephox.alloy.parts.PartType',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (PartType, UiSubstitutes, Objects, Arr, Fun, Merger) {
    var combine = function (detail, data, partSpec, partValidated) {
      var spec = partSpec;

      return Merger.deepMerge(
        data.defaults()(detail, partSpec, partValidated),
        partSpec,
        { uid: detail.partUids()[data.name()] },
        data.overrides()(detail, partSpec, partValidated),
        {
          'debug.sketcher': Objects.wrap('part-' + data.name(), spec)
        }
      );
    };

    var subs = function (owner, detail, parts) {
      var internals = { };
      var externals = { };

      Arr.each(parts, function (part) {
        part.fold(
          // Internal
          function (data) {
            internals[data.pname()] = UiSubstitutes.single(true, function (detail, partSpec, partValidated) {
              return data.factory().sketch(
                combine(detail, data, partSpec, partValidated)
              );
            });
          },

          // External
          function (data) {
            var partSpec = detail.parts()[data.name()]();
            externals[data.name()] = Fun.constant(
              combine(detail, data, partSpec[PartType.original()]())
            );
            // no placeholders
          },

          // Optional
          function (data) {
            internals[data.pname()] = UiSubstitutes.single(false, function (detail, partSpec, partValidated) {
              return data.factory().sketch(
                combine(detail, data, partSpec, partValidated)
              );
            });
          },

          // Group
          function (data) {
            internals[data.pname()] = UiSubstitutes.multiple(true, function (detail, _partSpec, _partValidated) {
              var units = detail[data.name()]();
              return Arr.map(units, function (u) {
                // Group multiples do not take the uid because there is more than one.
                return data.factory().sketch(
                  Merger.deepMerge(
                    data.defaults()(detail, u),
                    u,
                    data.overrides()(detail, u)
                  )
                );
              });
            });
          }
        );
      });

      return {
        internals: Fun.constant(internals),
        externals: Fun.constant(externals)
      };
    };

    return {
      subs: subs
    };
  }
);
