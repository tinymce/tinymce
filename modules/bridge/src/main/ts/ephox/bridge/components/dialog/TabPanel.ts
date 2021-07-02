import { FieldPresence, FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
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
    ValueType.string
  ),
  FieldSchema.requiredString('title'),
  FieldSchema.requiredArrayOf('items', itemSchema)
];

export const tabPanelFields = [
  FieldSchema.requiredString('type'),
  FieldSchema.requiredArrayOfObj('tabs', tabFields)
];

export const tabPanelSchema = StructureSchema.objOf(tabPanelFields);

export const createTabPanel = (spec: TabPanelSpec): Result<TabPanel, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<TabPanel>('tabpanel', tabPanelSchema, spec);
