import { Optional, Strings } from '@ephox/katamari';
import { PredicateExists, SugarElement, Traverse } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';
import type { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import type { Toolbar } from 'tinymce/core/api/ui/Ui';
import type { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const getNodeChangeHandler = (editor: Editor, dir: 'ltr' | 'rtl') => (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
  const getDirection = (elem: Element): Optional<string> =>
    Optional.from(editor.dom.getStyle(elem, 'direction'))
      .or(Optional.from(editor.dom.getAttrib(elem, 'dir')))
      .filter(Strings.isNotEmpty);

  const activeDirection = (elem: Element) =>
    getDirection(elem)
      .or(Optional.from(editor.dom.getParent(elem, editor.dom.isBlock)).bind(getDirection))
      .exists((direction: string) => direction === dir);

  const nodeChangeHandler = (e: EditorEvent<NodeChangeEvent>) =>
    api.setActive(activeDirection(e.element));

  editor.on('NodeChange', nodeChangeHandler);

  return () => editor.off('NodeChange', nodeChangeHandler);
};

const register = (editor: Editor): void => {
  editor.ui.registry.addToggleButton('ltr', {
    tooltip: 'Left to right',
    icon: 'ltr',
    context: 'editable',
    onAction: () => editor.execCommand('mceDirectionLTR'),
    onSetup: getNodeChangeHandler(editor, 'ltr'),
  });

  editor.ui.registry.addToggleButton('rtl', {
    tooltip: 'Right to left',
    icon: 'rtl',
    context: 'editable',
    onAction: () => editor.execCommand('mceDirectionRTL'),
    onSetup: getNodeChangeHandler(editor, 'rtl')
  });
};

export {
  register
};
