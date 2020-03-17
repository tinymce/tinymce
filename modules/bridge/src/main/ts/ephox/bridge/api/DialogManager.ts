import { ValueSchema, Processor } from '@ephox/boulder';
import { createDialog, DialogApi, Dialog, DialogData, DialogInstanceApi } from '../components/dialog/Dialog';
import { createDataValidator } from '../core/DialogData';
import { createUrlDialog, UrlDialog, UrlDialogApi, UrlDialogInstanceApi } from '../components/dialog/UrlDialog';

interface DialogManager {
  open: <T extends DialogData>(factory: DialogFactory<T>, structure: DialogApi<T>) => DialogInstanceApi<T>;
  openUrl: (factory: UrlDialogFactory, structure: UrlDialogApi) => UrlDialogInstanceApi;
  redial: <T extends DialogData>(structure: DialogApi<T>) => DialogInit<T>;
}

export type DialogFactory<T extends DialogData> = (internalDialog: Dialog<T>, initialData: T, dataValidator: Processor) => DialogInstanceApi<T>;
export type UrlDialogFactory = (internalDialog: UrlDialog) => UrlDialogInstanceApi;

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

  openUrl: (factory: UrlDialogFactory, structure: UrlDialogApi): UrlDialogInstanceApi => {
    const internalDialog = ValueSchema.getOrDie(createUrlDialog(structure));
    return factory(internalDialog);
  },

  redial: <T extends DialogData>(structure: DialogApi<T>): DialogInit<T> => extract(structure)
};

export {
  DialogManager
};
