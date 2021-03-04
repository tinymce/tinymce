/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import { Arr } from '@ephox/katamari';
import { DomStructure } from '@ephox/robin';
import { Attribute, SugarElement, SugarNode, SugarText } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import ModelManager, { Model, ModelElement, ModelNode, ModelText } from 'tinymce/core/api/ModelManager';

// TODO: How to import enum types across the global API boundary?
enum NodeType {
  Block = 'Block',
  Inline = 'Inline',
  Text = 'Text',
  Unknown = 'Unknown'
}

const classifyElementType = (node: SugarElement<HTMLElement>) => {
  // TODO: is there an API we can use instead of robin?
  if (DomStructure.isBlock(node)) {
    return NodeType.Block;
  } else if (DomStructure.isInline(node)) {
    return NodeType.Inline;
  } else {
    return NodeType.Unknown;
  }
};

const elementsAsModelNodes = (elements) => Arr.map(elements, htmlNodeToModelNode);

const htmlNodeToModelNode = (node: Node): ModelNode | ModelElement | ModelText => {
  const sugarNode = SugarElement.fromDom(node);
  if (SugarNode.isText(sugarNode)) {
    return {
      type: NodeType.Text,
      value: SugarText.get(sugarNode)
    };
  } else if (SugarNode.isHTMLElement(sugarNode)) {
    const modelElement = {
      name: node.nodeName.toLowerCase(),
      type: classifyElementType(sugarNode)
    };

    const htmlElement = sugarNode.dom;
    Object.defineProperties(modelElement, {
      attributes: {
        get: () => {
          return Attribute.clone(sugarNode);
        }
      },
      children: {
        get: () => {
          return elementsAsModelNodes(htmlElement.childNodes);
        }
      }
    });
    return modelElement;
  } else {
    return { type: NodeType.Unknown };
  }
};

const DomModel = (editor: Editor): Model => {
  return {
    getNodes: (_at = 'selection') => {
      const root = editor.getBody();
      // TODO: switch behaviour based on `at`. Probably requires `isPath`, `isPoint` etc.
      return elementsAsModelNodes(root.childNodes);
    },
    setNodes: (_options, _attributes, _at = 'selection') => {
      return;
    },
    removeNodes: (_options, _at = 'selection') => {
      return;
    }
  };
};

export default () => {
  ModelManager.add('dom', DomModel);
};
