import { GeneralSteps, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Uint8Array, Window } from '@ephox/sand';

import Actions from 'tinymce/themes/inlite/core/Actions';
import Theme from 'tinymce/themes/inlite/Theme';
import { Blob } from '@ephox/dom-globals';

UnitTest.asynctest('browser/core/ActionsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const wrap = function (f, args) {
    return function () {
      const currentArgs = Array.prototype.slice.call(arguments);
      return Step.sync(function () {
        f.apply(null, [].concat(args).concat(currentArgs));
      });
    };
  };

  const sInsertTableTests = function (editor, tinyApis) {
    const sInsertTableTest = function (cols, rows, expectedHtml, message) {
      const sInsertTable: any = wrap(Actions.insertTable, editor);

      return GeneralSteps.sequence([
        tinyApis.sSetContent(''),
        sInsertTable(cols, rows),
        tinyApis.sAssertContent(expectedHtml, message)
      ]);
    };

    return GeneralSteps.sequence([
      sInsertTableTest(2, 3, [
        '<table style="width: 100%;">',
        '<tbody>',
        '<tr>',
        '<td>&nbsp;</td>',
        '<td>&nbsp;</td>',
        '</tr>',
        '<tr>',
        '<td>&nbsp;</td>',
        '<td>&nbsp;</td>',
        '</tr>',
        '<tr>',
        '<td>&nbsp;</td>',
        '<td>&nbsp;</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join('\n'),
        'Should be a 2x3 table'
      ),

      sInsertTableTest(3, 2, [
        '<table style="width: 100%;">',
        '<tbody>',
        '<tr>',
        '<td>&nbsp;</td>',
        '<td>&nbsp;</td>',
        '<td>&nbsp;</td>',
        '</tr>',
        '<tr>',
        '<td>&nbsp;</td>',
        '<td>&nbsp;</td>',
        '<td>&nbsp;</td>',
        '</tr>',
        '</tbody>',
        '</table>'
      ].join('\n'),
        'Should be a 3x2 table'
      )
    ]);
  };

  const sFormatBlockTests = function (editor, tinyApis) {
    const sFormatBlockTest = function (name) {
      const sFormatBlock: any = wrap(Actions.formatBlock, editor);

      return GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([0], 0),
        sFormatBlock(name),
        tinyApis.sAssertContent('<' + name + '>a</' + name + '>', 'Should be a ' + name + ' block')
      ]);
    };

    return GeneralSteps.sequence([
      sFormatBlockTest('h1'),
      sFormatBlockTest('h2'),
      sFormatBlockTest('pre')
    ]);
  };

  const sCreateLinkTests = function (editor, tinyApis) {
    const sCreateLinkTest = function (inputHtml, url, sPath, sOffset, fPath, fOffset, expectedHtml) {
      const sCreateLink: any = wrap(Actions.createLink, editor);

      return GeneralSteps.sequence([
        tinyApis.sSetContent(inputHtml),
        tinyApis.sSetSelection(sPath, sOffset, fPath, fOffset),
        sCreateLink(url),
        tinyApis.sAssertContent(expectedHtml, 'Should have a link')
      ]);
    };

    return GeneralSteps.sequence([
      sCreateLinkTest('<p>a</p>', '#1', [0, 0], 0, [0, 0], 1, '<p><a href="#1">a</a></p>'),
      sCreateLinkTest('<p><a href="#1">a</a></p>', '#2', [0, 0], 0, [0, 0], 1, '<p><a href="#2">a</a></p>'),
      sCreateLinkTest('<p><a href="#1"><em>a</em></a></p>', '#2', [0, 0, 0], 0, [0, 0, 0], 1, '<p><a href="#2"><em>a</em></a></p>')
    ]);
  };

  const sUnlinkTests = function (editor, tinyApis) {
    const sUnlinkTest = function (inputHtml, sPath, sOffset, fPath, fOffset, expectedHtml) {
      const sUnlink = wrap(Actions.unlink, editor);

      return GeneralSteps.sequence([
        tinyApis.sSetContent(inputHtml),
        tinyApis.sSetSelection(sPath, sOffset, fPath, fOffset),
        sUnlink(),
        tinyApis.sAssertContent(expectedHtml, 'Should not have a link')
      ]);
    };

    return GeneralSteps.sequence([
      sUnlinkTest('<p>a</p>', [0, 0], 0, [0, 0], 1, '<p>a</p>'),
      sUnlinkTest('<p><a href="#">a</a></p>', [0, 0, 0], 0, [0, 0, 0], 1, '<p>a</p>'),
      sUnlinkTest('<p><a href="#"><em>a</em></a></p>', [0, 0, 0], 0, [0, 0, 0], 1, '<p><em>a</em></p>'),
      sUnlinkTest('<p><a href="#">a</a>b</p>', [0, 0, 0], 0, [0, 1], 1, '<p>ab</p>')
    ]);
  };

  const base64ToBlob = function (base64, type) {
    const buff = Window.atob(base64);
    const bytes = Uint8Array(buff.length);

    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = buff.charCodeAt(i);
    }

    return new Blob([bytes], { type });
  };

  const sInsertBlobTests = function (editor, tinyApis) {
    const sInsertBlobTest = function (inputHtml, path, offset, blob, base64, expectedHtml) {
      const sInsertBlob: any = wrap(Actions.insertBlob, editor);

      return GeneralSteps.sequence([
        tinyApis.sSetContent(inputHtml),
        tinyApis.sSetCursor(path, offset),
        sInsertBlob(blob, base64),
        tinyApis.sAssertContent(expectedHtml, 'Should have a image')
      ]);
    };

    const base64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const blob = base64ToBlob(base64, 'image/gif');

    return GeneralSteps.sequence([
      sInsertBlobTest('<p>a</p>', [0, 0], 0, base64, blob, '<p><img src="data:image/gif;base64,' + base64 + '" />a</p>')
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      sInsertTableTests(editor, tinyApis),
      sFormatBlockTests(editor, tinyApis),
      sInsertBlobTests(editor, tinyApis),
      sCreateLinkTests(editor, tinyApis),
      sUnlinkTests(editor, tinyApis)
    ], onSuccess, onFailure);
  }, {
    inline: true,
    theme: 'inlite',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
