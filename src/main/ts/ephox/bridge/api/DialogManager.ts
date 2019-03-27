import { createDialog, DialogApi, Dialog, DialogData, DialogInstanceApi } from '../components/dialog/Dialog';
import { ValueSchema, Processor } from '@ephox/boulder';
import { createDataValidator } from '../core/DialogData';

interface DialogManager {
  open: <T extends DialogData>(factory: DialogFactory<T>, structure: DialogApi<T>) => DialogInstanceApi<T>;
  redial: <T extends DialogData>(structure: DialogApi<T>) => DialogInit<T>;
}

export type DialogFactory<T extends DialogData> = (internalDialog: Dialog<T>, initialData: T, dataValidator: Processor) => DialogInstanceApi<T>;

export interface DialogInit<T extends DialogData> {
  internalDialog: Dialog<T>;
  initialData: T;
  dataValidator: Processor;
}

const extract = <T>(structure: DialogApi<T>): DialogInit<T> => {
  const internalDialog = ValueSchema.getOrDie(createDialog(structure));
  const dataValidator = createDataValidator<T>(structure);
  // We used to validate data here, but it's done when loading the dialog in tinymce
  const initialData = structure.initialData;
  return {
    internalDialog,
    dataValidator,
    initialData
  };
};

const DialogManager: DialogManager = {
  open: <T extends DialogData>(factory: DialogFactory<T>, structure: DialogApi<T>): DialogInstanceApi<T> => {
    const extraction = extract(structure);
    return factory(extraction.internalDialog, extraction.initialData, extraction.dataValidator);
  },

  redial: <T extends DialogData>(structure: DialogApi<T>): DialogInit<T> => {
    return extract(structure);
  }
};

export {
  DialogManager
};
