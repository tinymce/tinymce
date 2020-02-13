import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Fragments from 'tinymce/core/undo/Fragments';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.undo.FragmentsTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  const div = function (html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
  };

  const html = function (elm) {
    return elm.innerHTML;
  };

  suite.test('read', function () {
    LegacyUnit.deepEqual(Fragments.read(div('')), []);
    LegacyUnit.deepEqual(Fragments.read(div('a')), ['a']);
    LegacyUnit.deepEqual(Fragments.read(div('<!--a-->')), ['<!--a-->']);
    LegacyUnit.deepEqual(Fragments.read(div('<b>a</b>')), ['<b>a</b>']);
    LegacyUnit.deepEqual(Fragments.read(div('a<!--b--><b>c</b>')), ['a', '<!--b-->', '<b>c</b>']);
  });

  suite.test('read and exclude zero length text nodes', function () {
    const elm = div('<p>a</p><p>b</p>');
    elm.insertBefore(document.createTextNode(''), elm.lastChild);
    LegacyUnit.deepEqual(Fragments.read(elm), ['<p>a</p>', '<p>b</p>']);
  });

  suite.test('write', function () {
    LegacyUnit.deepEqual(html(Fragments.write([], div(''))), '');
    LegacyUnit.deepEqual(html(Fragments.write([], div('a'))), '');
    LegacyUnit.deepEqual(html(Fragments.write(['a'], div(''))), 'a');
    LegacyUnit.deepEqual(html(Fragments.write(['a'], div('a'))), 'a');
    LegacyUnit.deepEqual(html(Fragments.write(['a'], div('b'))), 'a');
    LegacyUnit.deepEqual(html(Fragments.write(['a', '<b>c</b>'], div('a<b>b</b>'))), 'a<b>c</b>');
    LegacyUnit.deepEqual(html(Fragments.write(['<b>c</b>', '<b>d</b>'], div('a<b>b</b>'))), '<b>c</b><b>d</b>');
    LegacyUnit.deepEqual(html(Fragments.write(['<b>c</b>', '<b>d</b>', '<!--e-->'], div('a<b>b</b>'))), '<b>c</b><b>d</b><!--e-->');
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
