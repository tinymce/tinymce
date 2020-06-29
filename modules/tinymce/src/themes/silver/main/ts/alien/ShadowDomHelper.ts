import Editor from 'tinymce/core/api/Editor';
import { Element, ShadowDom } from '@ephox/sugar';

type RootNode = ShadowDom.RootNode;

export const getEditorRootNode = (editor: Editor): RootNode =>
  ShadowDom.getRootNode(Element.fromDom(editor.getElement()));
