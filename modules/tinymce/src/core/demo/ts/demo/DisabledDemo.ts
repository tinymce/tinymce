import { DomEvent, Html, Insert, SelectorFind, SugarBody, SugarElement, TextContent } from '@ephox/sugar';

import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  const container = SelectorFind.descendant(SugarBody.body(), '#ephox-ui').getOrDie();

  const statusDiv = SugarElement.fromTag('p');
  Insert.before(container, statusDiv);

  const toggleModeBtn = SugarElement.fromTag('button');
  Html.set(toggleModeBtn, 'Toggle readonly mode');
  DomEvent.bind(toggleModeBtn, 'click', () => {
    tinymce.activeEditor?.mode.set(tinymce.activeEditor.mode.get() === 'readonly' ? 'design' : 'readonly');
    TextContent.set(statusDiv, `Mode: ${tinymce.activeEditor?.mode.get()}, Disabled: ${tinymce.activeEditor?.options.get('disabled')}`);
  });
  Insert.before(container, toggleModeBtn);

  const toggleDisabledBtn = SugarElement.fromTag('button');
  Html.set(toggleDisabledBtn, 'Toggle disabled mode');
  DomEvent.bind(toggleDisabledBtn, 'click', () => {
    tinymce.activeEditor?.options.set('disabled', !tinymce.activeEditor.options.get('disabled'));
    TextContent.set(statusDiv, `Mode: ${tinymce.activeEditor?.mode.get()}, Disabled: ${tinymce.activeEditor?.options.get('disabled')}`);
  });
  Insert.before(container, toggleDisabledBtn);

  tinymce.init({
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    selector: 'div.tinymce',
    height: 1000,
    plugins: 'accordion image table emoticons charmap codesample insertdatetime',
    // eslint-disable-next-line max-len
    toolbar: 'bold italic underline strikethrough subscript superscript accordion addtemplate inserttemplate| fontfamily fontsize fontsizeinput | numlist bullist checklist mergetags footnotes footnotesupdate| typography permanentpen formatpainter removeformat forecolor backcolor | blockquote nonbreaking hr pagebreak | casechange styles blocks lineheight | ltr rtl outdent indent | align alignleft aligncenter alignright alignjustify alignnone | h1 h2 h3 h4 h5 h6 | copy cut paste pastetext selectall remove newdocument wordcount searchreplace | undo redo | save cancel restoredraft | fullscreen print preview export code help | template insertdatetime codesample emoticons charmap | anchor link unlink image media pageembed insertfile | visualblocks visualchars | table advtablerownumbering tableclass tablecellclass tablecellvalign tablecellborderwidth tablecellborderstyle tablecaption tablecellbackgroundcolor tablecellbordercolor tablerowheader tablecolheader',
    setup: (ed) => {
      ed.on('init', () => {
        TextContent.set(statusDiv, `Mode: ${ed.mode.get()}, Disabled: ${ed.options.get('disabled')}`);
      });
    }
  });
};
