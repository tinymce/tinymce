import * as DomEvent from './DomEvent';
import Element from '../node/Element';
import { document } from '@ephox/dom-globals';

const execute = function (f: () => void) {
  /*
   * We only use this in one place, so creating one listener per ready request is more optimal than managing
   * a single event with a queue of functions.
   */

  /* The general spec describes three states: loading, complete, and interactive.
   * https://html.spec.whatwg.org/multipage/dom.html#current-document-readiness
   *
   * loading: the document is not ready (still loading)
   * interactive: the document is ready, but sub-resources are still loading
   * complete: the document is completely ready.
   *
   * Note, IE and w3 schools talk about: uninitialized and loaded. We may have to handle them in the future.
   */
  if (document.readyState === 'complete' || document.readyState === 'interactive') { f(); } else {
    // Note that this fires when DOM manipulation is allowed, but before all resources are
    // available. This is the best practice but might be a bit weird.
    const listener = DomEvent.bind(Element.fromDom(document), 'DOMContentLoaded', function () { // IE9 minimum
      f();
      listener.unbind();
    });
  }
};

export {
  execute
};