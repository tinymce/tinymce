import { StructureSchema } from '@ephox/boulder';
import { InlineContent } from '@ephox/bridge';
import { Arr, Fun, Obj, Unique } from '@ephox/katamari';

import Editor from '../api/Editor';

export interface AutocompleterDatabase {
  dataset: Record<string, InlineContent.Autocompleter>;
  triggerChars: string[];
  lookupByChar: (ch: string) => InlineContent.Autocompleter[];
}

const register = (editor: Editor): AutocompleterDatabase => {
  const popups = editor.ui.registry.getAll().popups;
  const dataset = Obj.map(popups, (popup) => InlineContent.createAutocompleter(popup).fold(
    (err) => {
      throw new Error(StructureSchema.formatError(err));
    },
    Fun.identity
  ));

  const triggerChars = Unique.stringArray(
    Obj.mapToArray(dataset, (v) => v.ch)
  );

  const datasetValues = Obj.values(dataset);

  const lookupByChar = (ch: string): InlineContent.Autocompleter[] => Arr.filter(datasetValues, (dv) => dv.ch === ch);

  return {
    dataset,
    triggerChars,
    lookupByChar
  };
};

export {
  register
};
