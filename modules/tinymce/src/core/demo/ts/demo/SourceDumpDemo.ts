import { Checked, SelectorFind, SugarBody, Value } from '@ephox/sugar';

import { Editor, TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

export default (): void => {
  tinymce.init({
    selector: 'textarea#editor',
    skin_url: '../../../../js/tinymce/skins/ui/oxide',
    content_css: '../../../../js/tinymce/skins/content/default/content.css',
    templates: [
      { title: 'Some title 1', description: 'Some desc 1', content: 'My content' },
      { title: 'Some title 2', description: 'Some desc 2', content: '<div class="mceTmpl"><span class="cdate">cdate</span><span class="mdate">mdate</span>My content2</div>' }
    ],
    image_caption: true,
    plugins: [
      'autosave', 'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime', 'media', 'nonbreaking',
      'save', 'table', 'directionality', 'emoticons', 'template', 'importcss', 'codesample', 'help'
    ],
    add_unload_trigger: false,
    autosave_ask_before_unload: false,
    toolbar: 'fontsize fontfamily insertfile undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample code | ltr rtl',
    init_instance_callback: (editor) => {
      editor.on('init keyup change', () => dumpSource(editor));
    }
  });

  const dumpSource = (editor: Editor) => {
    const textarea = SelectorFind.descendant<HTMLTextAreaElement>(SugarBody.body(), '#source').getOrDie();
    const raw = SelectorFind.descendant<HTMLInputElement>(SugarBody.body(), '#raw').getOrDie();
    const content = Checked.get(raw) ? editor.getBody().innerHTML : editor.getContent();
    Value.set(textarea, content);
  };
};
