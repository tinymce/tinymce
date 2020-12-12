import { ApproxStructure, GeneralSteps, Keys, Logger, Step, StructAssert } from '@ephox/agar';
import { Arr, Unicode } from '@ephox/katamari';
import { TinyActions, TinyApis } from '@ephox/mcagar';

const sSetContentAndFireKeystroke = (key: number) => {
  return (tinyApis: TinyApis, tinyActions: TinyActions, content: string, offset = content.length, elementPath = [ 0, 0 ], wrapInP = true) => {
    return Logger.t(`Set content and press ${key}`, GeneralSteps.sequence([
      tinyApis.sSetContent(wrapInP ? '<p>' + content + '</p>' : content),
      tinyApis.sFocus(),
      tinyApis.sSetCursor(
        elementPath,
        offset
      ),
      tinyActions.sContentKeystroke(key, {})
    ]));
  };
};

const sSetContentAndPressSpace = (tinyApis: TinyApis, tinyActions: TinyActions, content: string, offset = content.length, elementPath = [ 0, 0 ]) => Step.label('Set content and press space', GeneralSteps.sequence([
  tinyApis.sSetContent('<p>' + content + '</p>'),
  tinyApis.sFocus(),
  tinyApis.sSetCursor(
    elementPath,
    offset
  ),
  tinyApis.sExecCommand('mceInsertContent', ' '),
  tinyActions.sContentKeystroke(32, {})
]));

const withTeardown = (steps: Step<any, any>[], teardownStep: Step<any, any>) => {
  return Arr.bind(steps, (step) => {
    return [ step, teardownStep ];
  });
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

const sSetContentAndPressEnter = sSetContentAndFireKeystroke(Keys.enter());

export {
  sSetContentAndPressSpace,
  sSetContentAndPressEnter,
  withTeardown,
  bodyStruct,
  inlineStructHelper,
  inlineBlockStructHelper,
  blockStructHelper,
  forcedRootBlockInlineStructHelper,
  forcedRootBlockStructHelper
};
