import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { ChoiceMenuItemSpec } from './ChoiceMenuItem';
import { ImageMenuItemSpec, ResetImageItemSpec } from './ImageMenuItem';

export interface FancyActionArgsMap {
  inserttable: { numRows: number; numColumns: number };
  colorswatch: { value: string };
  imageselect: { value: string };
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

export interface ImageSelectMenuItemSpec extends BaseFancyMenuItemSpec<'imageselect'> {
  fancytype: 'imageselect';
  select?: (value: string) => boolean;
  initData: {
    columns: number;
    items: (ImageMenuItemSpec | ResetImageItemSpec)[];
  };
}

export type FancyMenuItemSpec = InsertTableMenuItemSpec | ColorSwatchMenuItemSpec | ImageSelectMenuItemSpec;

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

export interface ImageSelectMenuItem extends BaseFancyMenuItem<'imageselect'> {
  fancytype: 'imageselect';
  select: Optional<(value: string) => boolean>;
  initData: {
    columns: number;
    items: (ImageMenuItemSpec | ResetImageItemSpec)[];
  };
}

export type FancyMenuItem = InsertTableMenuItem | ColorSwatchMenuItem | ImageSelectMenuItem;

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

const imageSelectFields = [
  FieldSchema.optionFunction('select'),
  FieldSchema.requiredObjOf('initData', [
    FieldSchema.requiredNumber('columns'),
    // Note: We don't validate the items as they are instead validated by imageMenuItemSchema when rendering
    FieldSchema.defaultedArrayOf('items', [], ValueType.anyValue())
  ])
].concat(baseFields);

export const fancyMenuItemSchema = StructureSchema.choose('fancytype', {
  inserttable: insertTableFields,
  colorswatch: colorSwatchFields,
  imageselect: imageSelectFields
});

export const createFancyMenuItem = (spec: FancyMenuItemSpec): Result<FancyMenuItem, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw('fancymenuitem', fancyMenuItemSchema, spec);
