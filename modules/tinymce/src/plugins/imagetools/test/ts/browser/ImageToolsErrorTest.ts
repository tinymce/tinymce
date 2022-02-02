import { Assertions, Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Html, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/imagetools/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as ImageUtils from '../module/test/ImageUtils';

describe('browser.tinymce.plugins.imagetools.ImageToolsErrorTest', () => {
  const uploadHandlerState = ImageUtils.createStateContainer();
  const corsUrl = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'imagetools',
    automatic_uploads: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const pAssertErrorMessage = async (html: string) => {
    const content = await UiFinder.pWaitFor('Find notification', SugarBody.body(), '.tox-notification__body > p') as SugarElement<HTMLElement>;
    const actualHtml = Html.get(content);
    Assertions.assertHtml('Message html does not match', html, actualHtml);
  };

  const pCloseErrorMessage = async () => {
    const button = await UiFinder.pWaitFor('Could not find notification', SugarBody.body(), '.tox-notification > button');
    Mouse.click(button);
  };

  const pTestImageToolsError = async (proxyUrl: string, apiKey: string, errorMessage: string) => {
    const editor = hook.editor();
    uploadHandlerState.resetState();
    editor.settings.imagetools_proxy = proxyUrl;
    editor.settings.api_key = apiKey;
    await ImageUtils.pLoadImage(editor, corsUrl);
    TinySelections.select(editor, 'img', []);
    editor.execCommand('mceImageFlipHorizontal');
    await pAssertErrorMessage(errorMessage);
    await pCloseErrorMessage();
    editor.setContent('');
  };

  it('TBA: Incorrect service url no api key', () =>
    pTestImageToolsError('http://nonexistant.tiny.cloud/', undefined, 'ImageProxy HTTP error: Incorrect Image Proxy URL')
  );

  it('TBA: Incorrect service url with api key', () =>
    pTestImageToolsError('http://nonexistant.tiny.cloud/', 'fake_key', 'ImageProxy HTTP error: Incorrect Image Proxy URL')
  );

  it('TBA: 403 no api key', () =>
    pTestImageToolsError('/custom/403', undefined, 'ImageProxy HTTP error: Rejected request')
  );

  it('TBA: 403 with api key', () =>
    pTestImageToolsError('/custom/403', 'fake_key', 'ImageProxy Service error: Invalid JSON in service error message')
  );

  it('TBA: 403 with api key and return error data', () =>
    pTestImageToolsError('/custom/403data', 'fake_key', 'ImageProxy Service error: Unknown service error')
  );

  it('TBA: 404 no api key', () =>
    pTestImageToolsError('/custom/404', undefined, 'ImageProxy HTTP error: Could not find Image Proxy')
  );

  it('TBA: 404 with api key', () =>
    pTestImageToolsError('/custom/404', 'fake_key', 'ImageProxy Service error: Invalid JSON in service error message')
  );

  it('TBA: 404 with api key and return error data', () =>
    pTestImageToolsError('/custom/404data', 'fake_key', 'ImageProxy Service error: Failed to load image.')
  );
});
