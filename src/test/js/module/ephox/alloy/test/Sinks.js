define(
  'ephox.alloy.test.Sinks',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.PredicateExists'
  ],

  function (Behaviour, Positioning, GuiFactory, Container, Compare, PredicateExists) {
    var fixedSink = function () {
      return GuiFactory.build(
        Container.sketch({
          dom: {
            styles: {
              border: '1px solid green'
            }
          },
          uid: 'fixed-sink',
          containerBehaviours: Behaviour.derive([
            Positioning.config({
              useFixed: true
            })
          ])
        })
      );
    };

    var relativeSink = function () {
      return GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            styles: {
              border: '1px solid blue'
            }
          },
          uid: 'relative-sink',
          containerBehaviours: Behaviour.derive([
            Positioning.config({
              useFixed: true
            })
          ])
        })
      );
    };

    var popup = function () {
      return GuiFactory.build(
        Container.sketch({
          dom: {
            innerHtml: 'Demo day',
            styles: {
              width: '200px',
              height: '150px',
              border: 'inherit'
            }
          },
          uid: 'popup'
        })
      );
    };

    var isInside = function (sinkComponent, popupComponent) {
      var isSink = function (el) {
        return Compare.eq(el, sinkComponent.element());
      };

      return PredicateExists.closest(popupComponent.element(), isSink);
    };

    return {
      fixedSink: fixedSink,
      isInside: isInside,
      relativeSink: relativeSink,
      popup: popup
    };
  }
);