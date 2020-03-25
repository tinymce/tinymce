/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toolbar } from '@ephox/bridge';
import { Node as DomNode } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Compare, Element, TransformFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import { ScopedToolbars } from './ContextToolbarScopes';

export type LookupResult = { toolbarApi: Toolbar.ContextToolbar | Toolbar.ContextForm, elem: Element };

const matchTargetWith = (elem: Element, toolbars: Array<Toolbar.ContextToolbar | Toolbar.ContextForm>): Option<LookupResult> => {
  return Arr.findMap(toolbars, (toolbarApi) =>
    toolbarApi.predicate(elem.dom()) ? Option.some({ toolbarApi, elem }) : Option.none());
};

const lookup = (scopes: ScopedToolbars, editor: Editor): Option<LookupResult> => {
  const rootElem = Element.fromDom(editor.getBody());
  const isRoot = (elem: Element<DomNode>) => Compare.eq(elem, rootElem);
  const isOutsideRoot = (startNode: Element<DomNode>) => !isRoot(startNode) && !Compare.contains(rootElem, startNode);

  const startNode = Element.fromDom(editor.selection.getNode());

  // Ensure the lookup doesn't start on a parent or sibling element of the root node
  if (isOutsideRoot(startNode)) {
    return Option.none();
  }

  return matchTargetWith(startNode, scopes.inNodeScope).orThunk(() => {
    return matchTargetWith(startNode, scopes.inEditorScope).orThunk(() => {
      // Don't continue to traverse if the start node is the root node
      if (isRoot(startNode)) {
        return Option.none();
      } else {
        return TransformFind.ancestor(startNode, (elem) => matchTargetWith(elem, scopes.inNodeScope), isRoot);
      }
    });
  });
};

export default {
  lookup
};
