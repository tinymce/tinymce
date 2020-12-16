import { Insert, InsertAll, Remove, SelectorFind, SugarElement } from '@ephox/sugar';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Page = () => {

  const container = SugarElement.fromTag('div');
  const div1 = SugarElement.fromTag('div');
  const p1 = SugarElement.fromTag('p');
  const t1 = SugarElement.fromText('First paragraph');
  const p2 = SugarElement.fromTag('p');
  const t2 = SugarElement.fromText('Second ');

  const s1 = SugarElement.fromTag('span');
  const t3 = SugarElement.fromText('here');

  const s2 = SugarElement.fromTag('span');
  const t4 = SugarElement.fromText(' is ');

  const s3 = SugarElement.fromTag('span');
  const t5 = SugarElement.fromText('something');
  const p3 = SugarElement.fromTag('p');
  const t6 = SugarElement.fromText('More data');

  const div2 = SugarElement.fromTag('div');
  const t7 = SugarElement.fromText('Next ');
  const p4 = SugarElement.fromTag('p');
  const t8 = SugarElement.fromText('Section ');

  const s4 = SugarElement.fromTag('span');
  const t9 = SugarElement.fromText('no');
  const t10 = SugarElement.fromText('w');

  InsertAll.append(container, [ div1, div2 ]);
  InsertAll.append(div1, [ p1, p2, p3 ]);
  InsertAll.append(p1, [ t1 ]);
  InsertAll.append(p2, [ t2, s1, s2 ]);
  InsertAll.append(s1, [ t3 ]);
  InsertAll.append(s2, [ t4, s3 ]);
  InsertAll.append(s3, [ t5 ]);
  InsertAll.append(p3, [ t6 ]);
  InsertAll.append(div2, [ t7, p4 ]);
  InsertAll.append(p4, [ t8, s4 ]);
  InsertAll.append(s4, [ t9, t10 ]);

  const connect = () => {
    // IMPORTANT: Otherwise CSS display does not work.
    const body = SelectorFind.first('body').getOrDie('No body tag found!');
    Insert.append(body, container);
  };

  const disconnect = () => {
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
