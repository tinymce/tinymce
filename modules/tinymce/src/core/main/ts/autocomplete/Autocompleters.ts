import { StructureSchema } from '@ephox/boulder';
import { InlineContent } from '@ephox/bridge';
import { Arr, Fun, Obj, Unique } from '@ephox/katamari';

import Editor from '../api/Editor';

export interface AutocompleterDatabase {
  dataset: Record<string, InlineContent.Autocompleter>;
  triggers: string[];
  lookupByTrigger: (trigger: string) => InlineContent.Autocompleter[];
}

const register = (editor: Editor): AutocompleterDatabase => {
  const popups = editor.ui.registry.getAll().popups;
  const dataset = Obj.map(popups, (popup) => InlineContent.createAutocompleter(popup).fold(
    (err) => {
      throw new Error(StructureSchema.formatError(err));
    },
    Fun.identity
  ));

  const triggers = Unique.stringArray(
    Obj.mapToArray(dataset, (v) => v.trigger)
  );

  const datasetValues = Obj.values(dataset);

  const lookupByTrigger = (trigger: string): InlineContent.Autocompleter[] => Arr.filter(datasetValues, (dv) => dv.trigger === trigger);

  return {
    dataset,
    triggers,
    lookupByTrigger
  };
};

export {
  register
};
