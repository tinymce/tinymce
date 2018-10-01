import { Toolbar } from '@ephox/bridge';
import { Option, Options } from '@ephox/katamari';
import { Element, TransformFind } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';

import { ScopedToolbars } from './ToolbarScopes';

const matchTargetWith = (elem: Element, toolbars: Array<Toolbar.ContextToolbar | Toolbar.ContextForm>): Option<{ toolbarApi: Toolbar.ContextToolbar | Toolbar.ContextForm, elem: Element }> => {
  return Options.findMap(toolbars, (toolbarApi) =>
    toolbarApi.predicate(elem.dom()) ? Option.some({ toolbarApi, elem }) : Option.none());
};

const lookup = (scopes: ScopedToolbars, editor: Editor) => {
  const isRoot = (elem) => elem.dom() === editor.getBody();

  const startNode = Element.fromDom(editor.selection.getNode());

  return matchTargetWith(startNode, scopes.inNodeScope).orThunk(() => {
    return matchTargetWith(startNode, scopes.inEditorScope).orThunk(() => {
      return TransformFind.ancestor(startNode, (elem) => {
        return matchTargetWith(elem, scopes.inNodeScope);
      }, isRoot);
    });
  });
};

export default {
  lookup
};