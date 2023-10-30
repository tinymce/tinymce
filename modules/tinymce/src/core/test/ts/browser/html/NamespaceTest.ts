import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as Namespace from 'tinymce/core/html/Namespace';

describe('browser.tinymce.core.html.NamespaceTest', () => {
  const createSvgElement = (name: string) => document.createElementNS('http://www.w3.org/2000/svg', name);

  it('isNonHtmlElementRootName', () => {
    assert.isTrue(Namespace.isNonHtmlElementRootName('svg'));
    assert.isFalse(Namespace.isNonHtmlElementRootName('span'));
  });

  it('isNonHtmlElementRoot', () => {
    assert.isTrue(Namespace.isNonHtmlElementRoot(createSvgElement('svg')));
    assert.isFalse(Namespace.isNonHtmlElementRoot(document.createElement('span')));
  });

  it('toScopeType', () => {
    assert.equal(Namespace.toScopeType(createSvgElement('svg')), 'svg');
    assert.equal(Namespace.toScopeType(document.createElement('span')), 'html');
  });

  it('Namespace tracker', () => {
    const tracker = Namespace.createNamespaceTracker();
    const scope = SugarElement.fromHtml(`
      <div>
        <p>
          <span>foo</span>
        </p>
        <svg>
          <circle>
            <desc>
              <p>bar</p>
            </desc>
          </circle>
        </svg>
        <span>baz</span>
      </div>
    `.trim());

    const walker = document.createTreeWalker(
      scope.dom,
      NodeFilter.SHOW_ELEMENT
    );

    const states: Array<[ string, Namespace.NamespaceType ]> = [];
    while (walker.nextNode()) {
      const type = tracker.track(walker.currentNode);
      assert.equal(type, tracker.current(), 'Current tracker state should be the last executed track result');
      states.push([ walker.currentNode.nodeName.toLowerCase(), type ]);
    }
    assert.deepEqual(states, [[ 'p', 'html' ], [ 'span', 'html' ], [ 'svg', 'svg' ], [ 'circle', 'svg' ], [ 'desc', 'svg' ], [ 'p', 'svg' ], [ 'span', 'html' ]]);

    tracker.track(createSvgElement('svg'));
    assert.equal(tracker.current(), 'svg');
    tracker.reset();
    assert.equal(tracker.current(), 'html');
  });
});
