import { UnitTest } from '@ephox/bedrock';
import { document, setTimeout } from '@ephox/dom-globals';
import { Class, Css, Element, Hierarchy, Html, Insert, Node, Remove } from '@ephox/sugar';
import * as Assertions from 'ephox/agar/api/Assertions';
import { Chain } from 'ephox/agar/api/Chain';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as UiFinder from 'ephox/agar/api/UiFinder';

UnitTest.asynctest('UiFinderTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const container = Element.fromHtml(
    '<div>' +
    '<p>this is something <strong>bold</strong> here</p>' +
    '<p>there is something else here</p>' +
    '</div>'
  );
  Insert.append(Element.fromDom(document.body), container);

  const teardown = function () {
    Remove.remove(container);
  };

  Pipeline.async({}, [
    UiFinder.sNotExists(container, 'em'),
    UiFinder.sExists(container, 'strong'),

    Chain.asStep(container, [
      UiFinder.cNotExists('em'),
      UiFinder.cExists('strong'),
      UiFinder.cFindIn('strong'),
      Chain.op(function (strong) {
        Assertions.assertEq('Checking contents of strong tag', 'bold', Html.get(strong));
      }),

      Chain.inject(container),
      UiFinder.cFindAllIn('strong'),
      Chain.op(function (strongs) {
        Assertions.assertEq('Should only find 1 strong', 1, strongs.length);
      }),

      Chain.inject(container),
      UiFinder.cFindAllIn('p'),
      Chain.op(function (ps) {
        Assertions.assertEq('Should find two paragraphs', 2, ps.length);
        Assertions.assertEq('Should be sugared paragraphs', 'p', Node.name(ps[0]));
      })
    ]),

    Step.sync(function () {
      const result = UiFinder.findIn(container, 'strong').getOrDie();
      Assertions.assertDomEq(
        'Checking findIn',
        Hierarchy.follow(container, [0, 1]).getOrDie('Invalid test data'),
        result
      );
    }),

    Step.sync(function () {
      const result = UiFinder.findAllIn(container, 'p');
      Assertions.assertEq('Checking findAllIn length', 2, result.length);
    }),

    Chain.asStep(container, [
      UiFinder.cFindIn('strong'),
      Chain.op(function (strong) {
        // Intentionally not waiting before calling next.
        Css.set(strong, 'display', 'none');
        setTimeout(function () {
          Css.remove(strong, 'display');
        }, 1000);
      }),

      Chain.inject(container),
      UiFinder.cWaitForVisible('Waiting for the strong tag to reappear', 'strong')
    ]),

    Chain.asStep(container, [
      UiFinder.cFindIn('strong'),
      Chain.op(function (strong) {
        // Intentionally not waiting before calling next.
        setTimeout(function () {
          Class.add(strong, 'changing-state');
        }, 200);
      }),

      Chain.inject(container),
      UiFinder.cWaitForState('Waiting for the strong tag to gain class: changing-state', 'strong', function (elem) {
        return Class.has(elem, 'changing-state');
      })
    ]),

    Chain.asStep(container, [
      UiFinder.cFindIn('strong'),
      Chain.op(function (strong) {
        // Intentionally not waiting before calling next.
        setTimeout(function () {
          Class.add(strong, 'changing-state-waitfor');
        }, 200);
      }),

      Chain.inject(container),
      UiFinder.cWaitFor('Waiting for the strong tag to gain class: changing-state-waitfor', 'strong.changing-state-waitfor')
    ])
  ], function () { teardown(); success(); }, failure);
});

