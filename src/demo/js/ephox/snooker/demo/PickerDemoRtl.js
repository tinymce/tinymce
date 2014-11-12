define(
  'ephox.snooker.demo.PickerDemoRtl',

  [
    'ephox.snooker.api.PickerDirection',
    'ephox.snooker.picker.PickerUi',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'global!Math'
  ],

  function (PickerDirection, PickerUi, Attr, Element, Insert, Remove, Math) {
    return function () {

      var picker = PickerUi({
        maxCols: 34,
        maxRows: 34,
        minCols: 1,
        minRows: 1
      }, PickerDirection.rtl);

      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));
      Remove.empty(ephoxUi);
      Insert.append(ephoxUi, picker.element());
      Attr.set(ephoxUi, 'dir', 'rtl');

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
