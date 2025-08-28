import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as DomEvent from 'ephox/sugar/api/events/DomEvent';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Html from 'ephox/sugar/api/properties/Html';
import * as Traverse from 'ephox/sugar/api/search/Traverse';

UnitTest.asynctest('CssReflowTest', (success, failure) => {

  const iframe = SugarElement.fromHtml<HTMLIFrameElement>('<iframe style="height:100px; width:500px;" src="/project/@ephox/sugar/src/test/data/cssReflowTest.html"></iframe>');
  Insert.append(SugarBody.body(), iframe);
  const run = DomEvent.bind(iframe, 'load', () => {
    run.unbind();
    try {
      checks();
      success();
    } catch (e: any) {
      failure(e);
    } finally {
      Remove.remove(iframe);
    }
  });

  const checks = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const iframeWin = iframe.dom.contentWindow!;
    const iframeDoc = iframeWin.document;

    const styles = SugarElement.fromTag('style', iframeDoc);
    Html.set(styles, 'span.style {border-left-style: solid; }');
    Insert.append(SugarElement.fromDom(iframeDoc.head), styles);

    const reflowTest = SugarElement.fromTag('div', iframeDoc);
    Insert.append(SugarElement.fromDom(iframeDoc.body), reflowTest);
    Html.set(reflowTest, '<span class="style">text</span>');
    const newspan = Traverse.firstChild(reflowTest).getOrDie('test broke') as SugarElement<HTMLSpanElement>;
    Css.reflow(newspan);
    // TODO: I can't actually make this fail without a reflow, we need a more stressful test. But you get the idea.
    Assert.eq('', 'solid', Css.get(newspan, 'border-left-style'));
    Remove.remove(newspan);

  };
});
