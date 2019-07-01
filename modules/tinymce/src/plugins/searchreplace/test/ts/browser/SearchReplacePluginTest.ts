import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import HtmlUtils from '../module/test/HtmlUtils';

UnitTest.asynctest(
  'browser.tinymce.plugins.searchreplace.SearchReplacePluginTest', (success, failure) => {

    const suite = LegacyUnit.createSuite();
    Theme();
    SearchreplacePlugin();

    suite.test('TestCase-TBA: SearchReplace: Find no match', function (editor) {
      editor.focus();
      editor.setContent('a');
      LegacyUnit.equal(0, editor.plugins.searchreplace.find('x'));
    });

    suite.test('TestCase-TBA: SearchReplace: Find single match', function (editor) {
      editor.setContent('a');
      LegacyUnit.equal(1, editor.plugins.searchreplace.find('a'));
    });

    suite.test('TestCase-TBA: SearchReplace: Find single match in multiple elements', function (editor) {
      editor.setContent('t<b>e</b><i>xt</i>');
      LegacyUnit.equal(1, editor.plugins.searchreplace.find('text'));
    });

    suite.test('TestCase-TBA: SearchReplace: Find single match, match case: true', function (editor) {
      editor.setContent('a A');
      LegacyUnit.equal(1, editor.plugins.searchreplace.find('A', true));
    });

    suite.test('TestCase-TBA: SearchReplace: Find single match, whole words: true', function (editor) {
      editor.setContent('a Ax');
      LegacyUnit.equal(1, editor.plugins.searchreplace.find('a', false, true));
    });

    suite.test('TestCase-TBA: SearchReplace: Find multiple matches', function (editor) {
      editor.setContent('a b A');
      LegacyUnit.equal(2, editor.plugins.searchreplace.find('a'));
    });

    suite.test('TestCase-TBA: SearchReplace: Find and replace single match', function (editor) {
      editor.setContent('a');
      editor.plugins.searchreplace.find('a');
      LegacyUnit.equal(editor.plugins.searchreplace.replace('x'), false);
      LegacyUnit.equal('<p>x</p>', editor.getContent());
    });

    suite.test('TestCase-TBA: SearchReplace: Find and replace first in multiple matches', function (editor) {
      editor.setContent('a b a');
      editor.plugins.searchreplace.find('a');
      LegacyUnit.equal(editor.plugins.searchreplace.replace('x'), true);
      LegacyUnit.equal('<p>x b a</p>', editor.getContent());
    });

    suite.test('TestCase-TBA: SearchReplace: Find and replace two consecutive spaces', function (editor) {
      editor.setContent('a&nbsp; b');
      editor.plugins.searchreplace.find('a  ');
      LegacyUnit.equal(editor.plugins.searchreplace.replace('x'), false);
      LegacyUnit.equal('<p>xb</p>', editor.getContent());
    });

    suite.test('TestCase-TBA: SearchReplace: Find and replace consecutive spaces', function (editor) {
      editor.setContent('a&nbsp; &nbsp;b');
      editor.plugins.searchreplace.find('a   ');
      LegacyUnit.equal(editor.plugins.searchreplace.replace('x'), false);
      LegacyUnit.equal('<p>xb</p>', editor.getContent());
    });

    suite.test('TestCase-TBA: SearchReplace: Find and replace all in multiple matches', function (editor) {
      editor.setContent('a b a');
      editor.plugins.searchreplace.find('a');
      LegacyUnit.equal(editor.plugins.searchreplace.replace('x', true, true), false);
      LegacyUnit.equal('<p>x b x</p>', editor.getContent());
    });

    suite.test('TestCase-TBA: SearchReplace: Find and replace all spaces with new lines', function (editor) {
      editor.setContent('a&nbsp; &nbsp;b<br/><br/>ab&nbsp;c');
      editor.plugins.searchreplace.find(' ');
      LegacyUnit.equal(editor.plugins.searchreplace.replace('x', true, true), false);
      LegacyUnit.equal('<p>axxxb<br /><br />abxc</p>', editor.getContent());
    });

    suite.test('TestCase-TBA: SearchReplace: Find multiple matches, move to next and replace', function (editor) {
      editor.setContent('a a');
      LegacyUnit.equal(2, editor.plugins.searchreplace.find('a'));
      editor.plugins.searchreplace.next();
      LegacyUnit.equal(editor.plugins.searchreplace.replace('x'), true);
      LegacyUnit.equal('<p>a x</p>', editor.getContent());
    });

    suite.test('TestCase-TBA: SearchReplace: Find and replace fragmented match', function (editor) {
      editor.setContent('<b>te<i>s</i>t</b><b>te<i>s</i>t</b>');
      editor.plugins.searchreplace.find('test');
      LegacyUnit.equal(editor.plugins.searchreplace.replace('abc'), true);
      LegacyUnit.equal(editor.getContent(), '<p><b>abc</b><b>te<i>s</i>t</b></p>');
    });

    suite.test('TestCase-TBA: SearchReplace: Find and replace all fragmented matches', function (editor) {
      editor.setContent('<b>te<i>s</i>t</b><b>te<i>s</i>t</b>');
      editor.plugins.searchreplace.find('test');
      LegacyUnit.equal(editor.plugins.searchreplace.replace('abc', true, true), false);
      LegacyUnit.equal(editor.getContent(), '<p><b>abc</b><b>abc</b></p>');
    });

    suite.test('TestCase-TBA: SearchReplace: Find multiple matches, move to next and replace backwards', function (editor) {
      editor.setContent('a a');
      LegacyUnit.equal(2, editor.plugins.searchreplace.find('a'));
      editor.plugins.searchreplace.next();
      LegacyUnit.equal(editor.plugins.searchreplace.replace('x', false), true);
      LegacyUnit.equal(editor.plugins.searchreplace.replace('y', false), false);
      LegacyUnit.equal('<p>y x</p>', editor.getContent());
    });

    suite.test('TestCase-TBA: SearchReplace: Find multiple matches and unmark them', function (editor) {
      editor.setContent('a b a');
      LegacyUnit.equal(2, editor.plugins.searchreplace.find('a'));
      editor.plugins.searchreplace.done();
      LegacyUnit.equal('a', editor.selection.getContent());
      LegacyUnit.equal(0, editor.getBody().getElementsByTagName('span').length);
    });

    suite.test('TestCase-TBA: SearchReplace: Find multiple matches with pre blocks', function (editor) {
      editor.getBody().innerHTML = 'abc<pre>  abc  </pre>abc';
      LegacyUnit.equal(3, editor.plugins.searchreplace.find('b'));
      LegacyUnit.equal(HtmlUtils.normalizeHtml(editor.getBody().innerHTML), (
        'a<span class="mce-match-marker mce-match-marker-selected" data-mce-bogus="1" data-mce-index="0">b</span>c' +
        '<pre>  a<span class="mce-match-marker" data-mce-bogus="1" data-mce-index="1">b</span>c  </pre>' +
        'a<span class="mce-match-marker" data-mce-bogus="1" data-mce-index="2">b</span>c'
      ));
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, Log.steps('TBA', 'SearchReplace: Find and replace matches', suite.toSteps(editor)), onSuccess, onFailure);
    }, {
      plugins: 'searchreplace',
      valid_elements: 'b,i,br',
      indent: false,
      base_url: '/project/tinymce/js/tinymce',
      theme: 'silver'
    }, success, failure);
  }
);
