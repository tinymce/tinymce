import type { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  license_key: 'gpl',
  plugins: 'table lists image code accordion',
  toolbar: 'undo redo | table | numlist bullist | image | accordion | code',
  menu: { insert: { title: 'Insert', items: 'table | image | accordion' }},
  details_initial_state: 'inherited',
  details_serialize_state: 'inherited',
  readonly: true
}).then((editors) => {
  const editor = editors[0];

  // Toggle readonly button functionality
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const toggleReadonlyBtn = document.getElementById('toggle-readonly')!;
  toggleReadonlyBtn.addEventListener('click', () => {
    const isReadonly = editor.mode.isReadOnly();
    if (isReadonly) {
      editor.mode.set('design');
      toggleReadonlyBtn.textContent = 'Toggle readonly (currently: design)';
    } else {
      editor.mode.set('readonly');
      toggleReadonlyBtn.textContent = 'Toggle readonly (currently: readonly)';
    }
  });

  const printContentBtn = document.getElementById('print-content');
  if (printContentBtn) {
    printContentBtn.addEventListener('click', () => {
      console.log('Editor content:', editor.getContent());
    });
  }
});

export {};
