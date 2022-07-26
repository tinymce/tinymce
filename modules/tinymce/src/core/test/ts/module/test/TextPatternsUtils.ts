import { ApproxStructure, Keys, StructAssert } from '@ephox/agar';
import { Thunk, Unicode } from '@ephox/katamari';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Options from 'tinymce/core/api/Options';
import * as Pattern from 'tinymce/core/textpatterns/core/Pattern';
import { PatternSet } from 'tinymce/core/textpatterns/core/PatternTypes';

const setContentAndFireKeystroke = (key: number) => {
  return (editor: Editor, content: string, offset = content.length, elementPath = [ 0, 0 ], wrapInP = true) => {
    editor.setContent(wrapInP ? '<p>' + content + '</p>' : content);
    editor.focus();
    TinySelections.setCursor(editor, elementPath, offset);
    TinyContentActions.keystroke(editor, key);
  };
};

const setContentAndPressSpace = (editor: Editor, content: string, offset = content.length, elementPath = [ 0, 0 ], blockElement = 'p'): void => {
  editor.setContent(`<${blockElement}>${content}</${blockElement}>`);
  editor.focus();
  TinySelections.setCursor(editor, elementPath, offset);
  editor.execCommand('mceInsertContent', false, ' ');
  TinyContentActions.keyup(editor, Keys.space());
};

const bodyStruct = (children: StructAssert[]): StructAssert => {
  return ApproxStructure.build((s, _str) => {
    return s.element('body', {
      children
    });
  });
};

const inlineStructHelper = (tag: string, content: string): StructAssert => {
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

const inlineBlockStructHelper = (tag: string, content: string): StructAssert => {
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

const blockStructHelper = (tag: string, content: string): StructAssert => {
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

const forcedRootBlockInlineStructHelper = (tag: string, content: string): StructAssert => {
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

const forcedRootBlockStructHelper = (tag: string, content: string): StructAssert => {
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

const getPatternSetFor = (hook: TinyHooks.Hook<Editor>): () => PatternSet => Thunk.cached(() => {
  const editor = hook.editor();
  const rawPatterns = Options.getTextPatterns(editor);
  const dynamicPatternsLookup = Options.getTextPatternsLookup(editor);
  return Pattern.createPatternSet(
    Pattern.fromRawPatterns(rawPatterns),
    dynamicPatternsLookup
  );
});

export {
  setContentAndPressSpace,
  setContentAndPressEnter,
  bodyStruct,
  inlineStructHelper,
  inlineBlockStructHelper,
  blockStructHelper,
  forcedRootBlockInlineStructHelper,
  forcedRootBlockStructHelper,
  getPatternSetFor
};
