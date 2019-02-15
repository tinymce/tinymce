import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';



export const Page = function () {

  var container = Element.fromTag('div');
  var div1 = Element.fromTag('div');
  var p1 = Element.fromTag('p');
  var t1 = Element.fromText('First paragraph');
  var p2 = Element.fromTag('p');
  var t2 = Element.fromText('Second ');

  var s1 = Element.fromTag('span');
  var t3 = Element.fromText('here');

  var s2 = Element.fromTag('span');
  var t4 = Element.fromText(' is ');

  var s3 = Element.fromTag('span');
  var t5 = Element.fromText('something');
  var p3 = Element.fromTag('p');
  var t6 = Element.fromText('More data');

  var div2 = Element.fromTag('div');
  var t7 = Element.fromText('Next ');
  var p4 = Element.fromTag('p');
  var t8 = Element.fromText('Section ');

  var s4 = Element.fromTag('span');
  var t9 = Element.fromText('no');
  var t10 = Element.fromText('w');

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

  var connect = function () {
    // IMPORTANT: Otherwise CSS display does not work.
    var body = SelectorFind.first('body').getOrDie();
    Insert.append(body, container);
  };

  var disconnect = function () {
    Remove.remove(container);
  };

  return {
    container: container,
    div1: div1,
    p1: p1,
    p2: p2,
    s1: s1,
    s2: s2,
    s3: s3,
    p3: p3,
    div2: div2,
    p4: p4,
    s4: s4,
    t1: t1,
    t2: t2,
    t3: t3,
    t4: t4,
    t5: t5,
    t6: t6,
    t7: t7,
    t8: t8,
    t9: t9,
    t10: t10,

    connect: connect,
    disconnect: disconnect
  };
};