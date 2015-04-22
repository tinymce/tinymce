define(
  'ephox.darwin.demo.DarwinDemo',

  [
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Attr, DomEvent, Element, Html, Insert, SelectorFind) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var editor = Element.fromTag('div');
      Attr.set(editor, 'contenteditable', 'true');

      Html.set(editor, '<p>This is a paragraph</p><h1>This is a heading</h1><p>This is another paragraph that has multiple lines, probably ' + 
        'because there is a lot of content here and it makes sense that we would have quite a lot of stuff here ... and there is more of what ' + 
        'you are going to do even if it does not matter. And some br tags are about to appear <br /><br /><br />More of what you are going to do'
      );

      Insert.append(ephoxUi, editor);


      DomEvent.bind(editor, 'keydown', function (event) {
        event.kill();
      });

    };
  }
);
