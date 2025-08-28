import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';

/*
      <div>
        <p1>
          {t1:This is a test page. A test page contains }<span1>{t2:many}</span1>{t3: things. Like:}
        </p1>

        <!-- P3 is before P2 because SelectorTest does last-child checks on P2 -->
        <ul>
          <li>
            {t7: Text in a node ancestor of another node with text (t6) }
            <div1>
              <p3>
                {t6: Nested inside div}
              </p3>
            </div1>
          </li>
        </ul>

        <p2>
          <span2>
            <span3>{t4:More data}</span3>
            <span4>
              {t5:And more data.}
            </span4>
          </span2>
        </p2>
      </div>
*/
const container = SugarElement.fromTag('div');
const d1 = SugarElement.fromTag('div');

const p1 = SugarElement.fromTag('p');
const p2 = SugarElement.fromTag('p');
const p3 = SugarElement.fromTag('p');

const s1 = SugarElement.fromTag('span');
const s2 = SugarElement.fromTag('span');
const s3 = SugarElement.fromTag('span');
const s4 = SugarElement.fromTag('span');

const t1 = SugarElement.fromText('This is a test page. A test page contains ');
const t2 = SugarElement.fromText('many');
const t3 = SugarElement.fromText(' things. Like:');
const t4 = SugarElement.fromText('More data');
const t5 = SugarElement.fromText('And more data.');
const t6 = SugarElement.fromText('Nested inside div');
const t7 = SugarElement.fromText('Text in a node ancestor of another node with text (t6)');

const ul = SugarElement.fromTag('ul');
const li = SugarElement.fromTag('li');
Insert.append(ul, li);
InsertAll.append(li, [ t7, d1 ]);

InsertAll.append(container, [ p1, ul, p2 ]);
InsertAll.append(p1, [ t1, s1, t3 ]);
InsertAll.append(s1, [ t2 ]);
InsertAll.append(p2, [ s2 ]);
InsertAll.append(s2, [ s3, s4 ]);
InsertAll.append(s3, [ t4 ]);
InsertAll.append(s4, [ t5 ]);
InsertAll.append(d1, [ p3 ]);
InsertAll.append(p3, [ t6 ]);

const connect = (): void => {
  const body = SugarBody.body();
  Insert.append(body, container);
};

export {
  container,
  d1,
  p1,
  p2,
  p3,
  s1,
  s2,
  s3,
  s4,
  t1,
  t2,
  t3,
  t4,
  t5,
  t6,
  t7,
  ul,
  li,

  connect
};
