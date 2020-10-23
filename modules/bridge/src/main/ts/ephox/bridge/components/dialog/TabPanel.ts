import { FieldSchema, ValueSchema, FieldPresence } from '@ephox/boulder';
import { Id, Result } from '@ephox/katamari';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';
import { itemSchema } from './Panel';

export interface TabSpec {
  name?: string;
  title: string;
  items: BodyComponentSpec[];
}

export interface TabPanelSpec {
  type: 'tabpanel';
  tabs: TabSpec[];
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
    FieldPresence.defaultedThunk(() => Id.generate('tab-name')),
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

export const createTabPanel = (spec: TabPanelSpec): Result<TabPanel, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<TabPanel>('tabpanel', tabPanelSchema, spec);
