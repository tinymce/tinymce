define(
  'tinymce.themes.mobile.ui.AndroidContainer',

  [
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Singleton',
    'tinymce.themes.mobile.api.AndroidWebapp',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.toolbar.ScrollingToolbar',
    'tinymce.themes.mobile.ui.OuterContainer'
  ],

  function (Replacing, GuiFactory, Container, Objects, Fun, Singleton, AndroidWebapp, Styles, ScrollingToolbar, OuterContainer) {
    return function () {
      var alloy = OuterContainer();

      var toolbar = ScrollingToolbar();

      var webapp = Singleton.api();

      var socket = GuiFactory.build(
        Container.sketch({
          dom: {
            classes: [ Styles.resolve('editor-socket') ]
          },
          components: [ ],

          containerBehaviours: Objects.wrapAll([
            Replacing.config({ })
          ])
        })
      );

      alloy.add(toolbar.wrapper());
      alloy.add(socket);

      var setToolbarGroups = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setGroups(groups);
      };

      var setContextToolbar = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setContextToolbar(groups);
        toolbar.focus();
      };

      var restoreToolbar = function () {
        toolbar.restoreToolbar();
      };

      var init = function (spec) {
        webapp.set(
          AndroidWebapp.produce(spec)
        );
      };

      var exit = function () {
        webapp.run(function (w) {
          w.exit();
        });
      };

      return {
        system: Fun.constant(alloy),
        element: alloy.element,
        init: init,
        exit: exit,
        setToolbarGroups: setToolbarGroups,
        setContextToolbar: setContextToolbar,
        restoreToolbar: restoreToolbar,
        socket: Fun.constant(socket)
      };
    };
  }
);
