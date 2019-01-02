import { Arr } from '@ephox/katamari';
import { document } from '@ephox/dom-globals';

declare let tinymce: any;

export default function () {
  const cmd = function (command, value?) {
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
    cmd('mceFullPageProperties'),
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

  Arr.each(commands, function (cmd) {
    const btn = document.createElement('button');
    btn.innerHTML = cmd.command;
    btn.onclick = function () {
      tinymce.activeEditor.execCommand(cmd.command, false, cmd.value);
    };
    document.querySelector('#ephox-ui').appendChild(btn);
  });

  tinymce.init({
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    selector: 'textarea.tinymce',
    plugins: [
      'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker toc',
      'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
      'save table directionality emoticons template paste textcolor importcss colorpicker textpattern codesample'
    ],
    toolbar1: 'bold italic',
    menubar: false
  });
}