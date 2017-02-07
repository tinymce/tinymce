define(
  'ephox.alloy.docs.SchemaView',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.docs.Documentation',
    'ephox.boulder.api.Objects',
    'ephox.boulder.format.TypeTokens',
    'ephox.compass.Arr'
  ],

  function (GuiFactory, Container, Documentation, Objects, TypeTokens, Arr) {
    var getDescription = function (key) {
      if (Objects.hasKey(Documentation, key)) return Documentation[key].desc;
      else return '<span style="outline: 1px solid red;">' + key + '</span>';
    };

    var buildSet = function (path, _sValidator, sType) {
      return Container.build({
        dom: {
          tag: 'div',
          classes: [ 'docs-set' ]
        },
        components: [
          build(path, sType.toDsl())
        ]
      });
    };

    var buildArray = function (path, aType) {
      return Container.build({
        dom: {
          tag: 'div',
          classes: [ 'docs-array' ]
        },
        components: [
          build(path, aType.toDsl())
        ]
      });
    };

    var buildField = function (path, key, presence, type) {
      var fieldComp = build(path.concat(key), type.toDsl());

      return Container.build({
        dom: {
          tag: 'div',
          classes: [ 'docs-field' ]
        },
        components: [
          Container.build({
            dom: {
              tag: 'span',
              classes: [ 'docs-field-name' ]
            },
            components: [
              GuiFactory.text(key + ': ')
            ]
          }),
          fieldComp
        ]
      })
      //   var wrapper = Element.fromTag('div');

      // //           { strict: [ ] },
      // // { defaultedThunk: [ 'fallbackThunk' ] },
      // // { asOption: [ ] },
      // // { asDefaultedOptionThunk: [ 'fallbackThunk' ] },
      // // { mergeWithThunk: [ 'baseThunk' ] }
              
                
              
      //           Class.add(wrapper, 'docs-field');
      //           var span = Element.fromTag('span');
      //           Class.add(span, 'docs-field-name');
      //           Html.set(span, key + ': ');


      //           presence.fold(
      //             function () {
      //               Class.add(wrapper, 'strict');
      //             },
      //             function (fallbackThunk) {
      //               var fallback = fallbackThunk();
      //               var title = (function () {
      //                 if (Type.isFunction(fallback) && fallback === Fun.noop) return 'noOp';
      //                 else if (fallback === Fun.identity) return 'identity';
      //                 else if (Type.isFunction(fallback)) return 'function';
      //                 else return Json.stringify(fallback, null, 2);
      //               })();
      //               Attr.set(span, 'title', '(' + title + ') ');
      //               Class.add(wrapper, 'defaulted');
      //             },
      //             function () {
      //               Class.add(wrapper, 'optional')
      //             },
      //             function () {  },
      //             function () {  }
      //           );


      //           InsertAll.append(wrapper, [ span, t ]);
      //           return [ wrapper ];
    };

    var buildObject = function (path, oFields) {
      var subs = Arr.bind(oFields, function (f) {
        return TypeTokens.foldField(f, 
          function (key, presence, type) {
            return [ buildField(path, key, presence, type) ];
          }, function (_) {
            return [ ];
          }
        );
      });

      return Container.build({
        dom: {
          tag: 'div',
          classes: [ 'docs-obj' ]
        },
        components: subs
      });
    };


    var build = function (path, dsl) {
      return TypeTokens.foldType(
        dsl,
        function (_sValidator, sType) {
          return buildSet(path, _sValidator, sType);
        },
        function (aType) {
          return buildArray(path, aType);
        },
        function (oFields) {
          return buildObject(path, oFields);
        },
        function (oValue) {
          return Container.build({
            dom: {
              tag: 'span',
              classes: [ 'docs-item' ],
              innerHtml: getDescription(path.join(' > '))
            }
          });
        },

        function (cKey, cBranches) {
          return Container.build({
            dom: {
              tag: 'span',
              classes: [ 'docs-mode' ],
              innerHtml: 'branch on ' + cKey + ' > NOT IMPLEMENTED'
            }
          });
        }
      );
    };

    return {
      build: build
    };
 
  }
);