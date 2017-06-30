define(
  'tinymce.themes.mobile.ui.IosRealm',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Singleton',
    'tinymce.themes.mobile.api.IosWebapp',
    'tinymce.themes.mobile.channels.TinyChannels',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.toolbar.ScrollingToolbar',
    'tinymce.themes.mobile.ui.CommonRealm',
    'tinymce.themes.mobile.ui.OuterContainer'
  ],

  function (Behaviour, Focusing, Keying, Replacing, Sliding, GuiFactory, Container, Fun, Singleton, IosWebapp, TinyChannels, Styles, ScrollingToolbar, CommonRealm, OuterContainer) {
    return function () {
      var alloy = OuterContainer({
        classes: [ Styles.resolve('ios-container') ]
      });

      var toolbar = ScrollingToolbar();

      var webapp = Singleton.api();

      var switchToEdit = CommonRealm.makeEditSwitch(webapp);

      var socket = CommonRealm.makeSocket();


      var dropup = GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            styles: {
              background: 'blue',
              display: 'flex',
              'flex-grow': '1',
              'width': '100%',
              'overflow': 'hidden'
            }
          },
          components: [
            Container.sketch({
              dom: {
                innerHtml: 'Dropup',
                styles: {
                  'padding': '50px'
                }
              }
            })
          ],
          containerBehaviours: Behaviour.derive([
            Sliding.config({
              closedClass: 'dropup-closed',
              openClass: 'dropup-open',
              shrinkingClass: 'dropup-shrinking',
              growingClass: 'dropup-growing',
              dimension: {
                property: 'height'
              },

              onShrunk: function () {
                webapp.run(function (w) {
                  w.refreshStructure();
                });
              },
              onGrown: function () {
                webapp.run(function (w) {
                  w.refreshStructure();
                });
              }
            })
          ])
        })
      );

      alloy.add(toolbar.wrapper());
      alloy.add(socket);
      alloy.add(dropup);

      var setToolbarGroups = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setGroups(groups);
      };

      var setContextToolbar = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setContextToolbar(groups);
      };

      var focusToolbar = function () {
        toolbar.focus();
      };

      var restoreToolbar = function () {
        toolbar.restoreToolbar();
      };

      var init = function (spec) {
        webapp.set(
          IosWebapp.produce(spec)
        );
      };

      var exit = function () {
        webapp.run(function (w) {
          Replacing.remove(socket, switchToEdit);
          w.exit();
        });
      };

      var updateMode = function (readOnly) {
        CommonRealm.updateMode(socket, switchToEdit, readOnly);
      };

      return {
        system: Fun.constant(alloy),
        element: alloy.element,
        init: init,
        exit: exit,
        setToolbarGroups: setToolbarGroups,
        setContextToolbar: setContextToolbar,
        focusToolbar: focusToolbar,
        restoreToolbar: restoreToolbar,
        updateMode: updateMode,
        socket: Fun.constant(socket),
        dropup: Fun.constant(dropup)
      };
    };
  }
);
