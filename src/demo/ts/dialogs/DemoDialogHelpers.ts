import { DialogManager } from '../../../main/ts/ephox/bridge/api/DialogManager';
import { Dialog, DialogApi, DialogInstanceApi } from '../../../main/ts/ephox/bridge/components/dialog/Dialog';
import { Processor, ValueSchema } from '@ephox/boulder';
import { Merger, Cell } from '@ephox/katamari';
import { console } from '@ephox/dom-globals';

// This is the function that would be implemented in modern theme/silver theme for creating dialogs
const createDemoApi = <T>(internalStructure: Dialog<T>, initalData: T, dataValidator: Processor): DialogInstanceApi<T> => {
  const data = Cell(initalData);

  // tslint:disable-next-line:no-console
  console.log({
    internalStructure,
    initalData
  });

  return {
    getData: () => data.get(),
    setData: (newData: Partial<T>) => {
      const mergedData = Merger.merge(data.get(), newData);
      const newInternalData = ValueSchema.getOrDie(ValueSchema.asRaw('data', dataValidator, mergedData));
      data.set(newInternalData);
    },
    redial: () => { },
    focus: (_name: string) => {},
    showTab: (_title: string) => {},
    disable: (_name: string) => {},
    enable: (_name: string) => {},
    block: (_message: string) => {},
    unblock: () => {},
    close: () => {}
  };
};

export const openDemoDialog = <T>(structure: DialogApi<T>): void => {
  DialogManager.open(createDemoApi, structure);
};
