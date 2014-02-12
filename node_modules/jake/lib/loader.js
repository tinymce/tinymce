/*
 * Jake JavaScript build tool
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

var path = require('path')
  , fs = require('fs')
  , existsSync = typeof fs.existsSync == 'function' ?
      fs.existsSync : path.existsSync
  , utils = require('utilities')
  , CoffeeScript
  , Loader;


Loader = function () {

  var JAKEFILE_PAT = /\.jake(\.js|\.coffee)?$/;

  var _requireCoffee = function () {
        try {
          return require('coffee-script');
        }
        catch (e) {
          fail('CoffeeScript is missing! Try `npm install coffee-script`');
        }
      };

  this.loadFile = function (file) {
    var jakefile = file ?
            file.replace(/\.js$/, '').replace(/\.coffee$/, '') : 'Jakefile'
      , fileSpecified = !!file
      // Dear God, why?
      , isCoffee = false
      // Warning, recursive
      , exists;

    exists = function () {
      var cwd = process.cwd();
      if (existsSync(jakefile) || existsSync(jakefile + '.js') ||
        existsSync(jakefile + '.coffee')) {
        return true;
      }
      if (!fileSpecified) {
        process.chdir("..");
        if (cwd === process.cwd()) {
          return false;
        }
        return exists();
      }
    };

    if (!exists()) {
      fail('No Jakefile. Specify a valid path with -f/--jakefile, ' +
          'or place one in the current directory.');
    }

    isCoffee = existsSync(jakefile + '.coffee');
    if (isCoffee) {
      CoffeeScript = _requireCoffee();
    }
    require(utils.file.absolutize(jakefile));
  };

  this.loadDirectory = function (d) {
    var dirname = d || 'jakelib'
      , dirlist;
    dirname = utils.file.absolutize(dirname);
    if (existsSync(dirname)) {
      dirlist = fs.readdirSync(dirname);
      dirlist.forEach(function (filePath) {
        if (JAKEFILE_PAT.test(filePath)) {
          if (/\.coffee$/.test(filePath)) {
            CoffeeScript = _requireCoffee();
          }
          require(path.join(dirname, filePath));
        }
      });
    }
  };
};

module.exports.Loader = Loader;
