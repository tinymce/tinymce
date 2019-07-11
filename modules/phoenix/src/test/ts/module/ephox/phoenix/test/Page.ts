import { Element, Insert, InsertAll, Remove, SelectorFind } from '@ephox/sugar';

export const Page = function () {

  const container = Element.fromTag('div');
  const div1 = Element.fromTag('div');
  const p1 = Element.fromTag('p');
  const t1 = Element.fromText('First paragraph');
  const p2 = Element.fromTag('p');
  const t2 = Element.fromText('Second ');

  const s1 = Element.fromTag('span');
  const t3 = Element.fromText('here');

  const s2 = Element.fromTag('span');
  const t4 = Element.fromText(' is ');

  const s3 = Element.fromTag('span');
  const t5 = Element.fromText('something');
  const p3 = Element.fromTag('p');
  const t6 = Element.fromText('More data');

  const div2 = Element.fromTag('div');
  const t7 = Element.fromText('Next ');
  const p4 = Element.fromTag('p');
  const t8 = Element.fromText('Section ');

  const s4 = Element.fromTag('span');
  const t9 = Element.fromText('no');
  const t10 = Element.fromText('w');

  InsertAll.append(container, [div1, div2]);
  InsertAll.append(div1, [p1, p2, p3]);
  InsertAll.append(p1, [t1]);
  InsertAll.append(p2, [t2, s1, s2]);
  InsertAll.append(s1, [t3]);
  InsertAll.append(s2, [t4, s3]);
  InsertAll.append(s3, [t5]);
  InsertAll.append(p3, [t6]);
  InsertAll.append(div2, [t7, p4]);
  InsertAll.append(p4, [t8, s4]);
  InsertAll.append(s4, [t9, t10]);

  const connect = function () {
    // IMPORTANT: Otherwise CSS display does not work.
    const body = SelectorFind.first('body').getOrDie('No body tag found!');
    Insert.append(body, container);
  };

  const disconnect = function () {
    Remove.remove(container);
  };

  return {
    container,
    div1,
    p1,
    p2,
    s1,
    s2,
    s3,
    p3,
    div2,
    p4,
    s4,
    t1,
    t2,
    t3,
    t4,
    t5,
    t6,
    t7,
    t8,
    t9,
    t10,

    connect,
    disconnect
  };
};
