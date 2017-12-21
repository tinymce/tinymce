import PartType from './PartType';
import UiSubstitutes from '../spec/UiSubstitutes';
import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';

var combine:any = function (detail, data, partSpec, partValidated) {
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
          combine(detail, data, partSpec[PartType.original()]()) // This is missing partValidated
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

export default <any> {
  subs: subs
};