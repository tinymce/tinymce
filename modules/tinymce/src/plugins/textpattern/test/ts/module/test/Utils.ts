import { ApproxStructure, GeneralSteps, Keys, Logger, Step } from '@ephox/agar';
import { Arr } from '@ephox/katamari';

const sSetContentAndFireKeystroke = function (key) {
  return function (tinyApis, tinyActions, content: string, offset = content.length, elementPath = [0, 0], wrapInP = true) {
    return Logger.t(`Set content and press ${key}`, GeneralSteps.sequence([
      tinyApis.sSetContent(wrapInP ? '<p>' + content + '</p>' : content),
      tinyApis.sFocus,
      tinyApis.sSetCursor(
        elementPath,
        offset
      ),
      tinyActions.sContentKeystroke(key, {}),
    ]));
  };
};

const sSetContentAndPressSpace = (tinyApis, tinyActions, content: string, offset = content.length, elementPath = [0, 0]) => {
  return Step.label(`Set content and press space`, GeneralSteps.sequence([
    tinyApis.sSetContent('<p>' + content + '</p>'),
    tinyApis.sFocus,
    tinyApis.sSetCursor(
      elementPath,
      offset
    ),
    tinyApis.sExecCommand('mceInsertContent', ' '),
    tinyActions.sContentKeystroke(32, {}),
  ]));
};

const withTeardown = function (steps, teardownStep) {
  return Arr.bind(steps, function (step) {
    return [step, teardownStep];
  });
};

const bodyStruct = function (children) {
  return ApproxStructure.build(function (s, str) {
    return s.element('body', {
      children
    });
  });
};

const inlineStructHelper = function (tag, content) {
  return ApproxStructure.build(function (s, str) {
    return bodyStruct([
      s.element('p', {
        children: [
          s.element(tag, {
            children: [
              s.text(str.is(content), true)
            ]
          }),
          s.text(str.is('\u00A0'), true)
        ]
      })
    ]);
  });
};

const inlineBlockStructHelper = function (tag, content) {
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

const blockStructHelper = function (tag, content) {
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

const forcedRootBlockInlineStructHelper = function (tag, content) {
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

const forcedRootBlockStructHelper = function (tag, content) {
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
