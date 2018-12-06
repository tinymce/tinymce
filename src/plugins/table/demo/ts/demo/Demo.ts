declare let tinymce: any;

tinymce.init({
  selector: 'div.tinymce',
  plugins: 'table',
  toolbar: 'table tableprops tablecellprops tablerowprops | tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablecutrow tablecopyrow tablepasterowbefore tablepasterowafter',
  media_dimensions: false,
  table_class_list: [
    {title: 'None', value: ''},
    {title: 'Dog', value: 'dog'},
    {title: 'Cat', value: 'cat'}
  ],
  table_row_class_list: [
    {title: 'None', value: ''},
    {title: 'Fish', value: 'fish'},
    {title: 'Mouse', value: 'mouse'}
  ],
  table_cell_class_list: [
    {title: 'None', value: ''},
    {title: 'Bird', value: 'bird'},
    {title: 'Snake', value: 'snake'}
  ],
  table_style_by_css: true,
  // table grid TBD
  table_grid: true,

  // table_advtab: true,
  // table_cell_advtab: false,
  // table_row_advtab: false,
  // media_live_embeds: false,
  // media_url_resolver: function (data, resolve) {
  // resolve({
  //   html: '<iframe src="' + data.url + '" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>'});
  // },
  height: 600,
  content_style: 'td[data-mce-selected], th[data-mce-selected] { background-color: #2276d2 !important; }' + '.cat { border-color: green; color: red; background-color: }',
});

export {};