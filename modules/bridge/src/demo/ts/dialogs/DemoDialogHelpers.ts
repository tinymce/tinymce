import { StructureProcessor, StructureSchema } from '@ephox/boulder';
import { Cell, Fun, Merger } from '@ephox/katamari';

import { DialogManager } from '../../../main/ts/ephox/bridge/api/DialogManager';
import { Dialog, DialogInstanceApi, DialogSpec } from '../../../main/ts/ephox/bridge/components/dialog/Dialog';

// This is the function that would be implemented in modern theme/silver theme for creating dialogs
const createDemoApi = <T>(internalStructure: Dialog<T>, initalData: Partial<T>, dataValidator: StructureProcessor): DialogInstanceApi<T> => {
  const data = Cell(initalData);

  // eslint-disable-next-line no-console
  console.log({
    internalStructure,
    initalData
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
    disable: (_name: string) => {},
    enable: (_name: string) => {},
    block: (_message: string) => {},
    unblock: Fun.noop,
    close: Fun.noop
  };
};

export const openDemoDialog = <T>(structure: DialogSpec<T>): void => {
  DialogManager.open(createDemoApi, structure);
};
