import { Chain, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains, Editor as McEditor } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as TableSections from 'tinymce/plugins/table/core/TableSections';
import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.SwitchTableSectionTest', (success, failure) => {
  Plugin();
  SilverTheme();

  const cSwitchSection = (rowSelector: string, newSectionType: string) => Chain.op((editor: Editor) => {
    const row = UiFinder.findIn(Element.fromDom(editor.getBody()), rowSelector).getOrDie();
    TableSections.switchSectionType(editor, row.dom(), newSectionType);
  });

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
<td scope="col">text</td>
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

  const sNewHeaderSwitchTest = (tableHeaderType: string, startContent: string, expected: string) =>
    Log.chainsAsStep('TINY-6007', `Switch new header, table_header_type = ${tableHeaderType}`, [
      McEditor.cFromSettings({
        plugins: 'table',
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_header_type: tableHeaderType
      }),
      Chain.fromParent(Chain.identity, [
        ApiChains.cSetContent(startContent),
        cSwitchSection('tr#one', 'header'),
        ApiChains.cAssertContent(expected)
      ]),
      McEditor.cRemove
    ]);

  const existingTheadExpected = `<table>
<thead>
<tr id="one">
<td scope="col">text</td>
</tr>
<tr id="two">
<td scope="col">text</td>
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
<td scope="col">text</td>
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
<td scope="col">text</td>
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
<td scope="col">text</td>
</tr>
<tr id="two">
<th scope="col">text</th>
</tr>
</thead>
</table>`;

  const sExistingHeaderSwitchTest = (extraLabel: string, tableHeaderType: string, startContent: string, expected: string) =>
    Log.chainsAsStep('TINY-6007', `Switch tbody to existing header, table_header_type = ${tableHeaderType}, ${extraLabel}`, [
      McEditor.cFromSettings({
        plugins: 'table',
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_header_type: tableHeaderType
      }),
      Chain.fromParent(Chain.identity, [
        ApiChains.cSetContent(startContent),
        cSwitchSection('tr#two', 'header'),
        ApiChains.cAssertContent(expected)
      ]),
      McEditor.cRemove
    ]);

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

  const sSectionSwitchTest = (newSectionType: string, tableHeaderType: string, startContent: string, expected: string) =>
    Log.chainsAsStep('TINY-6007', `Switch section to ${newSectionType}, table_header_type = ${tableHeaderType}`, [
      McEditor.cFromSettings({
        plugins: 'table',
        theme: 'silver',
        base_url: '/project/tinymce/js/tinymce',
        table_header_type: tableHeaderType
      }),
      Chain.fromParent(Chain.identity, [
        ApiChains.cSetContent(startContent),
        cSwitchSection('tr#one', newSectionType),
        ApiChains.cAssertContent(expected)
      ]),
      McEditor.cRemove
    ]);

  Pipeline.async({}, [
    // Basic tests to switch to header when none exist
    sNewHeaderSwitchTest('section', basicContent, theadExpected),
    sNewHeaderSwitchTest('cells', basicContent, thsExpected),
    sNewHeaderSwitchTest('sectionCells', basicContent, bothExpected),
    sNewHeaderSwitchTest('section', tfootContent, theadExpected),
    sNewHeaderSwitchTest('cells', tfootContent, reversedThsExpected),
    sNewHeaderSwitchTest('sectionCells', tfootContent, bothExpected),
    sNewHeaderSwitchTest('foo', basicContent, theadExpected), // setting value is invalid so default to section
    // Switch to a header when one already exists - type is specified and matches
    sExistingHeaderSwitchTest('type matches existing', 'section', theadExpected, existingTheadExpected),
    sExistingHeaderSwitchTest('type matches existing', 'cells', thsExpected, existingThsExpected),
    sExistingHeaderSwitchTest('type matches existing', 'sectionCells', bothExpected, existingBothExpected),
    // Switch to a header when one already exists - type is specified but doesn't match existing
    sExistingHeaderSwitchTest('type does not match existing', 'section', thsExpected, thsAndTheadExpected),
    sExistingHeaderSwitchTest('type does not match existing', 'cells', theadExpected, theadAndThsExpected),
    sExistingHeaderSwitchTest('type does not match existing', 'sectionCells', thsExpected, thsAndBothExpected),
    sExistingHeaderSwitchTest('type does not match existing', 'sectionCells', theadExpected, theadAndBothExpected),
    // Switch to a header when one already exists - type is NOT specified so should match by detection
    sExistingHeaderSwitchTest('type auto so should detect type from existing', 'auto', theadExpected, existingTheadExpected),
    sExistingHeaderSwitchTest('type auto so should detect type from existing', 'auto', thsExpected, existingThsExpected),
    sExistingHeaderSwitchTest('type auto so should detect type from existing', 'auto', bothExpected, existingBothExpected),
    // General tests for switching between various sections
    sSectionSwitchTest('footer', 'auto', basicContent, tfootContent), // body to footer
    sSectionSwitchTest('body', 'auto', tfootContent, reversedBasicContent), // footer to body
    sSectionSwitchTest('body', 'section', theadExpected, basicContent), // header to body
    sSectionSwitchTest('body', 'cells', thsExpected, basicContent), // cells to body
    sSectionSwitchTest('body', 'sectionCells', bothExpected, basicContent), // sectionCells to body
    sSectionSwitchTest('footer', 'section', theadExpected, tfootContent), // header to footer
    sSectionSwitchTest('footer', 'cells', thsExpected, tfootContent), // ths to footer
    sSectionSwitchTest('footer', 'sectionCells', bothExpected, tfootContent), // sectionCells to footer
    // Test that trying to switch to the same section does nothing
    sSectionSwitchTest('body', 'auto', basicContent, basicContent),
    sSectionSwitchTest('header', 'section', theadExpected, theadExpected),
    sSectionSwitchTest('header', 'cells', thsExpected, thsExpected),
    sSectionSwitchTest('header', 'sectionCells', bothExpected, bothExpected),
    sSectionSwitchTest('footer', 'auto', tfootContent, tfootContent)
  ], success, failure);
});
