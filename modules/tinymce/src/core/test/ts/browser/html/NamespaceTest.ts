import { context, describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import * as Namespace from 'tinymce/core/html/Namespace';

describe('browser.tinymce.core.html.NamespaceTest', () => {
  const createSvgElement = (name: string) => document.createElementNS('http://www.w3.org/2000/svg', name);

  it('isNonHtmlElementRootName', () => {
    assert.isTrue(Namespace.isNonHtmlElementRootName('svg'));
    assert.isTrue(Namespace.isNonHtmlElementRootName('math'));
    assert.isFalse(Namespace.isNonHtmlElementRootName('span'));
  });

  it('isNonHtmlElementRoot', () => {
    assert.isTrue(Namespace.isNonHtmlElementRoot(createSvgElement('svg')));
    assert.isTrue(Namespace.isNonHtmlElementRoot(createSvgElement('math')));
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
        <math>
          <mrow>
            <msup>
              <mi>a</mi>
              <mn>2</mn>
            </msup>
          </mrow>
        </math>
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

    assert.deepEqual(states, [
      [ 'p', 'html' ],
      [ 'span', 'html' ],
      [ 'svg', 'svg' ],
      [ 'circle', 'svg' ],
      [ 'desc', 'svg' ],
      [ 'p', 'svg' ],
      [ 'math', 'math' ],
      [ 'mrow', 'math' ],
      [ 'msup', 'math' ],
      [ 'mi', 'math' ],
      [ 'mn', 'math' ],
      [ 'span', 'html' ]
    ]);

    tracker.track(createSvgElement('svg'));
    assert.equal(tracker.current(), 'svg');
    tracker.reset();
    assert.equal(tracker.current(), 'html');
  });

  context('TINYMCE-14388: scope tracking of nested namespace elements', () => {
    const trackElements = (html: string): Array<[ string, Namespace.NamespaceType ]> => {
      const tracker = Namespace.createNamespaceTracker();
      const walker = document.createTreeWalker(SugarElement.fromHtml(html).dom, NodeFilter.SHOW_ELEMENT);
      const states: Array<[ string, Namespace.NamespaceType ]> = [];

      while (walker.nextNode()) {
        const type = tracker.track(walker.currentNode);
        assert.equal(type, tracker.current(), 'Current tracker state should be the last executed track result');
        states.push([ walker.currentNode.nodeName.toLowerCase(), type ]);
      }

      return states;
    };

    it('TINYMCE-14388: element after a nested svg is tracked as html', () => {
      assert.deepEqual(trackElements('<div><svg><svg><svg></svg></svg></svg><span></span></div>'), [
        [ 'svg', 'svg' ],
        [ 'svg', 'svg' ],
        [ 'svg', 'svg' ],
        [ 'span', 'html' ]
      ]);
    });

    it('TINYMCE-14388: element after a nested math is tracked as html', () => {
      assert.deepEqual(trackElements('<div><math><math></math></math><span></span></div>'), [
        [ 'math', 'math' ],
        [ 'math', 'math' ],
        [ 'span', 'html' ]
      ]);
    });

    it('TINYMCE-14388: element after a math nested in an svg is tracked as html', () => {
      assert.deepEqual(trackElements('<div><svg><math></math></svg><span></span></div>'), [
        [ 'svg', 'svg' ],
        [ 'math', 'math' ],
        [ 'span', 'html' ]
      ]);
    });

    it('TINYMCE-14388: element after an svg nested in a math is tracked as html', () => {
      assert.deepEqual(trackElements('<div><math><svg></svg></math><span></span></div>'), [
        [ 'math', 'math' ],
        [ 'svg', 'svg' ],
        [ 'span', 'html' ]
      ]);
    });
  });
});
