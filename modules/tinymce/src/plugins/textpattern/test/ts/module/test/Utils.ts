import { ApproxStructure, GeneralSteps, Keys, Logger, Step, StructAssert } from '@ephox/agar';
import { Arr, Unicode } from '@ephox/katamari';
import { TinyActions, TinyApis } from '@ephox/mcagar';

const sSetContentAndFireKeystroke = function (key: number) {
  return function (tinyApis: TinyApis, tinyActions: TinyActions, content: string, offset = content.length, elementPath = [0, 0], wrapInP = true) {
    return Logger.t(`Set content and press ${key}`, GeneralSteps.sequence([
      tinyApis.sSetContent(wrapInP ? '<p>' + content + '</p>' : content),
      tinyApis.sFocus(),
      tinyApis.sSetCursor(
        elementPath,
        offset
      ),
      tinyActions.sContentKeystroke(key, {}),
    ]));
  };
};

const sSetContentAndPressSpace = (tinyApis: TinyApis, tinyActions: TinyActions, content: string, offset = content.length, elementPath = [0, 0]) => {
  return Step.label(`Set content and press space`, GeneralSteps.sequence([
    tinyApis.sSetContent('<p>' + content + '</p>'),
    tinyApis.sFocus(),
    tinyApis.sSetCursor(
      elementPath,
      offset
    ),
    tinyApis.sExecCommand('mceInsertContent', ' '),
    tinyActions.sContentKeystroke(32, {}),
  ]));
};

const withTeardown = function (steps: Step<any, any>[], teardownStep: Step<any, any>) {
  return Arr.bind(steps, function (step) {
    return [step, teardownStep];
  });
};

const bodyStruct = function (children: StructAssert[]) {
  return ApproxStructure.build(function (s, str) {
    return s.element('body', {
      children
    });
  });
};

const inlineStructHelper = function (tag: string, content: string) {
  return ApproxStructure.build(function (s, str) {
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

const inlineBlockStructHelper = function (tag: string, content: string) {
  return ApproxStructure.build(function (s, str) {
    return bodyStruct([
      s.element('p', {
        children: [
          s.element(tag, {
            children: [
              s.text(str.is(content), true),
            ]
          }),
          s.zeroOrOne(s.text(str.is(''), true))
        ]
      }),
      s.element('p', {})
    ]);
  });
};

const blockStructHelper = function (tag: string, content: string) {
  return ApproxStructure.build(function (s, str) {
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

const forcedRootBlockInlineStructHelper = function (tag: string, content: string) {
  return ApproxStructure.build(function (s, str) {
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

const forcedRootBlockStructHelper = function (tag: string, content: string) {
  return ApproxStructure.build(function (s, str) {
    return bodyStruct([
      s.element(tag, {
        children: [
          s.text(str.is(content), true),
          s.element('br', {}),
          s.element('br', {})
        ]
      }),
    ]);
  });
};

export default {
  sSetContentAndPressSpace,
  sSetContentAndPressEnter: sSetContentAndFireKeystroke(Keys.enter()),
  withTeardown,
  bodyStruct,
  inlineStructHelper,
  inlineBlockStructHelper,
  blockStructHelper,
  forcedRootBlockInlineStructHelper,
  forcedRootBlockStructHelper
};
