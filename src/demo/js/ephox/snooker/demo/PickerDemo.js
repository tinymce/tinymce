define(
  'ephox.snooker.demo.PickerDemo',

  [
    'ephox.snooker.ready.picker.PickerUi',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!Math'
  ],

  function (PickerUi, Element, Insert, Math) {
    return function () {
      
      var picker = PickerUi({
        maxCols: 6,
        maxRows: 5,
        minCols: 1,
        minRows: 1
      });
      var ephoxUi = Element.fromDom(document.getElementById('ephox-ui'));

      Insert.append(ephoxUi, picker.element());

      var val = 3;

      picker.setSize(10, 10);
      picker.setHeaders(1, 1);
      picker.setSelection(2, 2);

      picker.events.select.bind( function(event) {
        console.log('need to create table with ', event.cols(), 'columns and ', event.rows(), 'rows' );
        console.log('headers: ', event.rowHeaders() + ' x ' + event.columnHeaders());
      });


      picker.on();

      // setInterval(function () {
      //   val++;
      //   picker.setSize(val, val);

      //   picker.setSelection( Math.ceil(Math.random() * val) ,Math.ceil(Math.random() * val));
      // }, 1000);
    };
  }
);
