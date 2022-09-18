import { StructureProcessor, StructureSchema } from '@ephox/boulder';

import { createDialog, Dialog, DialogData, DialogInstanceApi, DialogSpec } from '../components/dialog/Dialog';
import { createUrlDialog, UrlDialog, UrlDialogInstanceApi, UrlDialogSpec } from '../components/dialog/UrlDialog';
import { createDataValidator } from '../core/DialogData';

interface DialogManager {
  readonly open: <T extends DialogData>(factory: DialogFactory<T>, structure: DialogSpec<T>) => DialogInstanceApi<T>;
  readonly openUrl: (factory: UrlDialogFactory, structure: UrlDialogSpec) => UrlDialogInstanceApi;
  readonly redial: <T extends DialogData>(structure: DialogSpec<T>) => DialogInit<T>;
}

export type DialogFactory<T extends DialogData> = (internalDialog: Dialog<T>, initialData: Partial<T>, dataValidator: StructureProcessor) => DialogInstanceApi<T>;
export type UrlDialogFactory = (internalDialog: UrlDialog) => UrlDialogInstanceApi;

export interface DialogInit<T extends DialogData> {
  readonly internalDialog: Dialog<T>;
  readonly initialData: Partial<T>;
  readonly dataValidator: StructureProcessor;
}

const extract = <T extends DialogData>(structure: DialogSpec<T>): DialogInit<T> => {
  const internalDialog = StructureSchema.getOrDie(createDialog(structure));
  const dataValidator = createDataValidator<T>(structure);
  // We used to validate data here, but it's done when loading the dialog in tinymce
  const initialData = structure.initialData ?? {};
  return {
    internalDialog,
    dataValidator,
    initialData
  };
};

const DialogManager: DialogManager = {
  open: <T extends DialogData>(factory: DialogFactory<T>, structure: DialogSpec<T>): DialogInstanceApi<T> => {
    const extraction = extract(structure);
    return factory(extraction.internalDialog, extraction.initialData, extraction.dataValidator);
  },

  openUrl: (factory: UrlDialogFactory, structure: UrlDialogSpec): UrlDialogInstanceApi => {
    const internalDialog = StructureSchema.getOrDie(createUrlDialog(structure));
    return factory(internalDialog);
  },

  redial: <T extends DialogData>(structure: DialogSpec<T>): DialogInit<T> => extract(structure)
};

export {
  DialogManager
};
