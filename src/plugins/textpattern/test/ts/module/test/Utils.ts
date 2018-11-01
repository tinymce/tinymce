import { ApproxStructure, GeneralSteps, Keys } from '@ephox/agar';
import { Arr } from '@ephox/katamari';

const sSetContentAndPressKey = function (key) {
  return function (tinyApis, tinyActions, content) {
    return GeneralSteps.sequence([
      tinyApis.sSetContent('<p>' + content + '</p>'),
      tinyApis.sFocus,
      tinyApis.sSetCursor(
        [0, 0],
        content.length
      ),
      tinyActions.sContentKeystroke(key, {})
    ]);
  };
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
              s.text(str.is(content))
            ]
          }),
          s.text(str.is('\u00A0'))
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
              s.text(str.is(content)),
              s.anything()
            ]
          })
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
          s.text(str.is(content))
        ]
      }),
      s.element('p', {})
    ]);
  });
};

export default {
  sSetContentAndPressSpace: sSetContentAndPressKey(Keys.space()),
  sSetContentAndPressEnter: sSetContentAndPressKey(Keys.enter()),
  withTeardown,
  bodyStruct,
  inlineStructHelper,
  inlineBlockStructHelper,
  blockStructHelper
};