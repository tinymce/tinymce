import { ApproxStructure } from '@ephox/agar';

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
          s.text(str.is('\u00a0')),
          s.text(str.is('\u00a0')),
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