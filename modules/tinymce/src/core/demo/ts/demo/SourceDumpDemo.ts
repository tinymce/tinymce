declare let tinymce: any;

export default () => {
  tinymce.init({
    selector: 'textarea#editor',
    skin_url: '../../../../js/tinymce/skins/lightgray',
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

  const dumpSource = (editor) => {
    const textArea = document.getElementById('source') as HTMLTextAreaElement;
    const raw = document.getElementById('raw') as HTMLInputElement;
    textArea.value = raw.checked ? editor.getBody().innerHTML : editor.getContent();
  };
};
