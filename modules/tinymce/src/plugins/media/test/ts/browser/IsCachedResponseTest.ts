import { Assertions, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { Html, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.IsCachedResponseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    media_url_resolver: (data, resolve, reject) => {
      if (data.url === 'test') {
        resolve({
          html: '<div>x</div>' });
      } else {
        reject('error');
      }
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  const pWaitForAndAssertNotification = async (expected: string) => {
    const notification = await UiFinder.pWaitFor('Could not find notification', SugarBody.body(), 'div.tox-notification__body') as SugarElement<HTMLElement>;
    const html = Html.get(notification);
    Assertions.assertHtml('Plugin list html does not match', expected, html);
  };

  it('TBA: test cached response', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit media"]');
    await TinyUiActions.pWaitForDialog(editor);
    const input = await Utils.pSetSourceInput(editor, 'test');
    Utils.fakeEvent(input, 'paste');
    await Waiter.pWait(0); // wait is needed because paste is triggered async
    await Utils.pAssertEmbedData(editor, '<div>x</div>');
    await Utils.pSetSourceInput(editor, 'XXX');
    TinyUiActions.submitDialog(editor);

    await pWaitForAndAssertNotification('<p>Media embed handler threw unknown error.</p>');
    TinyAssertions.assertContent(editor, '');
  });
});
