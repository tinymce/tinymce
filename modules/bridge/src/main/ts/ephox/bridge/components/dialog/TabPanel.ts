import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';
import { itemSchema } from './Panel';

export interface TabSpec {
  type?: 'tab';
  name?: string;
  title: string;
  items: BodyComponentSpec[];
}

export interface TabPanelSpec {
  type: 'tabpanel';
  tabs: TabSpec[];
}

export interface Tab {
  uid: string;
  type: 'tab';
  name: string;
  title: string;
  items: BodyComponent[];
}

export interface TabPanel {
  uid: string;
  type: 'tabpanel';
  tabs: Tab[];
}

export const tabFields = [
  ComponentSchema.uid,
  ComponentSchema.defaultedType('tab'),
  ComponentSchema.generatedName('tab'),
  ComponentSchema.title,
  FieldSchema.requiredArrayOf('items', itemSchema)
];

export const tabPanelFields = [
  ComponentSchema.uid,
  ComponentSchema.type,
  FieldSchema.requiredArrayOfObj('tabs', tabFields)
];

export const tabPanelSchema = StructureSchema.objOf(tabPanelFields);

export const createTabPanel = (spec: TabPanelSpec): Result<TabPanel, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<TabPanel>('tabpanel', tabPanelSchema, spec);
