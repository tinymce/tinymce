var util = require('util') // Native Node util module
  , path = require('path')
  , EventEmitter = require('events').EventEmitter
  , Task
  , TaskBase
  , utils = require('../utils')
  , rule = require('../rule');

var UNDEFINED_VALUE;

/**
  @name jake
  @namespace jake
*/
/**
  @name jake.Task
  @constructor
  @augments EventEmitter
  @description A Jake Task

  @param {String} name The name of the Task
  @param {Array} [prereqs] Prerequisites to be run before this task
  @param {Function} [action] The action to perform for this task
  @param {Object} [opts]
    @param {Array} [opts.asyc=false] Perform this task asynchronously.
    If you flag a task with this option, you must call the global
    `complete` method inside the task's action, for execution to proceed
    to the next task.
 */
Task = function () {
  // Do constructor-work only on actual instances, not when used
  // for inheritance
  if (arguments.length) {
    this.init.apply(this, arguments);
  }
};

util.inherits(Task, EventEmitter);

TaskBase = new (function () {

  // Parse any positional args attached to the task-name
  var parsePrereqName = function (name) {
        var taskArr = name.split('[')
          , taskName = taskArr[0]
          , taskArgs = [];
        if (taskArr[1]) {
          taskArgs = taskArr[1].replace(/\]$/, '');
          taskArgs = taskArgs.split(',');
        }
        return {
          name: taskName
        , args: taskArgs
        };
      };

  /**
    @name jake.Task#event:complete
    @event
   */

  this.init = function (name, prereqs, action, options) {
    var opts = options || {};

    this._currentPrereqIndex = 0;

    this.name = name;
    this.prereqs = prereqs;
    this.action = action;
    this.async = false;
    this.done = false;
    this.fullName = null;
    this.description = null;
    this.args = [];
    this.value = UNDEFINED_VALUE;
    this.namespace = null;

    // Support legacy async-flag -- if not explicitly passed or falsy, will
    // be set to empty-object
    if (typeof opts == 'boolean' && opts === true) {
      this.async = true;
    }
    else {
      if (opts.async) {
        this.async = true;
      }
    }
  };

  /**
    @name jake.Task#invoke
    @function
    @description Runs prerequisites, then this task. If the task has already
    been run, will not run the task again.
   */
  this.invoke = function () {
    jake._invocationChain.push(this);
    this.args = Array.prototype.slice.call(arguments);
    this.runPrereqs();
  };

  /**
    @name jake.Task#reenable
    @function
    @description Runs this task, without running any prerequisites. If the task
    has already been run, it will still run it again.
   */
  this.execute = function () {
    jake._invocationChain.push(this);
    this.reenable();
    this.run();
  };

  this.runPrereqs = function () {
    if (this.prereqs && this.prereqs.length) {
      this.nextPrereq();
    }
    else {
      this.run();
    }
  };

  this.nextPrereq = function () {
    var self = this
      , index = this._currentPrereqIndex
      , name = this.prereqs[index]
      , prereq
      , parsed
      , filePath
      , stats;

    if (name) {

      parsed = parsePrereqName(name);

      prereq = this.namespace.resolveTask(parsed.name) ||
          jake.attemptRule(name, this.namespace, 0) ||
          jake.createPlaceholderFileTask(name, this.namespace);

      if (!prereq) {
        throw new Error('Unknown task "' + name + '"');
      }

      // Do when done
      if (prereq.done) {
        self.handlePrereqComplete(prereq);
      } else {
        prereq.once('complete', function () {
          self.handlePrereqComplete(prereq);
        });
        prereq.invoke.apply(prereq, parsed.args);
      }
    }
  };

  this.reenable = function (deep) {
    var prereqs
      , prereq;
    this.done = false;
    this.value = UNDEFINED_VALUE;
    if (deep && this.prereqs) {
      prereqs = this.prereqs;
      for (var i = 0, ii = prereqs.length; i < ii; i++) {
        prereq = jake.Task[prereqs[i]];
        if (prereq) {
          prereq.reenable(deep);
        }
      }
    }
  };

  this.handlePrereqComplete = function (prereq) {
    var self = this;
    this._currentPrereqIndex++;
    if (this._currentPrereqIndex < this.prereqs.length) {
      setTimeout(function () {
        self.nextPrereq();
      }, 0);
    }
    else {
      this.run();
    }
  };

  this.isNeeded = function () {
    if (this.done || typeof this.action != 'function') {
      return false;
    }
    return true;
  };

  this.run = function () {
    var runAction = this.isNeeded()
      , val;

    if (runAction) {
      this.emit('start');
      try {
        val = this.action.apply(this, this.args);

        if (typeof val == 'object' && typeof val.then == 'function') {
          this.async = true;

          val.then(
            function(result) {
              setTimeout(function() {
                  complete(result);
                },
                0);
            },
            function(err) {
              setTimeout(function() {
                  fail(err);
                },
                0);
            });
        }
      }
      catch (e) {
        this.emit('error', e);
        return; // Bail out, not complete
      }
    }
    else {
      this.emit('skip');
    }

    if (!(runAction && this.async)) {
      complete(val);
    }
  };

  this.complete = function (val) {
    this._currentPrereqIndex = 0;
    this.done = true;

    // If 'complete' getting called because task has been
    // run already, value will not be passed -- leave in place
    if (typeof val != 'undefined') {
      this.value = val;
    }

    this.emit('complete', this.value);
  };

})();
utils.mixin(Task.prototype, TaskBase);

exports.Task = Task;
