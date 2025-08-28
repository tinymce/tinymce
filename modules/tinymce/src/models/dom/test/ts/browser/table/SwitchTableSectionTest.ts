import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.models.dom.table.SwitchTableSectionTest', () => {
  const basicContent = `<table>
<tbody>
<tr id="one">
<td>text</td>
</tr>
<tr id="two">
<td>text</td>
</tr>
</tbody>
</table>`;

  const theadExpected = `<table>
<thead>
<tr id="one">
<td>text</td>
</tr>
</thead>
<tbody>
<tr id="two">
<td>text</td>
</tr>
</tbody>
</table>`;

  const thsExpected = `<table>
<tbody>
<tr id="one">
<th scope="col">text</th>
</tr>
<tr id="two">
<td>text</td>
</tr>
</tbody>
</table>`;

  const reversedThsExpected = `<table>
<tbody>
<tr id="two">
<td>text</td>
</tr>
<tr id="one">
<th scope="col">text</th>
</tr>
</tbody>
</table>`;

  const bothExpected = `<table>
<thead>
<tr id="one">
<th scope="col">text</th>
</tr>
</thead>
<tbody>
<tr id="two">
<td>text</td>
</tr>
</tbody>
</table>`;

  const existingTheadExpected = `<table>
<thead>
<tr id="one">
<td>text</td>
</tr>
<tr id="two">
<td>text</td>
</tr>
</thead>
</table>`;

  const existingThsExpected = `<table>
<tbody>
<tr id="one">
<th scope="col">text</th>
</tr>
<tr id="two">
<th scope="col">text</th>
</tr>
</tbody>
</table>`;

  const existingBothExpected = `<table>
<thead>
<tr id="one">
<th scope="col">text</th>
</tr>
<tr id="two">
<th scope="col">text</th>
</tr>
</thead>
</table>`;

  const thsAndTheadExpected = `<table>
<thead>
<tr id="two">
<td>text</td>
</tr>
</thead>
<tbody>
<tr id="one">
<th scope="col">text</th>
</tr>
</tbody>
</table>`;

  const theadAndThsExpected = `<table>
<thead>
<tr id="one">
<td>text</td>
</tr>
</thead>
<tbody>
<tr id="two">
<th scope="col">text</th>
</tr>
</tbody>
</table>`;

  const thsAndBothExpected = `<table>
<thead>
<tr id="two">
<th scope="col">text</th>
</tr>
</thead>
<tbody>
<tr id="one">
<th scope="col">text</th>
</tr>
</tbody>
</table>`;

  const theadAndBothExpected = `<table>
<thead>
<tr id="one">
<td>text</td>
</tr>
<tr id="two">
<th scope="col">text</th>
</tr>
</thead>
</table>`;

  const tfootContent = `<table>
<tbody>
<tr id="two">
<td>text</td>
</tr>
</tbody>
<tfoot>
<tr id="one">
<td>text</td>
</tr>
</tfoot>
</table>`;

  const reversedBasicContent = `<table>
<tbody>
<tr id="two">
<td>text</td>
</tr>
<tr id="one">
<td>text</td>
</tr>
</tbody>
</table>`;

  const switchSectionType = (editor: Editor, rowSelector: string, newSectionType: string) => {
    const row = UiFinder.findIn(TinyDom.body(editor), rowSelector).getOrDie();
    editor.selection.select(row.dom, true);
    editor.execCommand('mceTableRowType', false, { type: newSectionType });
  };

  const switchToHeader = (editor: Editor, startContent: string, expected: string) => {
    editor.setContent(startContent);
    switchSectionType(editor, 'tr#one', 'header');
    TinyAssertions.assertContent(editor, expected);
  };

  const switchExistingHeader = (editor: Editor, startContent: string, expected: string) => {
    editor.setContent(startContent);
    switchSectionType(editor, 'tr#two', 'header');
    TinyAssertions.assertContent(editor, expected);
  };

  const switchSection = (editor: Editor, newSectionType: string, startContent: string, expected: string) => {
    editor.setContent(startContent);
    switchSectionType(editor, 'tr#one', newSectionType);
    TinyAssertions.assertContent(editor, expected);
  };

  context('table_header_type="section"', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      table_header_type: 'section'
    }, []);

    it('TINY-6007: Switch from body to header', () =>
      switchToHeader(hook.editor(), basicContent, theadExpected)
    );

    it('TINY-6007: Switch from footer to header', () =>
      switchToHeader(hook.editor(), tfootContent, theadExpected)
    );

    it('TINY-6007: switch to a header when one already exists and does match', () =>
      switchExistingHeader(hook.editor(), theadExpected, existingTheadExpected)
    );

    it('TINY-6007: switch to a header when one already exists, but does not match (cells)', () =>
      switchExistingHeader(hook.editor(), thsExpected, thsAndTheadExpected)
    );

    it('TINY-6007: switching between header section to body', () =>
      switchSection(hook.editor(), 'body', theadExpected, basicContent)
    );

    it('TINY-6007: switching between header section to footer', () =>
      switchSection(hook.editor(), 'footer', theadExpected, tfootContent)
    );

    it('TINY-6007: trying to switch to the same section (header) does nothing', () =>
      switchSection(hook.editor(), 'header', theadExpected, theadExpected)
    );
  });

  context('table_header_type="cells"', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      table_header_type: 'cells'
    }, []);

    it('TINY-6007: Switch from body to header', () =>
      switchToHeader(hook.editor(), basicContent, thsExpected)
    );

    it('TINY-6007: Switch from footer to header', () =>
      switchToHeader(hook.editor(), tfootContent, reversedThsExpected)
    );

    it('TINY-6007: switch to a header when one already exists and does match', () =>
      switchExistingHeader(hook.editor(), thsExpected, existingThsExpected)
    );

    it('TINY-6007: switch to a header when one already exists, but does not match (section)', () =>
      switchExistingHeader(hook.editor(), theadExpected, theadAndThsExpected)
    );

    it('TINY-6007: switching between header cells to body', () =>
      switchSection(hook.editor(), 'body', thsExpected, basicContent)
    );

    it('TINY-6007: switching between header cells to footer', () =>
      switchSection(hook.editor(), 'footer', thsExpected, tfootContent)
    );

    it('TINY-6007: trying to switch to the same section (header) does nothing', () =>
      switchSection(hook.editor(), 'header', thsExpected, thsExpected)
    );
  });

  context('table_header_type="sectionCells"', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      table_header_type: 'sectionCells'
    }, []);

    it('TINY-6007: Switch from body to header', () =>
      switchToHeader(hook.editor(), basicContent, bothExpected)
    );

    it('TINY-6007: Switch from footer to header', () =>
      switchToHeader(hook.editor(), tfootContent, bothExpected)
    );

    it('TINY-6007: switch to a header when one already exists and does match', () =>
      switchExistingHeader(hook.editor(), bothExpected, existingBothExpected)
    );

    it('TINY-6007: switch to a header when one already exists, but does not match (cells)', () =>
      switchExistingHeader(hook.editor(), thsExpected, thsAndBothExpected)
    );

    it('TINY-6007: switch to a header when one already exists, but does not match (section)', () =>
      switchExistingHeader(hook.editor(), theadExpected, theadAndBothExpected)
    );

    it('TINY-6007: switching between header sectionCells to body', () =>
      switchSection(hook.editor(), 'body', bothExpected, basicContent)
    );

    it('TINY-6007: switching between header sectionCells to footer', () =>
      switchSection(hook.editor(), 'footer', bothExpected, tfootContent)
    );

    it('TINY-6007: trying to switch to the same section (header) does nothing', () =>
      switchSection(hook.editor(), 'header', bothExpected, bothExpected)
    );
  });

  context('table_header_type="auto"', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      table_header_type: 'auto'
    }, []);

    it('TINY-6007: switch to a header when one already exists using detection (section)', () =>
      switchExistingHeader(hook.editor(), theadExpected, existingTheadExpected)
    );

    it('TINY-6007: switch to a header when one already exists using detection (cells)', () =>
      switchExistingHeader(hook.editor(), thsExpected, existingThsExpected)
    );

    it('TINY-6007: switch to a header when one already exists using detection (sectionCells)', () =>
      switchExistingHeader(hook.editor(), bothExpected, existingBothExpected)
    );

    it('TINY-6007: switching between body to footer', () =>
      switchSection(hook.editor(), 'footer', basicContent, tfootContent)
    );

    it('TINY-6007: switching between footer to body', () =>
      switchSection(hook.editor(), 'body', tfootContent, reversedBasicContent)
    );

    it('TINY-6007: trying to switch to the same section (body) does nothing', () =>
      switchSection(hook.editor(), 'body', basicContent, basicContent)
    );

    it('TINY-6007: trying to switch to the same section (footer) does nothing', () =>
      switchSection(hook.editor(), 'footer', tfootContent, tfootContent)
    );
  });

  context('table_header_type=invalid', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      table_header_type: 'foo'
    }, []);

    it('TINY-6007: Setting an invalid option defaults to section when switching header', () =>
      switchToHeader(hook.editor(), basicContent, theadExpected)
    );
  });
});
