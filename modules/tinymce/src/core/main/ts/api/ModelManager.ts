/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import AddOnManager from './AddOnManager';

export enum NodeType {
  Block = 'Block',
  Inline = 'Inline',
  Text = 'Text',
  Unknown = 'Unknown'
}

export type ModelPath = Array<number>;
export interface ModelPoint {
  readonly path: ModelPath;
  readonly offset: number;
}
export interface ModelRange {
  readonly anchor: ModelPoint;
  readonly focus: ModelPoint;
}

export type Location = 'selection' | ModelPath | ModelPoint | ModelRange;

export interface ModelNode {
  readonly type: NodeType;
}

export interface ModelElement extends ModelNode {
  readonly name: string;
  readonly attributes: Record<string, string>;
  readonly children: Array<ModelNode>;
}

export interface ModelBlock extends ModelElement {
  readonly type: NodeType.Block;
}

export interface ModelInline extends ModelElement {
  readonly type: NodeType.Inline;
}

export interface ModelText extends ModelNode {
  readonly type: NodeType.Text;
  readonly value: string;
}

export interface SetNodeOptions {
  readonly at?: Location;
  readonly match: (node: ModelNode) => boolean;
}

export interface RemoveNodeOptions {
  readonly at?: Location;
  readonly match: (node: ModelNode) => boolean;
}

export interface Model {
  readonly getNodes: (at?: Location) => Array<ModelNode>;
  readonly setNodes: (options: SetNodeOptions, attributes: Record<string, string>, at?: Location) => void;
  readonly removeNodes: (options: RemoveNodeOptions, at?: Location) => void;
}

type ModelManager = AddOnManager<Model>;
const ModelManager: ModelManager = AddOnManager.ModelManager;

export default ModelManager;

// TODO: Move below to a utils file in core somewhere

// helper methods that should go in a central helper module
export const isElement = (node: ModelNode): node is ModelElement => {
  return node.type === NodeType.Block || node.type === NodeType.Inline;
};

export const isImage = (node: ModelNode): node is ModelInline => {
  return isElement(node) && node.name === 'img';
};
