define(
  'ephox.snooker.demo.PickerDemoRtl',

  [
    'ephox.echo.api.AriaGrid',
    'ephox.snooker.api.PickerDirection',
    'ephox.snooker.demo.DemoTranslations',
    'ephox.snooker.picker.PickerUi',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'global!Math'
  ],

  function (AriaGrid, PickerDirection, DemoTranslations, PickerUi, Attr, DomEvent, Element, Focus, Insert, Remove, Math) {
    return function () {

      var picker = PickerUi(PickerDirection.rtl, {
        maxCols: 10,
        maxRows: 10,
        minCols: 1,
        minRows: 1
      }, AriaGrid.createHelp(10, 10, DemoTranslations));

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

      DomEvent.bind(ephoxUi, 'keydown', function (event) {
        var key = event.raw().which;
        if (key === 37) picker.sendLeft();
        else if (key === 39) picker.sendRight();
        else if (key === 40) picker.sendDown();
        else if (key === 38) picker.sendUp();
        else if (key === 32 || key === 13) picker.sendExecute();
        event.kill();
      });

      Attr.set(ephoxUi, 'tabIndex', '-1');
      Focus.focus(ephoxUi);
    };
  }
);
