import { ApproxStructure, StructAssert } from '@ephox/agar';
import { Unicode } from '@ephox/katamari';

const sAssertStruct = (paraStruct: StructAssert[]) => ApproxStructure.build((s, str) => {
  return s.element('body', {
    children: [
      s.element('p', {
        children: paraStruct
      })
    ]
  });
});

const sAssertSpanStruct = sAssertStruct(ApproxStructure.build((s, str) => {
  return [
    s.text(str.is('a')),
    s.element('span', {
      children: [
        s.text(str.is(Unicode.nbsp)),
      ]
    }),
    s.element('span', {
      children: [
        s.text(str.is(Unicode.nbsp)),
      ]
    }),
    s.text(str.is('b'))
  ];
}));

const sAssertNbspStruct = sAssertStruct(ApproxStructure.build((s, str) => {
  return [
    s.text(str.is('a')),
    s.text(str.is(Unicode.nbsp)),
    s.text(str.is(Unicode.nbsp)),
    s.text(str.is('b'))
  ];
}));

export {
  sAssertStruct,
  sAssertNbspStruct,
  sAssertSpanStruct
};
