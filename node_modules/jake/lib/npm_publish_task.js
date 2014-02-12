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

var fs = require('fs')
  , exec = require('child_process').exec
  , utils = require('utilities')
  , currDir = process.cwd()
  , FileList = require('./file_list').FileList;

var NpmPublishTask = function () {
  var args = Array.prototype.slice.call(arguments)
    , arg
    , definition
    , createDef = function (arg) {
        return function () {
          this.packageFiles.include(arg);
        };
      };

  this.name = args.shift();

  while ((arg = args.pop())) {
    if (typeof arg == 'function') {
      definition = arg;
    }
    else if (Array.isArray(arg) || typeof arg == 'string') {
      definition = createDef(arg);
    }
  }

  this.packageFiles = new FileList();
  this.publishCmd = 'npm publish %filename';

  if (typeof definition == 'function') {
    definition.call(this);
  }
  this.define();
};


NpmPublishTask.prototype = new (function () {

  var _currentBranch = null;

  var getPackage = function () {
        var pkg = JSON.parse(fs.readFileSync(process.cwd() + '/package.json').toString());
        return pkg;
      }
    , getPackageVersionNumber = function () {
        return getPackage().version;
      };

  this.define = function () {
    var self = this;

    namespace('npm', function () {
      task('fetchTags', {async: true}, function () {
        // Make sure local tags are up to date
        var cmds = [
          'git fetch --tags'
        ];
        jake.exec(cmds, function () {
          console.log('Fetched remote tags.');
          complete();
        });
      });

      task('getCurrentBranch', {async: true}, function () {
        // Figure out what branch to push to
        exec('git symbolic-ref --short HEAD',
            function (err, stdout, stderr) {
          if (err) {
            fail(err);
          }
          if (stderr) {
            fail(new Error(stderr));
          }
          if (!stdout) {
            fail(new Error('No current Git branch found'));
          }
          _currentBranch = utils.string.trim(stdout);
          console.log('On branch ' + _currentBranch);
          complete();
        });
      });

      task('version', {async: true}, function () {
        // Only bump, push, and tag if the Git repo is clean
        exec('git status --porcelain --untracked-files=no',
            function (err, stdout, stderr) {
          var cmds
            , path
            , pkg
            , version
            , arr
            , patch
            , message;

          if (err) {
            fail(err);
          }
          if (stderr) {
            fail(new Error(stderr));
          }
          if (stdout.length) {
            fail(new Error('Git repository is not clean.'));
          }

          // Grab the current version-string
          path = process.cwd() + '/package.json';
          pkg = getPackage();
          version = pkg.version;
          // Increment the patch-number for the version
          arr = version.split('.');
          patch = parseInt(arr.pop(), 10) + 1;
          arr.push(patch);
          version = arr.join('.');
          // New package-version
          pkg.version = version;
          // Commit-message
          message = 'Version ' + version;

          // Update package.json with the new version-info
          fs.writeFileSync(path, JSON.stringify(pkg, true, 2));

          cmds = [
            'git commit package.json -m "' + message + '"'
          , 'git push origin ' + _currentBranch
          , 'git tag -a v' + version + ' -m "' + message + '"'
          , 'git push --tags'
          ];

          jake.exec(cmds, function () {
            var version = getPackageVersionNumber();
            console.log('Bumped version number to v' + version + '.');
            complete();
          });
        });
      });

      task('definePackage', function () {
        var version = getPackageVersionNumber()
          , t;
        t = new jake.PackageTask(self.name, 'v' + version, function () {
          // Replace the PackageTask's FileList with the NPMPublishTask's FileList
          this.packageFiles = self.packageFiles;
          this.needTarGz = true;
        });
      });

      task('package', {async: true}, function () {
        var definePack = jake.Task['npm:definePackage']
          , pack = jake.Task.package
          , version = getPackageVersionNumber();

        // May have already been run
        definePack.reenable(true);
        definePack.addListener('complete', function () {
          pack.addListener('complete', function () {
            console.log('Created package for ' + self.name + ' v' + version);
            complete();
          });
          pack.invoke();
        });
        definePack.invoke();
      });

      task('publish', {async: true}, function () {
        var version = getPackageVersionNumber()
          , cmds
          , filename
          , cmd;

        console.log('Publishing ' + self.name + ' v' + version);

        filename = 'pkg/' + self.name + '-v' + version + '.tar.gz'
        cmd = self.publishCmd.replace(/%filename/gi, filename);

        cmds = [
          cmd
        ];

        // Hackity hack -- NPM publish sometimes returns errror like:
        // Error sending version data\nnpm ERR!
        // Error: forbidden 0.2.4 is modified, should match modified time
        setTimeout(function () {
          jake.exec(cmds, function () {
            console.log('Published to NPM');
            complete();
          }, {printStdout: true, printStderr: true});
        }, 5000);
      });

      task('cleanup', function () {
        var clobber = jake.Task.clobber;
        clobber.reenable(true);
        clobber.invoke();
        console.log('Cleaned up package');
      });

    });

    desc('Bump version-number, package, and publish to NPM.');
    task('publish', ['npm:fetchTags', 'npm:getCurrentBranch', 'npm:version',
        'npm:package', 'npm:publish', 'npm:cleanup'], function () {});

    jake.Task['npm:definePackage'].invoke();
  };

})();

jake.NpmPublishTask = NpmPublishTask;
exports.NpmPublishTask = NpmPublishTask;

