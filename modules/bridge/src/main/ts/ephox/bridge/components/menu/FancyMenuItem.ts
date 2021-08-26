import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Result, Fun, Optional } from '@ephox/katamari';

import { ChoiceMenuItemSpec } from './ChoiceMenuItem';

export interface FancyActionArgsMap {
  'inserttable': { numRows: number; numColumns: number };
  'colorswatch': { value: string };
}

interface BaseFancyMenuItemSpec {
  type: 'fancymenuitem';
  fancytype: string;
  initData?: Record<string, unknown>;
}

export interface InsertTableMenuItemSpec extends BaseFancyMenuItemSpec {
  fancytype: 'inserttable';
  onAction?: (data: FancyActionArgsMap['inserttable']) => void;
}

export interface ColorSwatchMenuItemSpec extends BaseFancyMenuItemSpec {
  fancytype: 'colorswatch';
  initData?: {
    allowCustomColors?: boolean;
    colors: ChoiceMenuItemSpec[];
  };
  onAction?: (data: FancyActionArgsMap['colorswatch']) => void;
}

export type FancyMenuItemSpec = InsertTableMenuItemSpec | ColorSwatchMenuItemSpec;

interface BaseFancyMenuItem {
  type: 'fancymenuitem';
  fancytype: string;
  initData: Record<string, unknown>;
}

export interface InsertTableMenuItem extends BaseFancyMenuItem {
  fancytype: 'inserttable';
  initData: {};
  onAction: (data: FancyActionArgsMap['inserttable']) => void;
}

export interface ColorSwatchMenuItem extends BaseFancyMenuItem {
  fancytype: 'colorswatch';
  initData: {
    allowCustomColors: boolean;
    colors: Optional<ChoiceMenuItemSpec[]>;
  };
  onAction: (data: FancyActionArgsMap['colorswatch']) => void;
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
