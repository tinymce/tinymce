import { StructureProcessor, StructureSchema } from '@ephox/boulder';
import { Cell, Fun, Merger } from '@ephox/katamari';

import { DialogManager } from '../../../main/ts/ephox/bridge/api/DialogManager';
import { Dialog, DialogData, DialogInstanceApi, DialogSpec } from '../../../main/ts/ephox/bridge/components/dialog/Dialog';

// This is the function that would be implemented in modern theme/silver theme for creating dialogs
const createDemoApi = <T extends DialogData>(internalStructure: Dialog<T>, initialData: Partial<T>, dataValidator: StructureProcessor): DialogInstanceApi<T> => {
  const data = Cell(initialData);

  // eslint-disable-next-line no-console
  console.log({
    internalStructure,
    initialData
  });

  return {
    getData: () =>
      // demos are already cheating, so we need to hack this type, if they don't provide all initial data they'll explode.
      data.get() as any,
    setData: (newData: Partial<T>) => {
      const mergedData = Merger.deepMerge(data.get(), newData);
      const newInternalData = StructureSchema.getOrDie(StructureSchema.asRaw('data', dataValidator, mergedData));
      data.set(newInternalData);
    },
    redial: Fun.noop,
    focus: (_name: string) => {},
    showTab: (_title: string) => {},
    setEnabled: (_name: string, _state: boolean) => {},
    block: (_message: string) => {},
    unblock: Fun.noop,
    close: Fun.noop,
    toggleFullscreen: Fun.noop
  };
};

export const openDemoDialog = <T extends DialogData>(structure: DialogSpec<T>): void => {
  DialogManager.open(createDemoApi, structure);
};
