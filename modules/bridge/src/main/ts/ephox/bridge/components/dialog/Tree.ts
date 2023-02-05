import { FieldProcessor, FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface TreeSpec {
  type: 'tree';
  items: TreeItem[];
}

export interface Tree {
  type: 'tree';
  items: TreeItem[];
}

interface BaseTreeItem {
  title: string;
  id: string;
}

export interface Directory extends BaseTreeItem {
  type: 'directory';
  children: TreeItem[];
}

interface Leaf extends BaseTreeItem {
  type: 'leaf';
}

export type TreeItem = Directory | Leaf;

const baseTreeItemFields = [
  ComponentSchema.title,
  FieldSchema.requiredString('id'),
  FieldSchema.requiredStringEnum('type', [ 'leaf', 'directory' ]),
];

const treeItemLeafFields = baseTreeItemFields;

const treeItemLeafSchema = StructureSchema.objOf(treeItemLeafFields);

const treeItemDirectoryFields = (): FieldProcessor[] => baseTreeItemFields.concat([
  FieldSchema.requiredArrayOf('children', StructureSchema.oneOfFunc((obj: TreeItem) => obj.type === 'leaf' ? treeItemLeafSchema : treeItemDirectorySchema)),
]);

const treeItemDirectorySchema = StructureSchema.objOf(treeItemDirectoryFields());

// The order here is very important! if we change the order, then boulder will always match
// againt treeItemLeafSchema, because a directory has all attributes of leaf plus the children property
const treeItemSchema = StructureSchema.oneOf([ treeItemDirectorySchema, treeItemLeafSchema ]);

const treeFields = [
  ComponentSchema.type,
  FieldSchema.requiredArrayOf('items', treeItemSchema)
];

export const treeSchema = StructureSchema.objOf(treeFields);

export const createTree = (spec: TreeSpec): Result<Tree, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Tree>('tree', treeSchema, spec);
