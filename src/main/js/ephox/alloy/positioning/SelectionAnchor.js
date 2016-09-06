define(
  'ephox.alloy.positioning.SelectionAnchor',

  [
    'ephox.alloy.alien.Descend',
    'ephox.boulder.api.FieldSchema',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.Layout',
    'ephox.repartee.api.MaxHeight',
    'ephox.repartee.api.Origins',
    'ephox.scullion.ADT',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.Traverse'
  ],

  function (Descend, FieldSchema, WindowSelection, Awareness, Fun, Option, Bubble, Layout, MaxHeight, Origins, Adt, Struct, Element, Location, Node, Scroll, Traverse) {
    var adt = Adt.generate([
      { 'page': [ ] },
      { 'idoc': [ 'absX', 'absY' ] }
    ]);

    var makeRect = Struct.immutableBag([ 'x', 'y', 'width', 'height' ], [ ]);
    var point = Struct.immutable('element', 'offset');

    // In one mode, the window is inside an iframe. If that iframe is in the
    // same document as the positioning element (component), then identify the offset
    // difference between the iframe and the component.
    var getExtraOffset = function (component, anchorInfo) {
      var win = Traverse.defaultView(anchorInfo.root()).dom();

      var hasSameOwner = function (frame) {
        var frameOwner = Traverse.owner(frame);
        var compOwner = Traverse.owner(component.element());

        return frameOwner == compOwner;
      };

      return Option.from(win.frameElement).map(Element.fromDom).filter(hasSameOwner).map(function (frame) {
        return adt.idoc(Location.absolute(frame));
      }).getOrThunk(function () {
        return adt.page();
      });
    };

    // A range from (a, 1) to (body, end) was giving the wrong bounds.
    var modifyStart = function (element, offset) {
      return Node.isText(element) ? point(element, offset) : Descend.descend(element, offset);
    };

    var placement = function (component, posInfo, anchorInfo, origin) {
      // The window might be within an iframe that is inside the component's doc. Therefore, we 
      // need to add the absolute position (minus scrolling?) 
      var win = Traverse.defaultView(anchorInfo.root()).dom();
      var extraOffset = getExtraOffset(component, anchorInfo);

      var fallbackRect = makeRect({
        x: 0,
        y: 0,
        width: 0,
        height: 0
      });

      var getSelection = anchorInfo.getSelection().getOrThunk(function () {
        return WindowSelection.get(win);
      });
      var rawAnchorBox = getSelection.bind(function (sel) {
        var rootEnd = Awareness.getEnd(anchorInfo.root());
        var modStart = modifyStart(sel.start(), sel.soffset());
        

        return WindowSelection.rectangleAt(win, modStart.element(), modStart.offset(), anchorInfo.root(), rootEnd).map(function (rect) {
          return makeRect({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          });
        });
      }).getOr(fallbackRect);

      var translate = function (rect, x, y) {
        return makeRect({
          x: rect.x() + x,
          y: rect.y() + y,
          width: rect.width(),
          height: rect.height()
        });
      };

      var addScroll = function (rect) {
        var scroll = Scroll.get();
        console.log('adding scroll', scroll.top());
        return translate(rect, scroll.left(), scroll.top());
      };

      var subtractScroll = function (rect) {
        var scroll = Scroll.get();
        console.log('adding scroll', scroll.top());
        return translate(rect, -scroll.left(), -scroll.top());
      };

      var addExtra = function (f, g, rect) {
        return extraOffset.fold(function () {
          return f(rect);
        }, function (offX, offY) {
          console.log('adding extra', offY);
          return translate(g(rect), offX, offY);
        });
      };

      // Shared concept with repartee, but we don't have an element.
      // (calls OuterPosition.find in repartee)

      var anchorBox = Origins.cata(origin, function (/*none*/) {
        return addExtra(addScroll, Fun.identity, rawAnchorBox);
      }, function (/* relative */) {
        return addExtra(addScroll, Fun.identity, rawAnchorBox);
      }, function (/* fixed */) {
        return addExtra(Fun.identity, subtractScroll, rawAnchorBox);
      });

      return {
        anchorBox: Fun.constant(anchorBox),
        bubble: Fun.constant(Bubble(0, 0)),
        maxHeightFunction: Fun.constant(MaxHeight.available()),
        layouts: Fun.constant(Layout)
      };
    };

    return [
      // FieldSchema.defaulted(/) // ui direction
      FieldSchema.option('getSelection'),
      FieldSchema.strict('root'),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);