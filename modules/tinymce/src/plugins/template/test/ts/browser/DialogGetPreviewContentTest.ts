import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/template/Plugin';
import { getPreviewContent } from 'tinymce/plugins/template/ui/Dialog';

import { Settings } from '../module/Settings';

const metaKey = Env.os.isMacOS() || Env.os.isiOS() ? 'e.metaKey' : 'e.ctrlKey && !e.altKey';
const host = document.location.host;

const noCorsNoStyle = '<!DOCTYPE html><html><head>' +
  `<base href="http://${host}/">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/ui/oxide/content.min.css">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/content/default/content.css">` +
  '<script>document.addEventListener && document.addEventListener("click", function(e) {for (var elm = e.target; elm; elm = elm.parentNode) {if (elm.nodeName === "A" && !(' +
  metaKey +
  ')) {e.preventDefault();}}}, false);</script> ' +
  '</head><body class=""></body></html>';

const corsNoStyle = '<!DOCTYPE html><html><head>' +
  `<base href="http://${host}/">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/ui/oxide/content.min.css" crossorigin="anonymous">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/content/default/content.css" crossorigin="anonymous">` +
  '<script>document.addEventListener && document.addEventListener("click", function(e) {for (var elm = e.target; elm; elm = elm.parentNode) {if (elm.nodeName === "A" && !(' +
  metaKey +
  ')) {e.preventDefault();}}}, false);</script> </head><body class=""></body></html>';

const noCorsStyle = '<!DOCTYPE html><html><head>' +
  `<base href="http://${host}/">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/ui/oxide/content.min.css">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/content/default/content.css">` +
  '<style type="text/css">This is the style inserted into the document</style>' +
  '<script>document.addEventListener && document.addEventListener("click", function(e) {for (var elm = e.target; elm; elm = elm.parentNode) {if (elm.nodeName === "A" && !(' +
  metaKey +
  ')) {e.preventDefault();}}}, false);</script> ' +
  '</head><body class=""></body></html>';

const corsStyle = '<!DOCTYPE html><html><head>' +
  `<base href="http://${host}/">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/ui/oxide/content.min.css" crossorigin="anonymous">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/content/default/content.css" crossorigin="anonymous">` +
  '<style type="text/css">This is the style inserted into the document</style>' +
  '<script>document.addEventListener && document.addEventListener("click", function(e) {for (var elm = e.target; elm; elm = elm.parentNode) {if (elm.nodeName === "A" && !(' +
  metaKey +
  ')) {e.preventDefault();}}}, false);</script> ' +
  '</head><body class=""></body></html>';

const corsStyleAndContent = '<!DOCTYPE html><html><head>' +
  `<base href="http://${host}/">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/ui/oxide/content.min.css" crossorigin="anonymous">` +
  `<link type="text/css" rel="stylesheet" href="http://${host}/project/tinymce/js/tinymce/skins/content/default/content.css" crossorigin="anonymous">` +
  '<style type="text/css">This is the style inserted into the document</style>' +
  '<script>document.addEventListener && document.addEventListener("click", function(e) {for (var elm = e.target; elm; elm = elm.parentNode) {if (elm.nodeName === "A" && !(' +
  metaKey +
  ')) {e.preventDefault();}}}, false);</script> ' +
  '</head>' +
  '<body class=""><p>Custom content which was provided</p></body></html>';

describe('browser.tinymce.plugins.template.Dialog.getPreviewContent', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'template',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const checkPreview = (expected: string, html: string = '') => {
    const editor = hook.editor();
    assert.equal(getPreviewContent(editor, html), expected);
  };

  const { addSettings, cleanupSettings } = Settings(hook);

  afterEach(() => {
    cleanupSettings();
  });

  it('TINY-6115: Dialog.getPreviewContent: No CORS or content style, no previous HTML', () => {
    checkPreview(noCorsNoStyle);
  });

  it('TINY-6115: Dialog.getPreviewContent: CORS but no content style, no previous HTML', () => {
    addSettings({ content_css_cors: true });
    checkPreview(corsNoStyle);
  });

  it('TINY-6115: Dialog.getPreviewcontent: No CORS but content style, no previous HTML', () => {
    addSettings({ content_style: 'This is the style inserted into the document' });
    checkPreview(noCorsStyle);
  });

  it('TINY-6115: Dialog.getPreviewContent: No CORS but content style, no previous HTML', () => {
    addSettings({
      content_css_cors: true,
      content_style: 'This is the style inserted into the document'
    });
    checkPreview(corsStyle);
  });

  it('TINY-6115: Dialog.getPreviewContent: with provided content', () => {
    addSettings({
      content_css_cors: true,
      content_style: 'This is the style inserted into the document'
    });
    checkPreview(corsStyleAndContent, 'Custom content which was provided');
  });

  it('TINY-6115: Dialog.getPreviewContent: with provided html', () => {
    addSettings({
      content_css_cors: true,
      content_style: 'This is the style inserted into the document'
    });
    // TINY-9867: Preview content is parsed to minimise visual discrepancy with inserted content
    checkPreview('<p>Custom content here</p>', '<html>Custom content here');
  });
});
