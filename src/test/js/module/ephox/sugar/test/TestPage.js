import Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import Insert from 'ephox/sugar/api/dom/Insert';
import InsertAll from 'ephox/sugar/api/dom/InsertAll';

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
var container = Element.fromTag('div');
var d1 = Element.fromTag('div');

var p1 = Element.fromTag('p');
var p2 = Element.fromTag('p');
var p3 = Element.fromTag('p');

var s1 = Element.fromTag('span');
var s2 = Element.fromTag('span');
var s3 = Element.fromTag('span');
var s4 = Element.fromTag('span');

var t1 = Element.fromText('This is a test page. A test page contains ');
var t2 = Element.fromText('many');
var t3 = Element.fromText(' things. Like:');
var t4 = Element.fromText('More data');
var t5 = Element.fromText('And more data.');
var t6 = Element.fromText('Nested inside div');
var t7 = Element.fromText('Text in a node ancestor of another node with text (t6)');

var ul = Element.fromTag('ul');
var li = Element.fromTag('li');
Insert.append(ul, li);
InsertAll.append(li, [t7, d1]);

InsertAll.append(container, [p1, ul, p2]);
InsertAll.append(p1, [t1, s1, t3]);
InsertAll.append(s1, [t2]);
InsertAll.append(p2, [s2]);
InsertAll.append(s2, [s3, s4]);
InsertAll.append(s3, [t4]);
InsertAll.append(s4, [t5]);
InsertAll.append(d1, [p3]);
InsertAll.append(p3, [t6]);

var connect = function () {
  var body = Body.body();
  Insert.append(body, container);
};

export default <any> {
  container: container,
  d1: d1,
  p1: p1,
  p2: p2,
  p3: p3,
  s1: s1,
  s2: s2,
  s3: s3,
  s4: s4,
  t1: t1,
  t2: t2,
  t3: t3,
  t4: t4,
  t5: t5,
  t6: t6,
  t7: t7,
  ul: ul,
  li: li,

  connect: connect
};