define(
  'ephox.alloy.api.GuiFactory',

  [
    'ephox.alloy.api.Component',
    'ephox.alloy.construct.Components',
    'ephox.alloy.events.DefaultEvents',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.ContainerSpec',
    'ephox.alloy.spec.CustomSpec',
    'ephox.alloy.spec.DropdownAlphaSpec',
    'ephox.alloy.spec.DropdownGridSpec',
    'ephox.alloy.spec.DropdownListSpec',
    'ephox.alloy.spec.DropdownMenuSpec',
    'ephox.alloy.spec.DropdownWidgetSpec',
    'ephox.alloy.spec.DummySpec',
    'ephox.alloy.spec.FlatgridSpec',
    'ephox.alloy.spec.FormLabelSpec',
    'ephox.alloy.spec.GroupButtonSpec',
    'ephox.alloy.spec.HtmlSelectSpec',
    'ephox.alloy.spec.InlineSpec',
    'ephox.alloy.spec.InputSpec',
    'ephox.alloy.spec.MenuSpec',
    'ephox.alloy.spec.SandboxedSpec',
    'ephox.alloy.spec.SplitDropdownSpec',
    'ephox.alloy.spec.TabbarSpec',
    'ephox.alloy.spec.TabbedSpec',
    'ephox.alloy.spec.ToolbarGroupSpec',
    'ephox.alloy.spec.ToolbarSpec',
    'ephox.alloy.spec.TypeaheadSpec',
    'ephox.alloy.spec.WidgetContainerSpec',
    'ephox.alloy.toolbar.MoreToolbar',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (Component, Components, DefaultEvents, Tagger, ButtonSpec, ContainerSpec, CustomSpec, DropdownAlphaSpec, DropdownGridSpec, DropdownListSpec, DropdownMenuSpec, DropdownWidgetSpec, DummySpec, FlatgridSpec, FormLabelSpec, GroupButtonSpec, HtmlSelectSpec, InlineSpec, InputSpec, MenuSpec, SandboxedSpec, SplitDropdownSpec, TabbarSpec, TabbedSpec, ToolbarGroupSpec, ToolbarSpec, TypeaheadSpec, WidgetContainerSpec, MoreToolbar, Objects, Arr, Obj, Merger, Json, Fun, Option, Options, Result, Error) {
    var knownSpecs = {
      container: ContainerSpec.make,
      custom: CustomSpec.make,
      button: ButtonSpec.make,
      input: InputSpec.make,
      formlabel: FormLabelSpec.make,
      'dropdown-menu': DropdownMenuSpec.make,
      'dropdown-widget': DropdownWidgetSpec.make,
      'dropdown-list': DropdownListSpec.make,
      'dropdown-grid': DropdownGridSpec.make,
      menu: MenuSpec.make,
      inline: InlineSpec.make,
      typeahead: TypeaheadSpec.make,
      select: HtmlSelectSpec.make,
      toolbar: ToolbarSpec.make,
      groupbutton: GroupButtonSpec.make,
      'more.toolbar': MoreToolbar.make,
      'dummy': DummySpec.make,
      flatgrid: FlatgridSpec.make,
      'widget-container': WidgetContainerSpec.make,

      'dropdown-alpha': DropdownAlphaSpec.make,
      'split-dropdown': SplitDropdownSpec.make,

      'sandboxed-component': SandboxedSpec.make,

      'tabbing': TabbedSpec.make,
      'tabbar': TabbarSpec.make,

      'toolbar-group': ToolbarGroupSpec.make

      // Add other specs here.
    };

    var unknownSpec = function (uiType, userSpec) {
      var known = Obj.keys(knownSpecs);
      return new Result.error(new Error('Unknown component type: ' + uiType + '.\nKnown types: ' + 
        Json.stringify(known, null, 2) + '\nEntire spec: ' + Json.stringify(userSpec, null, 2)
      ));
    };

    var buildSubcomponents = function (spec) {
      var components = Objects.readOr('components', [ ])(spec);
      return Arr.map(components, build);
    };

    var postprocess = function (spec, components) {
      var f = Objects.readOr('postprocess', Fun.noop)(spec);
      f(components);
    };

    var buildFromSpec = function (userSpec) {
      var uiType = userSpec.uiType;
      return Objects.readOptFrom(knownSpecs, uiType).fold(function () {
        return unknownSpec(uiType, userSpec);
      }, function (factory) {
        var spec = factory(userSpec);

        // Build the subcomponents
        var components = buildSubcomponents(spec);
        postprocess(spec, components);

        var completeSpec = Merger.deepMerge(
          DefaultEvents,
          spec,
          Objects.wrap('components', components)
        );

        return Result.value(
          Component.build(completeSpec)
        );
      });
    };

    var buildFromSpecOrDie = function (userSpec) {
      return buildFromSpec(userSpec).getOrDie();
    };

    var types = [
      { type: 'uiType', build: buildFromSpecOrDie, only: false },
      { type: 'external', build: Components.external, only: true },
      { type: 'built', build: Components.premade, only: true },
      { type: 'text', build: Components.text, only: true }
    ];

    // INVESTIGATE: A better way to provide 'meta-specs'
    var build = function (rawUserSpec) {
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, rawUserSpec);

      var builder = Options.findMap(types, function (t) {
        return userSpec[t.type] !== undefined ? Option.some(function () {
          var param = t.only === true ? userSpec[t.type] : userSpec;
          return t.build(param);
        }) : Option.none();
      }).getOrThunk(function () {
        throw new Error('Did not recognise any component type in ' + Json.stringify(userSpec, null, 2))
      });

      return builder();
    };

    return {
      build: build
    };
  }
);  