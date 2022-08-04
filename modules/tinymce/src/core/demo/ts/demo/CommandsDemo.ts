import { Arr } from '@ephox/katamari';
import { DomEvent, Html, Insert, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';

import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  const cmd = (command: string, value?: string | number) => {
    return { command, value };
  };

  const commands = [
    cmd('Bold'),
    cmd('Italic'),
    cmd('Underline'),
    cmd('Strikethrough'),
    cmd('Superscript'),
    cmd('Subscript'),
    cmd('Cut'),
    cmd('Copy'),
    cmd('Paste'),
    cmd('Unlink'),
    cmd('JustifyLeft'),
    cmd('JustifyCenter'),
    cmd('JustifyRight'),
    cmd('JustifyFull'),
    cmd('JustifyNone'),
    cmd('InsertUnorderedList'),
    cmd('InsertOrderedList'),
    cmd('ForeColor', 'red'),
    cmd('HiliteColor', 'green'),
    cmd('FontName', 'Arial'),
    cmd('FontSize', 7),
    cmd('RemoveFormat'),
    cmd('mceBlockQuote'),
    cmd('FormatBlock', 'h1'),
    cmd('mceInsertContent', 'abc'),
    cmd('mceToggleFormat', 'bold'),
    cmd('mceSetContent', 'abc'),
    cmd('Indent'),
    cmd('Outdent'),
    cmd('InsertHorizontalRule'),
    cmd('InsertParagraph'),
    cmd('mceToggleVisualAid'),
    cmd('mceInsertLink', 'url'),
    cmd('selectAll'),
    cmd('delete'),
    cmd('mceNewDocument'),
    cmd('Undo'),
    cmd('Redo'),
    cmd('mceAutoResize'),
    cmd('mceShowCharmap'),
    cmd('mceCodeEditor'),
    cmd('mceDirectionLTR'),
    cmd('mceDirectionRTL'),
    cmd('mceFullscreen'),
    cmd('mceImage'),
    cmd('mceInsertDate'),
    cmd('mceInsertTime'),
    cmd('InsertDefinitionList'),
    cmd('mceNonBreaking'),
    cmd('mcePageBreak'),
    cmd('mcePreview'),
    cmd('mcePrint'),
    cmd('mceSave'),
    cmd('SearchReplace'),
    cmd('mceSpellcheck'),
    cmd('mceInsertTemplate', '{$user}'),
    cmd('mceVisualBlocks'),
    cmd('mceVisualChars'),
    cmd('mceMedia'),
    cmd('mceAnchor'),
    cmd('mceTableSplitCells'),
    cmd('mceTableMergeCells'),
    cmd('mceTableInsertRowBefore'),
    cmd('mceTableInsertRowAfter'),
    cmd('mceTableInsertColBefore'),
    cmd('mceTableInsertColAfter'),
    cmd('mceTableDeleteCol'),
    cmd('mceTableDeleteRow'),
    cmd('mceTableCutRow'),
    cmd('mceTableCopyRow'),
    cmd('mceTablePasteRowBefore'),
    cmd('mceTablePasteRowAfter'),
    cmd('mceTableDelete'),
    cmd('mceInsertTable'),
    cmd('mceTableProps'),
    cmd('mceTableRowProps'),
    cmd('mceTableCellProps'),
    cmd('mceEditImage')
  ];

  const container = SelectorFind.descendant(SugarBody.body(), '#ephox-ui').getOrDie();
  Arr.each(commands, (cmd) => {
    const btn = SugarElement.fromTag('button');
    Html.set(btn, cmd.command);
    DomEvent.bind(btn, 'click', () => {
      tinymce.activeEditor?.execCommand(cmd.command, false, cmd.value);
    });
    Insert.append(container, btn);
  });

  tinymce.init({
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    selector: 'textarea.tinymce',
    plugins: [
      'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime', 'media', 'nonbreaking',
      'save', 'table', 'directionality', 'emoticons', 'template', 'importcss', 'codesample'
    ],
    toolbar1: 'bold italic',
    menubar: false
  });
};
