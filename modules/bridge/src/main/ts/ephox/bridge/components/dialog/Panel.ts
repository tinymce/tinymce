import { BodyComponentApi, BodyComponent } from './BodyComponent';
import { Result } from '@ephox/katamari';
import { ValueSchema, FieldSchema } from '@ephox/boulder';
import { itemSchema } from './ItemSchema';

export interface PanelApi {
  type: 'panel';
  items: BodyComponentApi[];
}

export interface Panel {
  type: 'panel';
  items: BodyComponent[];
}

export const panelFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictArrayOf('items', itemSchema)
];

export const panelSchema = ValueSchema.objOf(panelFields);

export const createPanel = (spec: PanelApi): Result<Panel, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Panel>('panel', panelSchema, spec);
};
