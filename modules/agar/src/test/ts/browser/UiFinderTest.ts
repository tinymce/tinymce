import { UnitTest } from '@ephox/bedrock-client';
import { document, setTimeout } from '@ephox/dom-globals';
import { Class, Css, Element, Hierarchy, Html, Insert, Node, Remove } from '@ephox/sugar';
import * as Assertions from 'ephox/agar/api/Assertions';
import { Chain } from 'ephox/agar/api/Chain';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as UiFinder from 'ephox/agar/api/UiFinder';

UnitTest.asynctest('UiFinderTest', (success, failure) => {

  const container = Element.fromHtml(
    '<div>' +
    '<p>this is something <strong>bold</strong> here</p>' +
    '<p>there is something else here</p>' +
    '</div>'
  );
  Insert.append(Element.fromDom(document.body), container);

  const teardown = () => {
    Remove.remove(container);
  };

  Pipeline.async({}, [
    UiFinder.sNotExists(container, 'em'),
    UiFinder.sExists(container, 'strong'),

    Chain.asStep(container, [
      UiFinder.cNotExists('em'),
      UiFinder.cExists('strong'),
      UiFinder.cFindIn('strong'),
      Chain.op((strong) => {
        Assertions.assertEq('Checking contents of strong tag', 'bold', Html.get(strong));
      }),

      Chain.inject(container),
      UiFinder.cFindAllIn('strong'),
      Chain.op((strongs) => {
        Assertions.assertEq('Should only find 1 strong', 1, strongs.length);
      }),

      Chain.inject(container),
      UiFinder.cFindAllIn('p'),
      Chain.op((ps) => {
        Assertions.assertEq('Should find two paragraphs', 2, ps.length);
        Assertions.assertEq('Should be sugared paragraphs', 'p', Node.name(ps[0]));
      })
    ]),

    Step.sync(() => {
      const result = UiFinder.findIn(container, 'strong').getOrDie();
      Assertions.assertDomEq(
        'Checking findIn',
        Hierarchy.follow(container, [ 0, 1 ]).getOrDie('Invalid test data'),
        result
      );
    }),

    Step.sync(() => {
      const result = UiFinder.findAllIn(container, 'p');
      Assertions.assertEq('Checking findAllIn length', 2, result.length);
    }),

    Chain.asStep(container, [
      UiFinder.cFindIn('strong'),
      Chain.op((strong) => {
        // Intentionally not waiting before calling next.
        Css.set(strong, 'display', 'none');
        setTimeout(() => {
          Css.remove(strong, 'display');
        }, 200);
      }),

      Chain.inject(container),
      UiFinder.cWaitForVisible('Waiting for the strong tag to reappear', 'strong')
    ]),

    Chain.asStep(container, [
      UiFinder.cFindIn('strong'),
      Chain.op((strong) => {
        // Intentionally not waiting before calling next.
        setTimeout(() => {
          Class.add(strong, 'changing-state');
        }, 50);
      }),

      Chain.inject(container),
      UiFinder.cWaitForState('Waiting for the strong tag to gain class: changing-state', 'strong', (elem) => Class.has(elem, 'changing-state'))
    ]),

    Chain.asStep(container, [
      UiFinder.cFindIn('strong'),
      Chain.op((strong) => {
        // Intentionally not waiting before calling next.
        setTimeout(() => {
          Class.add(strong, 'changing-state-waitfor');
        }, 50);
      }),

      Chain.inject(container),
      UiFinder.cWaitFor('Waiting for the strong tag to gain class: changing-state-waitfor', 'strong.changing-state-waitfor')
    ])
  ], () => { teardown(); success(); }, failure);
});
