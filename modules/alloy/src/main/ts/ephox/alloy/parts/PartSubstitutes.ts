import { Arr, Fun, Merger } from '@ephox/katamari';

import { AlloySpec } from '../api/component/SpecTypes';
import { CompositeSketchDetail, CompositeSketchSpec } from '../api/ui/Sketcher';
import * as UiSubstitutes from '../spec/UiSubstitutes';
import { Substitutions } from './AlloyParts';
import * as PartType from './PartType';

const combine = <D extends CompositeSketchDetail, S extends CompositeSketchSpec>(detail: D, data: PartType.BasePartDetail<D, S>, partSpec: S, partValidated?: Record<string, any>): S & { uid: string } =>
  // Extremely confusing names and types :(
  Merger.deepMerge(
    data.defaults(detail, partSpec, partValidated),
    partSpec,
    { uid: detail.partUids[data.name] },
    data.overrides(detail, partSpec, partValidated)
  );

const subs = <D extends CompositeSketchDetail>(owner: string, detail: D, parts: PartType.PartTypeAdt[]): Substitutions => {
  const internals: Record<string, UiSubstitutes.UiSubstitutesAdt> = { };
  const externals: Record<string, () => AlloySpec> = { };

  Arr.each(parts, (part) => {
    part.fold(
      // Internal
      (data) => {
        internals[data.pname] = UiSubstitutes.single(true, (detail, partSpec, partValidated) => data.factory.sketch(
          combine(detail, data, partSpec, partValidated)
        ));
      },

      // External
      (data) => {
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
      (data) => {
        internals[data.pname] = UiSubstitutes.single(false, (detail, partSpec, partValidated) => data.factory.sketch(
          combine(detail, data, partSpec, partValidated)
        ));
      },

      // Group
      (data) => {
        internals[data.pname] = UiSubstitutes.multiple(true, (detail, _partSpec, _partValidated) => {
          const units: Array<Record<string, any>> = (detail as any)[data.name];
          return Arr.map(units, (u) =>
            // Group multiples do not take the uid because there is more than one.
            data.factory.sketch(
              Merger.deepMerge(
                data.defaults(detail, u, _partValidated),
                u,
                data.overrides(detail, u)
              )
            )
          );
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
