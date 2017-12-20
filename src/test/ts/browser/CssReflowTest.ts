import Body from 'ephox/sugar/api/node/Body';
import Css from 'ephox/sugar/api/properties/Css';
import DomEvent from 'ephox/sugar/api/events/DomEvent';
import Element from 'ephox/sugar/api/node/Element';
import Html from 'ephox/sugar/api/properties/Html';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import Traverse from 'ephox/sugar/api/search/Traverse';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.asynctest('CssReflowTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var iframe = Element.fromHtml('<iframe style="height:100px; width:500px;" src="project/src/test/data/cssReflowTest.html"></iframe>');
  Insert.append(Body.body(), iframe);
  var run = DomEvent.bind(iframe, 'load', function () {
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

  var checks = function () {
    var iframeWin = iframe.dom().contentWindow;
    var iframeDoc = iframeWin.document;

    var styles = Element.fromTag('style', iframeDoc);
    Html.set(styles, 'span.style {border-left-style: solid; }');
    Insert.append(Element.fromDom(iframeDoc.head), styles);


    var reflowTest = Element.fromTag('div', iframeDoc);
    Insert.append(Element.fromDom(iframeDoc.body), reflowTest);
    Html.set(reflowTest, '<span class="style">text</span>');
    var newspan = Traverse.firstChild(reflowTest).getOrDie('test broke');
    Css.reflow(newspan);
    // TODO: I can't actually make this fail without a reflow, we need a more stressful test. But you get the idea.
    assert.eq('solid', Css.get(newspan, 'border-left-style'));
    Remove.remove(newspan);

  };
});

