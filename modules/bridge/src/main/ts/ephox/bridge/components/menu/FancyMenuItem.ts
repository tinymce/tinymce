import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result, Fun, Optional } from '@ephox/katamari';

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
  initData?: {
    allowCustomColors?: boolean;
    colors: ChoiceMenuItemSpec[];
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
  initData: {
    allowCustomColors: boolean;
    colors: Optional<ChoiceMenuItemSpec[]>;
  };
}

export type FancyMenuItem = InsertTableMenuItem | ColorSwatchMenuItem;

const baseFields = [
  FieldSchema.requiredString('type'),
  FieldSchema.requiredString('fancytype'),
  FieldSchema.defaultedFunction('onAction', Fun.noop)
];

const insertTableFields = [
  FieldSchema.defaulted('initData', {})
].concat(baseFields);

const colorSwatchFields = [
  FieldSchema.defaultedObjOf('initData', {}, [
    FieldSchema.defaultedBoolean('allowCustomColors', true),
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
