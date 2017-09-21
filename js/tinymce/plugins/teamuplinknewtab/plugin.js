/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * This class contains all core logic for the teamuplinknewtab plugin.
 *
 * @author Cristian Bujoreanu, cristian.buj@teamup.com
 */

(function () {
    var defs = {}; // id -> {dependencies, definition, instance (possibly undefined)}

    // Used when there is no 'main' module.
    // The name is probably (hopefully) unique so minification removes for releases.
    var register_3795 = function register_3795(id) {
        var module = dem(id);
        var fragments = id.split('.');
        var target = Function('return this;')();
        for (var i = 0; i < fragments.length - 1; ++i) {
            if (target[fragments[i]] === undefined) target[fragments[i]] = {};
            target = target[fragments[i]];
        }
        target[fragments[fragments.length - 1]] = module;
    };

    var instantiate = function instantiate(id) {
        var actual = defs[id];
        var dependencies = actual.deps;
        var definition = actual.defn;
        var len = dependencies.length;
        var instances = new Array(len);
        for (var i = 0; i < len; ++i) {
            instances[i] = dem(dependencies[i]);
        }var defResult = definition.apply(null, instances);
        if (defResult === undefined) throw 'module [' + id + '] returned undefined';
        actual.instance = defResult;
    };

    var def = function def(id, dependencies, definition) {
        if (typeof id !== 'string') throw 'module id must be a string';else if (dependencies === undefined) throw 'no dependencies for ' + id;else if (definition === undefined) throw 'no definition function for ' + id;
        defs[id] = {
            deps: dependencies,
            defn: definition,
            instance: undefined
        };
    };

    var dem = function dem(id) {
        var actual = defs[id];
        if (actual === undefined) throw 'module [' + id + '] was undefined';else if (actual.instance === undefined) instantiate(id);
        return actual.instance;
    };

    var req = function req(ids, callback) {
        var len = ids.length;
        var instances = new Array(len);
        for (var i = 0; i < len; ++i) {
            instances.push(dem(ids[i]));
        }callback.apply(null, callback);
    };

    var ephox = {};

    ephox.bolt = {
        module: {
            api: {
                define: def,
                require: req,
                demand: dem
            }
        }
    };

    var define = def;
    var require = req;
    var demand = dem;
    // this helps with minificiation when using a lot of global references
    var defineGlobal = function defineGlobal(id, ref) {
        define(id, [], function () {
            return ref;
        });
    };
    defineGlobal("global!tinymce.util.Tools.resolve", tinymce.util.Tools.resolve);

    define('tinymce.core.PluginManager', ['global!tinymce.util.Tools.resolve'], function (resolve) {
        return resolve('tinymce.PluginManager');
    });

    define('tinymce.plugins.teamuplinknewtab.Plugin', ['tinymce.core.PluginManager'], function (PluginManager) {
        PluginManager.add('teamuplinknewtab', function (editor) {
            editor.addMenuItem('teamuplinknewtab', {
                icon: 'image',
                text: 'Open in new tab',
                //shortcut: 'Ctrl+O',
                //disabled: true,
                onclick: function onclick() {
                    var node = editor.selection.getNode(),
                        url;

                    if (node.hasAttribute('data-mce-src')) {
                        url = node.getAttribute('data-mce-src');
                    } else if (node.hasAttribute('data-mce-href')) {
                        url = node.getAttribute('data-mce-href');
                    }

                    if (url) {
                        window.open(url, '_blank');
                    }
                },
                context: 'insert'
            });
        });

        return function () {};
    });

    dem('tinymce.plugins.teamuplinknewtab.Plugin')();
})();

/***/ })
/******/ ]);