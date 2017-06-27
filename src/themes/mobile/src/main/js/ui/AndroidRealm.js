define(
  'tinymce.themes.mobile.ui.AndroidRealm',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Singleton',
    'tinymce.themes.mobile.api.AndroidWebapp',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.toolbar.ScrollingToolbar',
    'tinymce.themes.mobile.ui.CommonRealm',
    'tinymce.themes.mobile.ui.OuterContainer'
  ],

  function (Behaviour, Replacing, Sliding, GuiFactory, AlloyEvents, Container, Fun, Singleton, AndroidWebapp, Styles, ScrollingToolbar, CommonRealm, OuterContainer) {
    return function () {
      var alloy = OuterContainer({
        classes: [ Styles.resolve('android-container') ]
      });

      var toolbar = ScrollingToolbar();

      var webapp = Singleton.api();

      var switchToEdit = CommonRealm.makeEditSwitch(webapp);

      var socket = CommonRealm.makeSocket();

      var dropup = GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            innerHtml: '<p>We are one paragraph</p><p>Another paragraph</p><p>A third paragraph</p>',
            styles: {
              background: 'blue',
              display: 'block'
            }
          },
          events: AlloyEvents.derive([
            AlloyEvents.run('click', Sliding.toggleGrow)
          ]),
          containerBehaviours: Behaviour.derive([
            Sliding.config({
              closedClass: 'dropup-closed',
              openClass: 'dropup-open',
              shrinkingClass: 'dropup-shrinking',
              growingClass: 'dropup-growing',
              dimension: {
                property: 'height'
              }
            })
          ])
        })
      );

      setTimeout(function () {
        console.log('here we go');
        Sliding.grow(dropup);
      }, 4000);

      alloy.add(toolbar.wrapper());
      alloy.add(socket);
      alloy.add(dropup);

      // alloy.add(toolbar.wrapper());
      // alloy.add(socket);

      var setToolbarGroups = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setGroups(groups);
      };

      var setContextToolbar = function (rawGroups) {
        var groups = toolbar.createGroups(rawGroups);
        toolbar.setContextToolbar(groups);
      };

      // You do not always want to do this.
      var focusToolbar = function () {
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
          Replacing.remove(socket, switchToEdit);
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
