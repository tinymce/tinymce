import { FieldSchema, ValueSchema, FieldPresence } from '@ephox/boulder';
import { Id, Result } from '@ephox/katamari';
import { BodyComponent, BodyComponentApi } from './BodyComponent';
import { itemSchema } from './Panel';

export interface TabApi {
  name?: string;
  title: string;
  items: BodyComponentApi[];
}

export interface TabPanelApi {
  type: 'tabpanel';
  tabs: TabApi[];
}

export interface Tab {
  name: string;
  title: string;
  items: BodyComponent[];
}

export interface TabPanel {
  type: 'tabpanel';
  tabs: Tab[];
}

export const tabFields = [
  FieldSchema.field(
    'name',
    'name',
    FieldPresence.defaultedThunk(() => {
      return Id.generate('tab-name');
    }),
    ValueSchema.string
  ),
  FieldSchema.strictString('title'),
  FieldSchema.strictArrayOf('items', itemSchema)
];

export const tabPanelFields = [
  FieldSchema.strictString('type'),
  FieldSchema.strictArrayOfObj('tabs', tabFields)
];

export const tabPanelSchema = ValueSchema.objOf(tabPanelFields);

export const createTabPanel = (spec: TabPanelApi): Result<TabPanel, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<TabPanel>('tabpanel', tabPanelSchema, spec);
};
