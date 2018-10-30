import { Objects } from '@ephox/boulder';
import { Arr, Fun, Merger } from '@ephox/katamari';

import * as UiSubstitutes from '../spec/UiSubstitutes';
import * as PartType from './PartType';
import { Substitutions } from './AlloyParts';

const combine: any = (detail, data: PartType.PartSpec<any>, partSpec, partValidated) => {
  // Extremely confusing names and types :(
  const spec = partSpec;
  return Merger.deepMerge(
    data.defaults(detail, partSpec, partValidated),
    partSpec,
    { uid: detail.partUids[data.name] },
    data.overrides(detail, partSpec, partValidated)
  );
};

const subs = (owner, detail, parts: PartType.PartTypeAdt[]): Substitutions => {
  const internals = { };
  const externals = { };

  Arr.each(parts, (part) => {
    part.fold(
      // Internal
      (data: PartType.PartSpec<any>) => {
        internals[data.pname] = UiSubstitutes.single(true, (detail, partSpec, partValidated) => {
          return data.factory.sketch(
            combine(detail, data, partSpec, partValidated)
          );
        });
      },

      // External
      (data: PartType.PartSpec<any>) => {
        const partSpec = detail.parts[data.name];
        externals[data.name] = Fun.constant(
          data.factory.sketch(
            combine(detail, data, partSpec[PartType.original()]),
            partSpec
          ) // This is missing partValidated
        );
        // no placeholders
      },

      // Optional
      (data: PartType.PartSpec<any>) => {
        internals[data.pname] = UiSubstitutes.single(false, (detail, partSpec, partValidated) => {
          return data.factory.sketch(
            combine(detail, data, partSpec, partValidated)
          );
        });
      },

      // Group
      (data: PartType.PartSpec<any>) => {
        internals[data.pname] = UiSubstitutes.multiple(true, (detail, _partSpec, _partValidated) => {
          const units = detail[data.name];
          return Arr.map(units, (u) => {
            // Group multiples do not take the uid because there is more than one.
            return data.factory.sketch(
              Merger.deepMerge(
                data.defaults(detail, u,  _partValidated),
                u,
                data.overrides(detail, u)
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

export {
  subs
};