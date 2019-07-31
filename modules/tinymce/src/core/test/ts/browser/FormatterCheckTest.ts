import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.FormatterCheckTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  suite.test('Selected style element text', function (editor) {
    editor.focus();
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('bold'), true, 'Selected style element text');
  });

  suite.test('Selected style element with css styles', function (editor) {
    editor.formatter.register('color', { inline: 'span', styles: { color: '#ff0000' } });
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('color'), true, 'Selected style element with css styles');
  });

  suite.test('Selected style element with css styles indexed', function (editor) {
    editor.formatter.register('color', { inline: 'span', styles: ['color'] });
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('color'), true, 'Selected style element with css styles');
  });

  suite.test('Selected style element with attributes', function (editor) {
    editor.formatter.register('fontsize', { inline: 'font', attributes: { size: '7' } });
    editor.getBody().innerHTML = '<p><font size="7">1234</font></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('font')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('font')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('fontsize'), true, 'Selected style element with attributes');
  });

  suite.test('Selected style element text multiple formats', function (editor) {
    editor.formatter.register('multiple', [
      { inline: 'b' },
      { inline: 'strong' }
    ]);
    editor.getBody().innerHTML = '<p><strong>1234</strong></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('strong')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('strong')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('multiple'), true, 'Selected style element text multiple formats');
  });

  suite.test('Selected complex style element', function (editor) {
    editor.formatter.register('complex', { inline: 'span', styles: { fontWeight: 'bold' } });
    editor.getBody().innerHTML = '<p><span style="color:#ff0000; font-weight:bold">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('complex'), true, 'Selected complex style element');
  });

  suite.test('Selected non style element text', function (editor) {
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p>1234</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('bold'), false, 'Selected non style element text');
  });

  suite.test('Selected partial style element (start)', function (editor) {
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234</b>5678</p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('p')[0].lastChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('bold'), true, 'Selected partial style element (start)');
  });

  suite.test('Selected partial style element (end)', function (editor) {
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p>1234<b>5678</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('p')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('b')[0].lastChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('bold'), false, 'Selected partial style element (end)');
  });

  suite.test('Selected element text with parent inline element', function (editor) {
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b><em><span>1234</span></em></b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('bold'), true, 'Selected element text with parent inline element');
  });

  suite.test('Selected element match with variable', function (editor) {
    editor.formatter.register('complex', { inline: 'span', styles: { color: '%color' } });
    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('complex', { color: '#ff0000' }), true, 'Selected element match with variable');
  });

  suite.test('Selected element match with variable and function', function (editor) {
    editor.formatter.register('complex', {
      inline: 'span',
      styles: {
        color (vars) {
          return vars.color + '00';
        }
      }
    });

    editor.getBody().innerHTML = '<p><span style="color:#ff0000">1234</span></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('span')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('span')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('complex', { color: '#ff00' }), true, 'Selected element match with variable and function');
  });

  suite.test('matchAll', function (editor) {
    editor.getBody().innerHTML = '<p><b><i>a</i></b></p>';
    LegacyUnit.setSelection(editor, 'i', 0, 'i', 1);
    LegacyUnit.equal(editor.formatter.matchAll(['bold', 'italic', 'underline']), ['italic', 'bold']);
  });

  suite.test('canApply', function (editor) {
    editor.getBody().innerHTML = '<p>a</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 1);
    LegacyUnit.equal(editor.formatter.canApply('bold'), true);
  });

  suite.test('Custom onmatch handler', function (editor) {
    editor.formatter.register('format', {
      inline: 'span',
      onmatch (elm) {
        return elm.className === 'x';
      }
    });

    editor.setContent('<p><span class="a">a</span><span class="x">b</span></p>');
    LegacyUnit.setSelection(editor, 'span:nth-child(1)', 0, 'span:nth-child(1)', 0);
    LegacyUnit.equal(editor.formatter.match('format'), false, 'Should not match since the onmatch matches on x classes.');
    LegacyUnit.setSelection(editor, 'span:nth-child(2)', 0, 'span:nth-child(2)', 0);
    LegacyUnit.equal(editor.formatter.match('format'), true, 'Should match since the onmatch matches on x classes.');
  });

  suite.test('formatChanged complex format', function (editor) {
    let newState, newArgs;

    editor.formatter.register('complex', { inline: 'span', styles: { color: '%color' } });

    const handler = editor.formatter.formatChanged('complex', function (state, args) {
      newState = state;
      newArgs = args;
    }, true);

    editor.getBody().innerHTML = '<p>text</p>';
    LegacyUnit.setSelection(editor, 'p', 0, 'p', 4);

    // Check apply
    editor.formatter.apply('complex', { color: '#FF0000' });
    editor.nodeChanged();
    LegacyUnit.equal(newState, true);
    LegacyUnit.equal(newArgs.format, 'complex');
    LegacyUnit.equalDom(newArgs.node, editor.getBody().firstChild.firstChild);
    LegacyUnit.equal(newArgs.parents.length, 2);

    // Check remove
    editor.formatter.remove('complex', { color: '#FF0000' });
    editor.nodeChanged();
    LegacyUnit.equal(newState, false);
    LegacyUnit.equal(newArgs.format, 'complex');
    LegacyUnit.equalDom(newArgs.node, editor.getBody().firstChild);
    LegacyUnit.equal(newArgs.parents.length, 1);

    // Unbind the format change handler
    handler.unbind();
  });

  suite.test('Selected style element text', function (editor) {
    editor.formatter.register('bold', { inline: 'b' });
    editor.getBody().innerHTML = '<p><b>1234</b></p>';
    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('b')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('b')[0].firstChild, 4);
    editor.selection.setRng(rng);
    LegacyUnit.equal(editor.formatter.match('bold'), true, 'Selected style element text');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    indent: false,
    extended_valid_elements: 'b,i,span[style|class|contenteditable]',
    entities: 'raw',
    convert_fonts_to_spans: false,
    forced_root_block: false,
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
        'margin,margin-top,margin-right,margin-bottom,margin-left,display,text-align'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
