import { ApproxStructure, StructAssert } from '@ephox/agar';
import { Unicode } from '@ephox/katamari';

const assertStruct = (paraStruct: StructAssert[]) => ApproxStructure.build((s, _str) => s.element('body', {
  children: [
    s.element('p', {
      children: paraStruct
    })
  ]
}));

const assertSpanStruct = assertStruct(ApproxStructure.build((s, str) => [
  s.text(str.is('a')),
  s.element('span', {
    children: [
      s.text(str.is(Unicode.nbsp))
    ]
  }),
  s.element('span', {
    children: [
      s.text(str.is(Unicode.nbsp))
    ]
  }),
  s.text(str.is('b'))
]));

const assertNbspStruct = assertStruct(ApproxStructure.build((s, str) => [
  s.text(str.is('a')),
  s.text(str.is(Unicode.nbsp)),
  s.text(str.is(Unicode.nbsp)),
  s.text(str.is('b'))
]));

export {
  assertStruct,
  assertNbspStruct,
  assertSpanStruct
};
