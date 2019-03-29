import * as Body from 'ephox/sugar/api/node/Body';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as DomEvent from 'ephox/sugar/api/events/DomEvent';
import Element from 'ephox/sugar/api/node/Element';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Traverse from 'ephox/sugar/api/search/Traverse';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.asynctest('CssReflowTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const iframe = Element.fromHtml('<iframe style="height:100px; width:500px;" src="/project/@ephox/sugar/src/test/data/cssReflowTest.html"></iframe>');
  Insert.append(Body.body(), iframe);
  const run = DomEvent.bind(iframe, 'load', function () {
    run.unbind();
    try {
      checks();
      success();
    } catch (e) {
      failure(e);
    } finally {
      Remove.remove(iframe);
    }
  });

  const checks = function () {
    const iframeWin = iframe.dom().contentWindow;
    const iframeDoc = iframeWin.document;

    const styles = Element.fromTag('style', iframeDoc);
    Html.set(styles, 'span.style {border-left-style: solid; }');
    Insert.append(Element.fromDom(iframeDoc.head), styles);

    const reflowTest = Element.fromTag('div', iframeDoc);
    Insert.append(Element.fromDom(iframeDoc.body), reflowTest);
    Html.set(reflowTest, '<span class="style">text</span>');
    const newspan = Traverse.firstChild(reflowTest).getOrDie('test broke');
    Css.reflow(newspan);
    // TODO: I can't actually make this fail without a reflow, we need a more stressful test. But you get the idea.
    assert.eq('solid', Css.get(newspan, 'border-left-style'));
    Remove.remove(newspan);

  };
});
