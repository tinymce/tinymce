declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'textpattern code lists',
  skin_url: '../../../../../js/tinymce/skins/ui/oxide',
  toolbar: 'code',
  height: 600,
  textpattern_patterns: [
    { start: '*', end: '*', format: 'italic' },
    { start: '**', end: '**', format: 'bold' },
    { start: '#', format: 'h1' },
    { start: '##', format: 'h2' },
    { start: '###', format: 'h3' },
    { start: '####', format: 'h4' },
    { start: '#####', format: 'h5' },
    { start: '######', format: 'h6' },
    { start: '* ', cmd: 'InsertUnorderedList', value: { 'list-style-type': 'disc' } },
    { start: '1. ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'decimal' } },
    { start: '1) ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'decimal' } },
    { start: 'a. ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'lower-alpha' } },
    { start: 'a) ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'lower-alpha' } },
    { start: 'i. ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'lower-roman' } },
    { start: 'i) ', cmd: 'InsertOrderedList', value: { 'list-style-type': 'lower-roman' } },
    { start: 'brb', replacement: 'be right back' },
    { start: 'irl', replacement: 'in real life' },
    { start: 'heading', replacement: '<h1>My heading</h1>' }
  ]
});

export { };