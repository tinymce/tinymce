import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import { BodyComponent, BodyComponentApi } from './BodyComponent';
import { itemSchema } from './ItemSchema';

export interface ExternalTab {
  // TODO: Consider adding a name here, because title will be translated.
  title: string;
  items: BodyComponentApi[];
}

export interface TabPanelApi {
  type: 'tabpanel';
  tabs: ExternalTab[];
}

export interface InternalTab {
  title: string;
  items: BodyComponent[];
}

export interface InternalTabPanel {
  type: 'tabpanel';
  tabs: InternalTab[];
}

export const tabFields = [
  FieldSchema.strictString('title'),
  FieldSchema.strictArrayOf('items', itemSchema)
];

export const tabPanelFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictArrayOfObj('tabs', tabFields)
];

export const tabPanelSchema = ValueSchema.objOf(tabPanelFields);

export const createTabPanel = (spec: TabPanelApi): Result<InternalTabPanel, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<InternalTabPanel>('tabpanel', tabPanelSchema, spec);
};
