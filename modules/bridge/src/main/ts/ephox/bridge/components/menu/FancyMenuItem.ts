import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result, Optional } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { ChoiceMenuItemSpec } from './ChoiceMenuItem';

export interface FancyActionArgsMap {
  'inserttable': { numRows: number; numColumns: number };
  'colorswatch': { value: string };
}

interface BaseFancyMenuItemSpec<T extends keyof FancyActionArgsMap> {
  type: 'fancymenuitem';
  fancytype: T;
  initData?: Record<string, unknown>;
  onAction?: (data: FancyActionArgsMap[T]) => void;
}

export interface InsertTableMenuItemSpec extends BaseFancyMenuItemSpec<'inserttable'> {
  fancytype: 'inserttable';
  initData?: {};
}

export interface ColorSwatchMenuItemSpec extends BaseFancyMenuItemSpec<'colorswatch'> {
  fancytype: 'colorswatch';
  select?: (value: string) => boolean;
  initData?: {
    allowCustomColors?: boolean;
    colors?: ChoiceMenuItemSpec[];
    storageKey?: string;
  };
}

export type FancyMenuItemSpec = InsertTableMenuItemSpec | ColorSwatchMenuItemSpec;

interface BaseFancyMenuItem<T extends keyof FancyActionArgsMap> {
  type: 'fancymenuitem';
  fancytype: T;
  initData: Record<string, unknown>;
  onAction: (data: FancyActionArgsMap[T]) => void;
}

export interface InsertTableMenuItem extends BaseFancyMenuItem<'inserttable'> {
  fancytype: 'inserttable';
  initData: {};
}

export interface ColorSwatchMenuItem extends BaseFancyMenuItem<'colorswatch'> {
  fancytype: 'colorswatch';
  select: Optional<(value: string) => boolean>;
  initData: {
    allowCustomColors: boolean;
    colors: Optional<ChoiceMenuItemSpec[]>;
    storageKey: string;
  };
}

export type FancyMenuItem = InsertTableMenuItem | ColorSwatchMenuItem;

const baseFields = [
  ComponentSchema.type,
  FieldSchema.requiredString('fancytype'),
  ComponentSchema.defaultedOnAction
];

const insertTableFields = [
  FieldSchema.defaulted('initData', {})
].concat(baseFields);

const colorSwatchFields = [
  FieldSchema.optionFunction('select'),
  FieldSchema.defaultedObjOf('initData', {}, [
    FieldSchema.defaultedBoolean('allowCustomColors', true),
    FieldSchema.defaultedString('storageKey', 'default'),
    // Note: We don't validate the colors as they are instead validated by choiceschema when rendering
    FieldSchema.optionArrayOf('colors', ValueType.anyValue())
  ])
].concat(baseFields);

export const fancyMenuItemSchema = StructureSchema.choose('fancytype', {
  inserttable: insertTableFields,
  colorswatch: colorSwatchFields
});

export const createFancyMenuItem = (spec: FancyMenuItemSpec): Result<FancyMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('fancymenuitem', fancyMenuItemSchema, spec);
