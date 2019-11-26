import { ApproxStructure } from '@ephox/agar';
import { Unicode } from '@ephox/katamari';

const sAssertSpanStruct = ApproxStructure.build(function (s, str) {
  return s.element('body', {
    children: [
      s.element('p', {
        children: [
          s.text(str.is('a')),
          s.element('span', {}),
          s.element('span', {}),
          s.text(str.is('b'))
        ]
      })
    ]
  });
});

const sAssertNbspStruct = ApproxStructure.build(function (s, str) {
  return s.element('body', {
    children: [
      s.element('p', {
        children: [
          s.text(str.is('a')),
          s.text(str.is(Unicode.nbsp)),
          s.text(str.is(Unicode.nbsp)),
          s.text(str.is('b'))
        ]
      })
    ]
  });
});

export {
  sAssertNbspStruct,
  sAssertSpanStruct
};
