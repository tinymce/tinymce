import { FieldSchema, StructureSchema } from '@ephox/boulder';
import type { Result } from '@ephox/katamari';

import { type ViewButton, viewButtonSchema, type ViewButtonSpec } from './ViewButton';

export interface ViewInstanceApi {
  getContainer: () => HTMLElement;
}

export interface ViewSpec {
  buttons?: ViewButtonSpec[];
  onShow: (api: ViewInstanceApi) => void;
  onHide: (api: ViewInstanceApi) => void;
}

export interface View {
  buttons: ViewButton[];
  onShow: (api: ViewInstanceApi) => void;
  onHide: (api: ViewInstanceApi) => void;
}

export const viewSchema = StructureSchema.objOf([
  FieldSchema.defaultedArrayOf('buttons', [], viewButtonSchema),
  FieldSchema.requiredFunction('onShow'),
  FieldSchema.requiredFunction('onHide')
]);

export const createView = (spec: ViewSpec): Result<View, StructureSchema.SchemaError<any>> => StructureSchema.asRaw('view', viewSchema, spec);
