/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node as DomNode } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Compare, Element, TransformFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { ContextTypes } from '../../ContextToolbar';
import { ScopedToolbars } from './ContextToolbarScopes';

export type LookupResult = { toolbars: ContextTypes[]; elem: Element };
type MatchResult = { contextToolbars: ContextTypes[]; contextForms: ContextTypes[] };

const matchTargetWith = (elem: Element, candidates: ContextTypes[]): MatchResult => {
  const ctxs = Arr.filter(candidates, (toolbarApi) => toolbarApi.predicate(elem.dom()));
  // TODO: somehow type this properly (Arr.partition can't)
  // e.g. here pass is Toolbar.ContextToolbar and fail is Toolbar.ContextForm
  const { pass, fail } = Arr.partition(ctxs, (t) => t.type === 'contexttoolbar');
  return { contextToolbars: pass, contextForms: fail };
};

const filterByPositionForStartNode = (toolbars: ContextTypes[]) => {
  if (toolbars.length <= 1) {
    return toolbars;
  } else {
    const doesPositionExist = (value: string) => Arr.exists(toolbars, (t) => t.position === value);
    const filterToolbarsByPosition = (value: string) => Arr.filter(toolbars, (t) => t.position === value);

    const hasSelectionToolbars = doesPositionExist('selection');
    const hasNodeToolbars = doesPositionExist('node');
    if (hasSelectionToolbars || hasNodeToolbars) {
      if (hasNodeToolbars && hasSelectionToolbars) {
        // if there's a mix, change the 'selection' toolbars to 'node' so there's no positioning confusion
        const nodeToolbars = filterToolbarsByPosition('node');
        const selectionToolbars = Arr.map<ContextTypes>(filterToolbarsByPosition('selection'), (t) => ({ ...t, position: 'node' }));
        return nodeToolbars.concat(selectionToolbars);
      } else {
        return hasSelectionToolbars ? filterToolbarsByPosition('selection') : filterToolbarsByPosition('node');
      }
    } else {
      return filterToolbarsByPosition('line');
    }
  }
};

const filterByPositionForAncestorNode = (toolbars: ContextTypes[]) => {
  if (toolbars.length <= 1) {
    return toolbars;
  } else {
    const findPosition = (value: string) => Arr.find(toolbars, (t) => t.position === value);

    // prioritise position by 'selection' -> 'node' -> 'line'
    const basePosition = findPosition('selection')
      .orThunk(() => findPosition('node'))
      .orThunk(() => findPosition('line'))
      .map((t) => t.position);
    return basePosition.fold(
      () => [],
      (pos) => Arr.filter(toolbars, (t) => t.position === pos)
    );
  }
};

const matchStartNode = (elem: Element, nodeCandidates: ContextTypes[], editorCandidates: ContextTypes[]): Option<LookupResult> => {
  // requirements:
  // 1. prioritise context forms over context menus
  // 2. prioritise node scoped over editor scoped context forms
  // 3. only show max 1 context form
  // 4. concatenate all available context toolbars if no context form

  const nodeMatches = matchTargetWith(elem, nodeCandidates);

  if (nodeMatches.contextForms.length > 0) {
    return Option.some({ elem, toolbars: [ nodeMatches.contextForms[ 0 ] ] });
  } else {
    const editorMatches = matchTargetWith(elem, editorCandidates);

    if (editorMatches.contextForms.length > 0) {
      return Option.some({ elem, toolbars: [ editorMatches.contextForms[ 0 ] ] });
    } else if (nodeMatches.contextToolbars.length > 0 || editorMatches.contextToolbars.length > 0) {
      const toolbars = filterByPositionForStartNode(nodeMatches.contextToolbars.concat(editorMatches.contextToolbars));
      return Option.some({ elem, toolbars });
    } else {
      return Option.none();
    }
  }
};

const matchAncestor = (isRoot, startNode, scopes): Option<LookupResult> => {
  // Don't continue to traverse if the start node is the root node
  if (isRoot(startNode)) {
    return Option.none();
  } else {
    return TransformFind.ancestor(startNode, (ancestorElem) => {
      const { contextToolbars, contextForms } = matchTargetWith(ancestorElem, scopes.inNodeScope);
      const toolbars = contextForms.length > 0 ? contextForms : filterByPositionForAncestorNode(contextToolbars);
      return toolbars.length > 0 ? Option.some({ elem: ancestorElem, toolbars }) : Option.none();
    }, isRoot);
  }
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
  return matchStartNode(startNode, scopes.inNodeScope, scopes.inEditorScope).orThunk(() => matchAncestor(isRoot, startNode, scopes));
};

export {
  lookup,
  filterByPositionForStartNode,
  filterByPositionForAncestorNode,
  matchStartNode
};
