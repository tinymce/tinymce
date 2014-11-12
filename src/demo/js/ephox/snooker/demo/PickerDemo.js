define(
  'ephox.snooker.demo.PickerDemo',

  [
    'ephox.snooker.api.PickerDirection',
    'ephox.snooker.picker.PickerUi',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'global!Math'
  ],

  function (PickerDirection, PickerUi, Element, Insert, Remove, Math) {
    return function () {

      var picker = PickerUi(PickerDirection.ltr, {
        maxCols: 10,
        maxRows: 10,
        minCols: 1,
        minRows: 1
      });

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      var wrap = Element.fromTag('div');

      Remove.empty(ephoxUi);

      Insert.append(ephoxUi, wrap);
      Insert.append(wrap, picker.element());


      var val = 3;

      picker.setSize(10, 10);
      picker.setHeaders(1, 1);
      picker.setSelection(2, 2);

      picker.events.select.bind( function(event) {
        console.log('need to create table with ', event.cols(), 'columns and ', event.rows(), 'rows' );
        console.log('headers: ', event.rowHeaders() + ' x ' + event.columnHeaders());
      });


      picker.on();
    };
  }
);
