define(
  'ephox.darwin.demo.DarwinDemo',

  [
    'ephox.darwin.api.Darwin',
    'ephox.fred.PlatformDetection',
    'ephox.fussy.api.Point',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.DomEvent',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.SelectorFind',
    'global!Date',
    'global!Math'
  ],

  function (Darwin, PlatformDetection, Point, WindowSelection, Awareness, Option, Attr, Css, DomEvent, Element, Html, Insert, Node, SelectorFind, Date, Math) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var platform = PlatformDetection.detect();

      var editor = Element.fromTag('div');
      Attr.set(editor, 'contenteditable', 'true');
      Css.set(editor, 'width', '400px');

      Html.set(editor, '<p>This is a paragraph</p><h1>This is a heading</h1><p>This is another paragraph that has multiple lines, probably ' +
        'because there is a lot of content here and it makes sense that we would have quite a lot of stuff here ... and there is more of what ' +
        'you are going to do even if it does not matter. And some br tags are about to appear <br /><br /><br />More of what you are going to do'
      );


      var logbook = Element.fromTag('div');
      Css.setAll(logbook, {
        width: '800px',
        float: 'right',
        height: '300px',
        overflow: 'scroll',
        border: '1px solid #333'
      });

      Insert.append(ephoxUi, editor);
      Insert.append(ephoxUi, logbook);

      var updateLogbook = function (msg) {
        var pre = Element.fromHtml('<p>' + new Date().toString() + ': ' + msg + '</p>');
        Insert.prepend(logbook, pre);
      };

      DomEvent.bind(editor, 'keydown', Darwin.handler);

      var paragraphRange = document.createRange();
      var paragraph = editor.dom().childNodes[2];
      console.log('paragraph', paragraph);
      paragraphRange.setStart(paragraph, 1);
      paragraphRange.setEnd(paragraph, 2);

      console.log('p-range', paragraphRange);

      // some success on all browsers except for Chrome.
      updateLogbook('ranged br: height: ' + paragraphRange.getBoundingClientRect().height +  ' top: ' + paragraphRange.getBoundingClientRect().top);
      updateLogbook('br: height: ' + paragraph.childNodes[1].getBoundingClientRect().height +  ' top: ' + paragraph.childNodes[1].getBoundingClientRect().top);


    };
  }
);
