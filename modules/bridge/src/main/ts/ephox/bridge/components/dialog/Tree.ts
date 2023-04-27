import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';

import { ToolbarMenuButtonSpec, ToolbarMenuButton } from '../../api/Toolbar';
import * as ComponentSchema from '../../core/ComponentSchema';
import { MenuButtonSchema } from '../toolbar/ToolbarMenuButton';

type Id = string;

export interface TreeSpec {
  type: 'tree';
  items: TreeItemSpec[];
  onLeafAction?: (id: Id) => void;
  defaultExpandedIds?: Id[];
  onToggleExpand?: (
    expandedIds: Id[],
    { expanded, node }: { expanded: boolean; node: Id }
  ) => void;
  defaultSelectedId?: Id;
}

export interface Tree {
  type: 'tree';
  items: TreeItem[];
  defaultExpandedIds: Id[];
  onLeafAction: Optional<(id: Id) => void>;
  onToggleExpand: Optional<(
    expandedIds: Id[],
    { expanded, node }: { expanded: boolean; node: Id }
  ) => void
  >;
  defaultSelectedId: Optional<Id>;
}

interface BaseTreeItemSpec {
  title: string;
  id: Id;
  menu?: ToolbarMenuButtonSpec;
}

interface BaseTreeItem {
  title: string;
  id: string;
  menu: Optional<ToolbarMenuButton>;
}

export interface DirectorySpec extends BaseTreeItemSpec {
  type: 'directory';
  children: TreeItemSpec[];
}

export interface Directory extends BaseTreeItem {
  type: 'directory';
  children: TreeItem[];
}

export interface LeafSpec extends BaseTreeItemSpec {
  type: 'leaf';
}

export interface Leaf extends BaseTreeItem {
  type: 'leaf';
}

export type TreeItemSpec = DirectorySpec | LeafSpec;

export type TreeItem = Directory | Leaf;

const baseTreeItemFields = [
  FieldSchema.requiredStringEnum('type', [ 'directory', 'leaf' ]),
  ComponentSchema.title,
  FieldSchema.requiredString('id'),
  FieldSchema.optionOf('menu', MenuButtonSchema),
];

const treeItemLeafFields = baseTreeItemFields;

const treeItemLeafSchema = StructureSchema.objOf(treeItemLeafFields);

const treeItemDirectoryFields = baseTreeItemFields.concat([
  FieldSchema.requiredArrayOf('children', StructureSchema.thunkOf('children', () => {
    return StructureSchema.chooseProcessor('type', {
      directory: treeItemDirectorySchema,
      leaf: treeItemLeafSchema,
    });
  })),
]);

const treeItemDirectorySchema = StructureSchema.objOf(treeItemDirectoryFields);

const treeItemSchema = StructureSchema.chooseProcessor('type', {
  directory: treeItemDirectorySchema,
  leaf: treeItemLeafSchema,
});

const treeFields = [
  ComponentSchema.type,
  FieldSchema.requiredArrayOf('items', treeItemSchema),
  FieldSchema.optionFunction('onLeafAction'),
  FieldSchema.optionFunction('onToggleExpand'),
  FieldSchema.defaultedArrayOf('defaultExpandedIds', [], ValueType.string),
  FieldSchema.optionString('defaultSelectedId'),
];

export const treeSchema = StructureSchema.objOf(treeFields);

export const createTree = (spec: TreeSpec): Result<Tree, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Tree>('tree', treeSchema, spec);
