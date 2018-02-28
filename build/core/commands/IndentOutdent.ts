import { Editor } from 'tinymce/core/api/Editor';
import { Arr } from '@ephox/katamari';

const indentElement = (dom, command: string, useMargin: boolean, value: number, unit: string, element: HTMLElement) => {
  if (dom.getContentEditable(element) === 'false') {
    return;
  }

  if (element.nodeName !== 'LI') {
    let indentStyleName = useMargin ? 'margin' : 'padding';
    indentStyleName = element.nodeName === 'TABLE' ? 'margin' : indentStyleName;
    indentStyleName += dom.getStyle(element, 'direction', true) === 'rtl' ? 'Right' : 'Left';

    if (command === 'outdent') {
      const styleValue = Math.max(0, parseInt(element.style[indentStyleName] || 0, 10) - value);
      dom.setStyle(element, indentStyleName, styleValue ? styleValue + unit : '');
    } else {
      const styleValue = (parseInt(element.style[indentStyleName] || 0, 10) + value) + unit;
      dom.setStyle(element, indentStyleName, styleValue);
    }
  }
};

export const handle = (editor: Editor, command: string) => {
  const { settings, dom, selection, formatter } = editor;
  const indentUnit = /[a-z%]+$/i.exec(settings.indentation)[0];
  const indentValue = parseInt(settings.indentation, 10);
  const useMargin = editor.getParam('indent_use_margin', false);

  if (!editor.queryCommandState('InsertUnorderedList') && !editor.queryCommandState('InsertOrderedList')) {
    // If forced_root_blocks is set to false we don't have a block to indent so lets create a div
    if (!settings.forced_root_block && !dom.getParent(selection.getNode(), dom.isBlock)) {
      formatter.apply('div');
    }

    Arr.each(selection.getSelectedBlocks(), (element) =>
      indentElement(dom, command, useMargin, indentValue, indentUnit, element)
    );
  }
};