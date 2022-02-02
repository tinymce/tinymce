import { ApproxStructure, Keys, StructAssert } from '@ephox/agar';
import { Unicode } from '@ephox/katamari';
import { TinyContentActions, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const setContentAndFireKeystroke = (key: number) => {
  return (editor: Editor, content: string, offset = content.length, elementPath = [ 0, 0 ], wrapInP = true) => {
    editor.setContent(wrapInP ? '<p>' + content + '</p>' : content);
    editor.focus();
    TinySelections.setCursor(editor, elementPath, offset);
    TinyContentActions.keystroke(editor, key);
  };
};

const setContentAndPressSpace = (editor: Editor, content: string, offset = content.length, elementPath = [ 0, 0 ]) => {
  editor.setContent('<p>' + content + '</p>');
  editor.focus();
  TinySelections.setCursor(editor, elementPath, offset);
  editor.execCommand('mceInsertContent', false, ' ');
  TinyContentActions.keystroke(editor, Keys.space());
};

const bodyStruct = (children: StructAssert[]) => {
  return ApproxStructure.build((s, _str) => {
    return s.element('body', {
      children
    });
  });
};

const inlineStructHelper = (tag: string, content: string) => {
  return ApproxStructure.build((s, str) => {
    return bodyStruct([
      s.element('p', {
        children: [
          s.element(tag, {
            children: [
              s.text(str.is(content), true)
            ]
          }),
          s.text(str.is(Unicode.nbsp), true)
        ]
      })
    ]);
  });
};

const inlineBlockStructHelper = (tag: string, content: string) => {
  return ApproxStructure.build((s, str) => {
    return bodyStruct([
      s.element('p', {
        children: [
          s.element(tag, {
            children: [
              s.text(str.is(content), true)
            ]
          }),
          s.zeroOrOne(s.text(str.is(''), true))
        ]
      }),
      s.element('p', {})
    ]);
  });
};

const blockStructHelper = (tag: string, content: string) => {
  return ApproxStructure.build((s, str) => {
    return bodyStruct([
      s.element(tag, {
        children: [
          s.text(str.is(content), true)
        ]
      }),
      s.element('p', {})
    ]);
  });
};

const forcedRootBlockInlineStructHelper = (tag: string, content: string) => {
  return ApproxStructure.build((s, str) => {
    return bodyStruct([
      s.element(tag, {
        children: [
          s.text(str.is(content), true)
        ]
      }),
      s.text(str.is('')),
      s.element('br', {}),
      s.element('br', {})
    ]);
  });
};

const forcedRootBlockStructHelper = (tag: string, content: string) => {
  return ApproxStructure.build((s, str) => {
    return bodyStruct([
      s.element(tag, {
        children: [
          s.text(str.is(content), true),
          s.element('br', {}),
          s.element('br', {})
        ]
      })
    ]);
  });
};

const setContentAndPressEnter = setContentAndFireKeystroke(Keys.enter());

export {
  setContentAndPressSpace,
  setContentAndPressEnter,
  bodyStruct,
  inlineStructHelper,
  inlineBlockStructHelper,
  blockStructHelper,
  forcedRootBlockInlineStructHelper,
  forcedRootBlockStructHelper
};
