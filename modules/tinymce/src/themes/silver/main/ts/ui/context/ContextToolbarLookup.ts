/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { Compare, SugarElement, TransformFind } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { ContextTypes } from '../../ContextToolbar';
import { ScopedToolbars } from './ContextToolbarScopes';

export interface LookupResult { toolbars: ContextTypes[]; elem: SugarElement }
interface MatchResult { contextToolbars: ContextTypes[]; contextForms: ContextTypes[] }

const matchTargetWith = (elem: SugarElement, candidates: ContextTypes[]): MatchResult => {
  const ctxs = Arr.filter(candidates, (toolbarApi) => toolbarApi.predicate(elem.dom));
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

const matchStartNode = (elem: SugarElement, nodeCandidates: ContextTypes[], editorCandidates: ContextTypes[]): Optional<LookupResult> => {
  // requirements:
  // 1. prioritise context forms over context menus
  // 2. prioritise node scoped over editor scoped context forms
  // 3. only show max 1 context form
  // 4. concatenate all available context toolbars if no context form

  const nodeMatches = matchTargetWith(elem, nodeCandidates);

  if (nodeMatches.contextForms.length > 0) {
    return Optional.some({ elem, toolbars: [ nodeMatches.contextForms[ 0 ] ] });
  } else {
    const editorMatches = matchTargetWith(elem, editorCandidates);

    if (editorMatches.contextForms.length > 0) {
      return Optional.some({ elem, toolbars: [ editorMatches.contextForms[ 0 ] ] });
    } else if (nodeMatches.contextToolbars.length > 0 || editorMatches.contextToolbars.length > 0) {
      const toolbars = filterByPositionForStartNode(nodeMatches.contextToolbars.concat(editorMatches.contextToolbars));
      return Optional.some({ elem, toolbars });
    } else {
      return Optional.none();
    }
  }
};

const matchAncestor = (isRoot, startNode, scopes): Optional<LookupResult> => {
  // Don't continue to traverse if the start node is the root node
  if (isRoot(startNode)) {
    return Optional.none();
  } else {
    return TransformFind.ancestor(startNode, (ancestorElem) => {
      const { contextToolbars, contextForms } = matchTargetWith(ancestorElem, scopes.inNodeScope);
      const toolbars = contextForms.length > 0 ? contextForms : filterByPositionForAncestorNode(contextToolbars);
      return toolbars.length > 0 ? Optional.some({ elem: ancestorElem, toolbars }) : Optional.none();
    }, isRoot);
  }
};

const lookup = (scopes: ScopedToolbars, editor: Editor): Optional<LookupResult> => {
  const rootElem = SugarElement.fromDom(editor.getBody());
  const isRoot = (elem: SugarElement<Node>) => Compare.eq(elem, rootElem);
  const isOutsideRoot = (startNode: SugarElement<Node>) => !isRoot(startNode) && !Compare.contains(rootElem, startNode);

  const startNode = SugarElement.fromDom(editor.selection.getNode());

  // Ensure the lookup doesn't start on a parent or sibling element of the root node
  if (isOutsideRoot(startNode)) {
    return Optional.none();
  }
  return matchStartNode(startNode, scopes.inNodeScope, scopes.inEditorScope).orThunk(() => matchAncestor(isRoot, startNode, scopes));
};

export {
  lookup,
  filterByPositionForStartNode,
  filterByPositionForAncestorNode,
  matchStartNode
};
