### Jake -- JavaScript build tool for Node.js

[![Build Status](https://travis-ci.org/mde/jake.png?branch=master)](https://travis-ci.org/mde/jake)

### Installing with [NPM](http://npmjs.org/)

Install globally with:

    npm install -g jake

Or you may also install it as a development dependency in a package.json file:

    // package.json
    "devDependencies": {
      "jake": "latest"
    }

Then install it with `npm install`

Note Jake is intended to be mostly a command-line tool, but lately there have been
changes to it so it can be either embedded, or run from inside your project.

### Installing from source

Prerequisites: Jake requires [Node.js](<http://nodejs.org/>), and the
[utilities](https://npmjs.org/package/utilities) and
[minimatch](https://npmjs.org/package/minimatch) modules.

Get Jake:

    git clone git://github.com/mde/jake.git

Build Jake:

    cd jake && make && sudo make install

Even if you're installing Jake from source, you'll still need NPM for installing
the few modules Jake depends on. `make install` will do this automatically for
you.

By default Jake is installed in "/usr/local." To install it into a different
directory (e.g., one that doesn't require super-user privilege), pass the PREFIX
variable to the `make install` command.  For example, to install it into a
"jake" directory in your home directory, you could use this:

    make && make install PREFIX=~/jake

If do you install Jake somewhere special, you'll need to add the "bin" directory
in the install target to your PATH to get access to the `jake` executable.

### Windows, installing from source

For Windows users installing from source, there are some additional steps.

*Assumed: current directory is the same directory where node.exe is present.*

Get Jake:

    git clone git://github.com/mde/jake.git node_modules/jake

Copy jake.bat and jake to the same directory as node.exe

    copy node_modules/jake/jake.bat jake.bat
    copy node_modules/jake/jake jake

Add the directory of node.exe to the environment PATH variable.

### Basic usage

    jake [options ...] [env variables ...] target

### Description

    Jake is a simple JavaScript build program with capabilities similar to the
    regular make or rake command.

    Jake has the following features:
        * Jakefiles are in standard JavaScript syntax
        * Tasks with prerequisites
        * Namespaces for tasks
        * Async task execution

### Options

    -V/v
    --version                   Display the Jake version.

    -h
    --help                      Display help message.

    -f *FILE*
    --jakefile *FILE*           Use FILE as the Jakefile.

    -C *DIRECTORY*
    --directory *DIRECTORY*     Change to DIRECTORY before running tasks.

    -q
    --quiet                     Do not log messages to standard output.

    -J *JAKELIBDIR*
    --jakelibdir *JAKELIBDIR*   Auto-import any .jake files in JAKELIBDIR.
                                (default is 'jakelib')

    -B
    --always-make               Unconditionally make all targets.

    -t
    --trace                     Enable full backtrace.

    -T/ls
    --tasks                     Display the tasks (matching optional PATTERN)
                                with descriptions, then exit.

### Jakefile syntax

A Jakefile is just executable JavaScript. You can include whatever JavaScript
you want in it.

## API Docs

API docs [can be found here](http://mde.github.com/jake/doc/).

## Tasks

Use `task` to define tasks. It has one required argument, the task-name, and
three optional arguments:

```javascript
task(name, [prerequisites], [action], [opts]);
```

The `name` argument is a String with the name of the task, and `prerequisites`
is an optional Array arg of the list of prerequisite tasks to perform first.

The `action` is a Function defininng the action to take for the task. (Note that
Object-literal syntax for name/prerequisites in a single argument a la Rake is
also supported, but JavaScript's lack of support for dynamic keys in Object
literals makes it not very useful.) The action is invoked with the Task object
itself as the execution context (i.e, "this" inside the action references the
Task object).

The `opts` argument is the normal JavaScript-style 'options' object. When a
task's operations are asynchronous, the `async` property should be set to
`true`, and the task must call `complete()` to signal to Jake that the task is
done, and execution can proceed. By default the `async` property is `false`.

Tasks created with `task` are always executed when asked for (or are a
prerequisite). Tasks created with `file` are only executed if no file with the
given name exists or if any of its file-prerequisites are more recent than the
file named by the task. Also, if any prerequisite is a regular task, the file
task will always be executed.

Use `desc` to add a string description of the task.

Here's an example:

```javascript
desc('This is the default task.');
task('default', function (params) {
  console.log('This is the default task.');
});

desc('This task has prerequisites.');
task('hasPrereqs', ['foo', 'bar', 'baz'], function (params) {
  console.log('Ran some prereqs first.');
});
```

And here's an example of an asynchronous task:

```javascript
desc('This is an asynchronous task.');
task('asyncTask', {async: true}, function () {
  setTimeout(complete, 1000);
});
```

A Task is also an EventEmitter which emits the 'start' event when it begins to
run, and the 'complete' event when it is finished. This allows asynchronous
tasks to be run from within other asked via either `invoke` or `execute`, and
ensure they will complete before the rest of the containing task executes. See
the section "Running tasks from within other tasks," below.

### File-tasks

Create a file-task by calling `file`.

File-tasks create a file from one or more other files. With a file-task, Jake
checks both that the file exists, and also that it is not older than the files
specified by any prerequisite tasks. File-tasks are particularly useful for
compiling something from a tree of source files.

```javascript
desc('This builds a minified JS file for production.');
file('foo-minified.js', ['bar', 'foo-bar.js', 'foo-baz.js'], function () {
  // Code to concat and minify goes here
});
```

### Directory-tasks

Create a directory-task by calling `directory`.

Directory-tasks create a directory for use with for file-tasks. Jake checks for
the existence of the directory, and only creates it if needed.

```javascript
desc('This creates the bar directory for use with the foo-minified.js file-task.');
directory('bar');
```

This task will create the directory when used as a prerequisite for a file-task,
or when run from the command-line.

### Namespaces

Use `namespace` to create a namespace of tasks to perform. Call it with two arguments:

```javascript
namespace(name, namespaceTasks);
```

Where is `name` is the name of the namespace, and `namespaceTasks` is a function
with calls inside it to `task` or `desc` definining all the tasks for that
namespace.

Here's an example:

```javascript
desc('This is the default task.');
task('default', function () {
  console.log('This is the default task.');
});

namespace('foo', function () {
  desc('This the foo:bar task');
  task('bar', function () {
    console.log('doing foo:bar task');
  });

  desc('This the foo:baz task');
  task('baz', ['default', 'foo:bar'], function () {
    console.log('doing foo:baz task');
  });

});
```

In this example, the foo:baz task depends on the the default and foo:bar tasks.

### Rules

When you add a filename as a prerequisite for a task, but there is not a a
file-task defined for it, Jake can create file-tasks on the fly from Rules.

Here's an example:

```javascript
rule('.o', '.c', {async: true}, function () {
  var cmd = 'cc ' + this.source + ' -c -o ' + this.name;
  jake.exec(cmd, function () {
    complete();
  });
});
```

This rule will take effect for any task-name that ends in '.o', but will require
the existence of a prerequisite source file with the same name ending in '.c'.

For example, with this rule, if you reference a task 'foobarbaz.o' as a
prerequisite somewhere in one of your Jake tasks, rather than complaining about
this file not existing, or the lack of a task with that name, Jake will
automatically create a FileTask for 'foobarbaz.o' with the action specified in
the rule you've defined. (The usual action would be to create 'foobarbaz.o' from
'foobarbaz.c'). If 'foobarbaz.c' does not exist, it will recursively attempt
synthesize a viable rule for it as well.

#### Regex patterns

You can use regular expresions to match file extensions as well:

```javascript
rule(/\.o$/, '.c', {async: true}, function () {
  var cmd = 'cc ' + this.source + ' -c -o ' + this.name;
  jake.exec(cmd, function () {
    complete();
  });
});
```

#### Source files from functions

You can also use a function to calculate the name of the desired source-file to
use, instead of assuming simple suffix-substitution:

```javascript
// Match .less.css or .scss.css and run appropriate preprocessor
var getSourceFilename = function (name) {
  // Strip off the extension for the filename
  return name.replace(/\.css$/, '');
};
rule(/\.\w{2,4}\.css$/, getSourceFilename, {async: true}, function () {
  // Get appropriate preprocessor for this.source, e.g., foo.less
  // Generate a file with filename of this.name, e.g., foo.less.css
});
```

### Passing parameters to jake

Parameters can be passed to Jake two ways: plain arguments, and environment
variables.

To pass positional arguments to the Jake tasks, enclose them in square braces,
separated by commas, after the name of the task on the command-line. For
example, with the following Jakefile:

```javascript
desc('This is an awesome task.');
task('awesome', function (a, b, c) {
  console.log(a, b, c);
});
```

You could run `jake` like this:

    jake awesome[foo,bar,baz]

And you'd get the following output:

    foo bar baz

Note that you *cannot* uses spaces between the commas separating the parameters.

Any parameters passed after the Jake task that contain an equals sign (=) will
be added to process.env.

With the following Jakefile:

```javascript
desc('This is an awesome task.');
task('awesome', function (a, b, c) {
  console.log(a, b, c);
  console.log(process.env.qux, process.env.frang);
});
```

You could run `jake` like this:

    jake awesome[foo,bar,baz] qux=zoobie frang=asdf

And you'd get the following output:

    foo bar baz
    zoobie asdf
Running `jake` with no arguments runs the default task.

__Note for zsh users__ : you will need to escape the brackets or wrap in single
quotes like this to pass parameters :

    jake 'awesome[foo,bar,baz]'

An other solution is to desactivate permannently file-globbing for the `jake`
command. You can do this by adding this line to your `.zshrc` file :

    alias jake="noglob jake"

### Cleanup after all tasks run, jake 'complete' event

The base 'jake' object is an EventEmitter, and fires a 'start' event before
running, an 'error' event after an uncaught exception, and a 'complete' event after running all tasks.

This is sometimes useful when a task starts a process which keeps the Node
event-loop running (e.g., a database connection). If you know you want to stop
the running Node process after all tasks have finished, you can set a listener
for the 'complete' event, like so:

```javascript
jake.addListener('complete', function () {
  process.exit();
});
```

### Running tasks from within other tasks

Jake supports the ability to run a task from within another task via the
`invoke` and `execute` methods.

The `invoke` method will run the desired task, along with its prerequisites:

```javascript
desc('Calls the foo:bar task and its prerequisites.');
task('invokeFooBar', function () {
  // Calls foo:bar and its prereqs
  jake.Task['foo:bar'].invoke();
});
```

The `invoke` method will only run the task once, even if you call it repeatedly.

```javascript
desc('Calls the foo:bar task and its prerequisites.');
task('invokeFooBar', function () {
  // Calls foo:bar and its prereqs
  jake.Task['foo:bar'].invoke();
  // Does nothing
  jake.Task['foo:bar'].invoke();
});
```

The `execute` method will run the desired task without its prerequisites:

```javascript
desc('Calls the foo:bar task without its prerequisites.');
task('executeFooBar', function () {
  // Calls foo:bar without its prereqs
  jake.Task['foo:baz'].execute();
});
```

Calling `execute` repeatedly will run the desired task repeatedly.

```javascript
desc('Calls the foo:bar task without its prerequisites.');
task('executeFooBar', function () {
  // Calls foo:bar without its prereqs
  jake.Task['foo:baz'].execute();
  // Can keep running this over and over
  jake.Task['foo:baz'].execute();
  jake.Task['foo:baz'].execute();
});
```

If you want to run the task and its prerequisites more than once, you can use
`invoke` with the `reenable` method.

```javascript
desc('Calls the foo:bar task and its prerequisites.');
task('invokeFooBar', function () {
  // Calls foo:bar and its prereqs
  jake.Task['foo:bar'].invoke();
  // Does nothing
  jake.Task['foo:bar'].invoke();
  // Only re-runs foo:bar, but not its prerequisites
  jake.Task['foo:bar'].reenable();
  jake.Task['foo:bar'].invoke();
});
```

The `reenable` method takes a single Boolean arg, a 'deep' flag, which reenables
the task's prerequisites if set to true.

```javascript
desc('Calls the foo:bar task and its prerequisites.');
task('invokeFooBar', function () {
  // Calls foo:bar and its prereqs
  jake.Task['foo:bar'].invoke();
  // Does nothing
  jake.Task['foo:bar'].invoke();
  // Re-runs foo:bar and all of its prerequisites
  jake.Task['foo:bar'].reenable(true);
  jake.Task['foo:bar'].invoke();
});
```

It's easy to pass params on to a sub-task run via `invoke` or `execute`:

```javascript
desc('Passes params on to other tasks.');
task('passParams', function () {
  var t = jake.Task['foo:bar'];
  // Calls foo:bar, passing along current args
  t.invoke.apply(t, arguments);
});
```

### Getting values out of tasks

Passing a value to the `complete` function for async tasks (or simply returning
a value from sync tasks) will set a 'value' property on the completed task. This
same value will also be passed as the task emits its 'complete' event.

After a task is completed, this value will be also available in the '.value'
property on the task. Calling `reenable` on the task will clear this value.


```javascript
task('environment', {async: true}, function () {
  // Do some sort of I/O to figure out the environment value
  doSomeAsync(function (err, val) {
    if (err) { throw err }
    complete(val);
  });
});

task("someTaskWithEnvViaPrereq", ["envrionment"], function () {
  api = jake.Task["envrionment"].value;
  console.log(api);
});

task("someTaskWithEnvViaInvoke", {async: true}, function () {
  var env = jake.Task["envrionment"];
  env.addListener('complete', function (api) {
    console.log(api);
    complete();
  });
  env.invoke();
});
```

### Managing asynchrony without prereqs (e.g., when using `invoke`)

You can mix sync and async without problems when using normal prereqs, because
the Jake execution loop takes care of the difference for you. But when you call
`invoke` or `execute`, you have to manage the asynchrony yourself.

Here's a correct working example:

```javascript
task('async1', ['async2'], {async: true}, function () {
    console.log('-- async1 start ----------------');
    setTimeout(function () {
        console.log('-- async1 done ----------------');
        complete();
    }, 1000);
});

task('async2', {async: true}, function () {
    console.log('-- async2 start ----------------');
    setTimeout(function () {
        console.log('-- async2 done ----------------');
        complete();
    }, 500);
});

task('init', ['async1', 'async2'], {async: true}, function () {
    console.log('-- init start ----------------');
    setTimeout(function () {
        console.log('-- init done ----------------');
        complete();
    }, 100);
});

task('default', {async: true}, function () {
  console.log('-- default start ----------------');
  var init = jake.Task.init;
  init.addListener('complete', function () {
    console.log('-- default done ----------------');
    complete();
  });
  init.invoke();
});
```

You have to declare the "default" task as asynchronous as well, and call
`complete` on it when "init" finishes. Here's the output:

    -- default start ----------------
    -- async2 start ----------------
    -- async2 done ----------------
    -- async1 start ----------------
    -- async1 done ----------------
    -- init start ----------------
    -- init done ----------------
    -- default done ----------------

You get what you expect -- "default" starts, the rest runs, and finally
"default" finishes.

### Evented tasks

Tasks are EventEmitters. They can fire 'complete' and 'error' events.

If a task called via `invoke` is asynchronous, you can set a listener on the
'complete' event to run any code that depends on it.

```javascript
desc('Calls the async foo:baz task and its prerequisites.');
task('invokeFooBaz', {async: true}, function () {
  var t = jake.Task['foo:baz'];
  t.addListener('complete', function () {
    console.log('Finished executing foo:baz');
    // Maybe run some other code
    // ...
    // Complete the containing task
    complete();
  });
  // Kick off foo:baz
  t.invoke();
});
```

If you want to handle the errors in a task in some specific way, you can set a
listener for the 'error' event, like so:

```javascript
namespace('vronk', function () {
  task('groo', function () {
    var t = jake.Task['vronk:zong'];
    t.addListener('error', function (e) {
      console.log(e.message);
    });
    t.invoke();
  });

  task('zong', function () {
    throw new Error('OMFGZONG');
  });
});
```

If no specific listener is set for the "error" event, errors are handled by
Jake's generic error-handling.

### Aborting a task

You can abort a task by calling the `fail` function, and Jake will abort the
currently running task. You can pass a customized error message to `fail`:

```javascript
desc('This task fails.');
task('failTask', function () {
  fail('Yikes. Something back happened.');
});
```

You can also pass an optional exit status-code to the fail command, like so:

```javascript
desc('This task fails with an exit-status of 42.');
task('failTaskQuestionCustomStatus', function () {
  fail('What is the answer?', 42);
});
```

The process will exit with a status of 42.

Uncaught errors will also abort the currently running task.

### Showing the list of tasks

Passing `jake` the -T or --tasks flag will display the full list of tasks
available in a Jakefile, along with their descriptions:

    $ jake -T
    jake default       # This is the default task.
    jake asdf          # This is the asdf task.
    jake concat.txt    # File task, concating two files together
    jake failure       # Failing task.
    jake lookup        # Jake task lookup by name.
    jake foo:bar       # This the foo:bar task
    jake foo:fonebone  # This the foo:fonebone task

Setting a value for -T/--tasks will filter the list by that value:

    $ jake -T foo
    jake foo:bar       # This the foo:bar task
    jake foo:fonebone  # This the foo:fonebone task

The list displayed will be all tasks whose namespace/name contain the filter-string.

## Breaking things up into multiple files

Jake will automatically look for files with a .jake extension in a 'jakelib'
directory in your project, and load them (via `require`) after loading your
Jakefile. (The directory name can be overridden using the -J/--jakelibdir
command-line option.)

This allows you to break your tasks up over multiple files -- a good way to do
it is one namespace per file: e.g., a `zardoz` namespace full of tasks in
'jakelib/zardox.jake'.

Note that these .jake files each run in their own module-context, so they don't
have access to each others' data. However, the Jake API methods, and the
task-hierarchy are globally available, so you can use tasks in any file as
prerequisites for tasks in any other, just as if everything were in a single
file.

Environment-variables set on the command-line are likewise also naturally
available to code in all files via process.env.

## File-utils

Since shelling out in Node is an asynchronous operation, Jake comes with a few
useful file-utilities with a synchronous API, that make scripting easier.

The `jake.mkdirP` utility recursively creates a set of nested directories. It
will not throw an error if any of the directories already exists. Here's an example:

```javascript
jake.mkdirP('app/views/layouts');
```

The `jake.cpR` utility does a recursive copy of a file or directory. It takes
two arguments, the file/directory to copy, and the destination. Note that this
command can only copy files and directories; it does not perform globbing (so
arguments like '*.txt' are not possible).

```javascript
jake.cpR(path.join(sourceDir, '/templates'), currentDir);
```

This would copy 'templates' (and all its contents) into `currentDir`.

The `jake.readdirR` utility gives you a recursive directory listing, giving you
output somewhat similar to the Unix `find` command. It only works with a
directory name, and does not perform filtering or globbing.

```javascript
jake.readdirR('pkg');
```

This would return an array of filepaths for all files in the 'pkg' directory,
and all its subdirectories.

The `jake.rmRf` utility recursively removes a directory and all its contents.

```javascript
jake.rmRf('pkg');
```

This would remove the 'pkg' directory, and all its contents.

## Running shell-commands: `jake.exec` and `jake.createExec`

Jake also provides a more general utility function for running a sequence of
shell-commands.

### `jake.exec`

The `jake.exec` command takes an array of shell-command strings, and an optional
callback to run after completing them. Here's an example from Jake's Jakefile,
that runs the tests:

```javascript
desc('Runs the Jake tests.');
task('test', {async: true}, function () {
  var cmds = [
    'node ./tests/parseargs.js'
  , 'node ./tests/task_base.js'
  , 'node ./tests/file_task.js'
  ];
  jake.exec(cmds, {printStdout: true}, function () {
    console.log('All tests passed.');
    complete();
  });

desc('Runs some apps in interactive mode.');
task('interactiveTask', {async: true}, function () {
  var cmds = [
    'node' // Node conosle
  , 'vim' // Open Vim
  ];
  jake.exec(cmds, {interactive: true}, function () {
    complete();
  });
});
```

It also takes an optional options-object, with the following options:

 * `interactive` (tasks are interactive, trumps printStdout and
    printStderr below, default false)

 * `printStdout` (print to stdout, default false)

 * `printStderr` (print to stderr, default false)

 * `breakOnError` (stop execution on error, default true)

This command doesn't pipe input between commands -- it's for simple execution.

### `jake.createExec` and the evented Exec object

Jake also provides an evented interface for running shell commands. Calling
`jake.createExec` returns an instance of `jake.Exec`, which is an `EventEmitter`
that fires events as it executes commands.

It emits the following events:

* 'cmdStart': When a new command begins to run. Passes one arg, the command
being run.

* 'cmdEnd': When a command finishes. Passes one arg, the command
being run.

* 'stdout': When the stdout for the child-process recieves data. This streams
the stdout data. Passes one arg, the chunk of data.

* 'stderr': When the stderr for the child-process recieves data. This streams
the stderr data. Passes one arg, the chunk of data.

* 'error': When a shell-command exits with a non-zero status-code. Passes two
args -- the error message, and the status code. If you do not set an error
handler, and a command exits with an error-code, Jake will throw the unhandled
error. If `breakOnError` is set to true, the Exec object will emit and 'error'
event after the first error, and stop any further execution.

To begin running the commands, you have to call the `run` method on it. It also
has an `append` method for adding new commands to the list of commands to run.

Here's an example:

```javascript
var ex = jake.createExec(['do_thing.sh']);
ex.addListener('error', function (msg, code) {
  if (code == 127) {
    console.log("Couldn't find do_thing script, trying do_other_thing");
    ex.append('do_other_thing.sh');
  }
  else {
    fail('Fatal error: ' + msg, code);
  }
});
ex.run();
```

Using the evented Exec object gives you a lot more flexibility in running shell
commmands. But if you need something more sophisticated, Procstreams
(<https://github.com/polotek/procstreams>) might be a good option.

## Logging and output

Using the -q/--quiet flag at the command-line will stop Jake from sending its
normal output to standard output. Note that this only applies to built-in output
from Jake; anything you output normally from your tasks will still be displayed.

If you want to take advantage of the -q/--quiet flag in your own programs, you
can use `jake.logger.log` and `jake.logger.error` for displaying output. These
two commands will respect the flag, and suppress output correctly when the
quiet-flag is on.

You can check the current value of this flag in your own tasks by using
`jake.program.opts.quiet`. If you want the output of a `jake.exec` shell-command
to respect the quiet-flag, set your `printStdout` and `printStderr` options to
false if the quiet-option is on:

```javascript
task('echo', {async: true}, function () {
  jake.exec(['echo "hello"'], function () {
    jake.logger.log('Done.');
    complete();
  }, {printStdout: !jake.program.opts.quiet});
});
```

### FileList

Jake's FileList takes a list of glob-patterns and file-names, and lazy-creates a
list of files to include. Instead of immediately searching the filesystem to
find the files, a FileList holds the pattern until it is actually used.

When any of the normal JavaScript Array methods (or the `toArray` method) are
called on the FileList, the pending patterns are resolved into an actual list of
file-names. FileList uses the [minimatch](https://github.com/isaacs/minimatch) module.

To build the list of files, use FileList's `include` and `exclude` methods:

```javascript
var list = new jake.FileList();
list.include('foo/*.txt');
list.include(['bar/*.txt', 'README.md']);
list.include('Makefile', 'package.json');
list.exclude('foo/zoobie.txt');
list.exclude(/foo\/src.*.txt/);
console.log(list.toArray());
```

The `include` method can be called either with an array of items, or multiple
single parameters. Items can be either glob-patterns, or individual file-names.

The `exclude` method will prevent files from being included in the list. These
files must resolve to actual files on the filesystem. It can be called either
with an array of items, or mutliple single parameters. Items can be
glob-patterns, individual file-names, string-representations of
regular-expressions, or regular-expression literals.

## PackageTask

When you create a PackageTask, it programmically creates a set of tasks for
packaging up your project for distribution. Here's an example:

```javascript
packageTask('fonebone', 'v0.1.2112', function () {
  var fileList = [
    'Jakefile'
  , 'README.md'
  , 'package.json'
  , 'lib/*'
  , 'bin/*'
  , 'tests/*'
  ];
  this.packageFiles.include(fileList);
  this.needTarGz = true;
  this.needTarBz2 = true;
});
```

This will automatically create a 'package' task that will assemble the specified
files in 'pkg/fonebone-v0.1.2112,' and compress them according to the specified
options. After running `jake package`, you'll have the following in pkg/:

    fonebone-v0.1.2112
    fonebone-v0.1.2112.tar.bz2
    fonebone-v0.1.2112.tar.gz

PackageTask also creates a 'clobber' task that removes the pkg/
directory.

The [PackageTask API
docs](http://mde.github.com/jake/doc/symbols/jake.PackageTask.html) include a
lot more information, including different archiving options.

## TestTask

When you create a TestTask, it programmically creates a simple task for running
tests for your project. The first argument of the constructor is the
project-name (used in the description of the task), the second (optional)
argument is a list of prerequisite tasks to run before the tests, and the final
argument is a function that defines the task. It allows you to specifify what
files to run as tests, and what to name the task that gets created (defaults to
"test" if unset).

```javascript
testTask('fonebone', ['asdf', 'qwer'], function () {
  var fileList = [
    'tests/*'
  , 'lib/adapters/**/test.js'
  ];
  this.testFiles.include(fileList);
  this.testFiles.exclude('tests/helper.js');
  this.testName = 'testMainAndAdapters';
});
```

Tests in the specified file should be in the very simple format of
test-functions hung off the export. These tests are converted into Jake tasks
which Jake then runs normally.

If a test needs to run asynchronously, simply define the test-function with a
single argument, a callback. Jake will define this as an asynchronous task, and
will wait until the callback is called in the test function to run the next test.

If you name your test 'before', it will run before any of the other tests you
export. You can use it for test-setup. If you name a test 'after', it will run
after all the other tests have finished. You can use it for teardown. The
'before' and 'after' will only run once per test module -- *not* before and
after each test.

Here's an example test-file:

```javascript
var assert = require('assert')
  , tests;

tests = {
  'before': function () {
    // Do some setup here
  }
, 'after': function () {
    // Do some teardown here
  }
, 'sync test': function () {
    // Assert something
    assert.ok(true);
  }
, 'async test': function (next) {
    // Assert something else
    assert.ok(true);
    // Won't go next until this is called
    next();
  }
, 'another sync test': function () {
    // Assert something else
    assert.ok(true);
  }
};

module.exports = tests;
```

Jake's tests are also a good example of use of a TestTask.

## WatchTask

When you create a WatchTask, it will watch a directory of files for changes, and
run a task or set of tasks anytime there's a change.

```javascript
// Assumes there's an 'assets' task
watchTask(['assets'], function () {
  this.watchFiles.include([
    './**/*.ejs'
  ]);
});
```
Run `jake watch` to start up the WatchTask.

By default, it will watch the current directory for these files:

```javascript
[ './**/*.js'
, './**/*.coffee'
, './**/*.css'
, './**/*.less'
, './**/*.scss'
]
```

It will exclude these files:

```javascript
[ 'node_modules/**'
, '.git/**'
]
```

The list of watched files is in a FileList, with the normal `include`/`exclude`
API.

## NpmPublishTask

The NpmPublishTask builds on top of PackageTask to allow you to do a version
tump of your project, package it, and publish it to NPM. Define the task with
your project's name, and call `include`/`exclude` on the `packageFiles` FileList
to create the list of files you want packaged and published to NPM.

Here's an example from Jake's Jakefile:

```javascript
npmPublishTask('jake', function () {
  this.packageFiles.include([
    'Makefile'
  , 'Jakefile'
  , 'README.md'
  , 'package.json'
  , 'lib/**'
  , 'bin/**'
  , 'test/**'
    ]);
  this.packageFiles.exclude([
    'test/tmp'
  ]);
});
```

The NpmPublishTask will automatically create a `publish` task which performs the
following steps:

1. Bump the version number in your package.json
2. Commit change in git, push it to GitHub
3. Create a git tag for the version
4. Push the tag to GitHub
5. Package the new version of your project
6. Publish it to NPM
7. Clean up the package

If you want to publish to a private NPM repository, you can specify a custom publishing command:

```javascript
npmPublishTask('jake', function () {
  this.packageFiles.include([
  , 'index.js'
  , 'package.json'
    ]);

  // Publishes using the gemfury cli
  // `%filename` will be replaced with the package filename
  this.publishCmd = 'fury push %filename';
});
```

## CoffeeScript Jakefiles

Jake can also handle Jakefiles in CoffeeScript. Be sure to make it
Jakefile.coffee so Jake knows it's in CoffeeScript.

Here's an example:

```coffeescript
util = require('util')

desc 'This is the default task.'
task 'default', (params) ->
  console.log 'Ths is the default task.'
  console.log(util.inspect(arguments))
  jake.Task['new'].invoke []

task 'new', ->
  console.log 'ello from new'
  jake.Task['foo:next'].invoke ['param']

namespace 'foo', ->
  task 'next', (param) ->
    console.log 'ello from next with param: ' + param
```

## Related projects

James Coglan's "Jake": <http://github.com/jcoglan/jake>

Confusingly, this is a Ruby tool for building JavaScript packages from source code.

280 North's Jake: <http://github.com/280north/jake>

This is also a JavaScript port of Rake, which runs on the Narwhal platform.

### License

Licensed under the Apache License, Version 2.0
(<http://www.apache.org/licenses/LICENSE-2.0>)
