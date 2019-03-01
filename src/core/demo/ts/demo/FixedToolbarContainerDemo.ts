declare let tinymce: any;

export default function () {
  tinymce.init({
    selector: '#editor',
    inline: true,
    fixed_toolbar_container: '#toolbar',
    plugins: 'template' // lets you check notification positioning
  });
}