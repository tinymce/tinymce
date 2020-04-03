import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Body, Element, Html, Insert, Remove } from '@ephox/sugar';
import * as TableContent from 'ephox/snooker/api/TableContent';

UnitTest.test('TableMergeContentTest', function () {
  const mergeContentTest = function (specs: { label: string; html: string; expected: string }[]) {
    const table = Element.fromTag('table');
    const row = Element.fromTag('tr');
    Insert.append(table, row);
    const cells = Arr.map(specs, function (item) {
      const cell = Element.fromTag('td');
      cell.dom().innerHTML = item.html;

      Insert.append(row, cell);
      return cell;
    });

    Insert.append(Body.body(), table);

    TableContent.merge(cells);
    Arr.each(specs, function (spec, i) {
      assert.eq(spec.expected, Html.get(cells[i]), () => spec.label + ' expected:\n' + spec.expected + '\n got: \n' + Html.get(cells[i]));
    });

    Remove.remove(table);

  };

  /*

    Todo:
      - feff chars should not breaketh
      - add \r \n chars after block tags ?

  */

  const spec1 = [
    {
      label: 'just a P block tag, there should NOT be a br proceeding it',
      html: '<p>There should not be a br after.</p>',
      expected: '<p>There should not be a br after.</p><p>Standard paragraph</p>' +
                ' I am a textnode and should have a br after the period.<br>' +
                '<img src="/project/@ephox/snooker/src/assets/img/ephox_nav.png"><br>' +
                '<span><div>Nested div<p> deep para</p></div> ' +
                '<span>nested span</span>there SHOULD be a br proceeding the span</span><br>'
    },
    {
      label: 'P tag, with a textnode after, there SHOULD be a br proceeding it',
      html: '<p>Standard paragraph</p> I am a textnode and should have a br after the period.',
      expected: ''
    },

    {
      label: 'img tag, with a textnode after, there SHOULD be a br proceeding it',
      html: '<img src="/project/@ephox/snooker/src/assets/img/ephox_nav.png">',
      expected: ''
    },
    {
      label: 'nested, with a textnode after, there SHOULD be a br proceeding it',
      html: '<span><div>Nested div<p> deep para</p></div> <span>nested span</span>there SHOULD be a br proceeding the span</span>',
      expected: ''
    }
  ];

  const spec2 = [
    {
      label: 'textnode followed by a block tag, there should NOT be a br proceeding the p',
      html: 'standard issue textnode <p>There should not be a br after.</p>',
      expected: 'standard issue textnode <p>There should not be a br after.</p><a href="/"><img src="/project/@ephox/snooker/src/assets/img/ephox_nav.png"> I am inline textnode</a><br>textnode with empty block tag <div></div>'
    },
    {
      label: 'Img wrapped in an Anchor tag with text, there should be a BR after',
      html: '<a href="/"><img src="/project/@ephox/snooker/src/assets/img/ephox_nav.png"> I am inline textnode</a>',
      expected: ''
    },
    {
      label: ' = Gotach test = tricky textnode with an empty block tag',
      html: 'textnode with empty block tag <div></div>',
      expected: ''
    },
    {
      label: 'brs should NOT have more br appended',
      html: '<br><br><br>',
      expected: '<br><br><br>'
    }
  ];

  const spec3 = [
    {
      label: 'There should not be a br after the hr',
      html: 'standard issue textnode followed by a hr <hr>',
      expected: 'standard issue textnode followed by a hr <hr><ul style="list-style-type: disc;"><li>Abotts&nbsp;list</li><li>empty</li></ul><ul style="list-style-type: disc;"><li>deep</li><li>list<span>item</span></li></ul>'
    },
    {
      label: 'Empty cell should remain empty',
      html: '',
      expected: ''
    },
    {
      label: `lists should not have BR's after`,
      html: '<ul style="list-style-type: disc;"><li>Abotts&nbsp;list</li><li>empty</li></ul>',
      expected: ''
    },
    {
      label: 'complexed Lists, nested list with inline elements should not have a BR because its part of a list structure',
      html: '<ul style="list-style-type: disc;"><li>deep</li><li>list<span>item</span></li></ul>',
      expected: ''
    }
  ];

  const spec4 = [
    {
      label: 'A cell containing only a br should be maintained 0',
      html: '<br>',
      expected: '<br>'
    },
    {
      label: 'A cell containing only a br should be maintained 1',
      html: '<br>',
      expected: '<br>'
    },
    {
      label: 'A cell containing only a br should be maintained 3',
      html: '<br>',
      expected: '<br>'
    }
  ];

  const spec5 = [
    {
      label: 'A cell containing only a br should be maintained 0',
      html: '<br>',
      expected: '<hr>'
    },
    {
      label: 'A cell containing only a br should be maintained 1',
      html: '<br>',
      expected: '<br>'
    },
    {
      label: 'A cell containing only an inline hr should not be kept',
      html: '<hr>',
      expected: ''
    }
  ];

  const spec6 = [
    {
      label: 'A cell containing an image and an hr should maintain both',
      html: '<img src="/project/@ephox/snooker/src/assets/img/ephox_nav.png">',
      expected: '<img src="/project/@ephox/snooker/src/assets/img/ephox_nav.png"><br><hr>'
    },
    {
      label: 'A cell containing an image and an hr should maintain both',
      html: '<hr>',
      expected: ''
    }

  ];

  mergeContentTest(spec1);
  mergeContentTest(spec2);
  mergeContentTest(spec3);
  mergeContentTest(spec4);
  mergeContentTest(spec5);
  mergeContentTest(spec6);
});
