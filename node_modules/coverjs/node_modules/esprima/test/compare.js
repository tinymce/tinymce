/*
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint browser: true */

function runBenchmarks() {
    'use strict';

    var index = 0,
        totalSize = 0,
        totalTime = {},
        fixture;

    fixture = [
        'esprima jquery-1.7.1',
        'parsejs jquery-1.7.1',
        'zeparser jquery-1.7.1',
        'narcissus jquery-1.7.1',

        'esprima prototype-1.7.0.0',
        'parsejs prototype-1.7.0.0',
        'zeparser prototype-1.7.0.0',
        'narcissus prototype-1.7.0.0',

        'esprima mootools-1.4.1',
        'parsejs mootools-1.4.1',
        'zeparser mootools-1.4.1',
        'narcissus mootools-1.4.1',

        'esprima ext-core-3.1.0',
        'parsejs ext-core-3.1.0',
        'zeparser ext-core-3.1.0',
        'narcissus ext-core-3.1.0'
    ];

    function id(i) {
        return document.getElementById(i);
    }

    function kb(bytes) {
        return (bytes / 1024).toFixed(1);
    }

    function setText(id, str) {
        var el = document.getElementById(id);
        if (typeof el.innerText === 'string') {
            el.innerText = str;
        } else {
            el.textContent = str;
        }
    }

    function ready() {
        setText('status', 'Ready.');
        id('run').disabled = false;
        id('run').style.visibility = 'visible';
    }

    function load(tst, callback) {
        var xhr = new XMLHttpRequest(),
            src = '3rdparty/' + tst + '.js';

        // Already available? Don't reload from server.
        if (window.data && window.data.hasOwnProperty(tst)) {
            callback.apply();
        }

        try {
            xhr.timeout = 30000;
            xhr.open('GET', src, true);
            setText('status', 'Please wait. Loading ' + src);

            xhr.ontimeout = function () {
                setText('status', 'Please wait. Error: time out while loading ' + src + ' ');
                callback.apply();
            };

            xhr.onreadystatechange = function () {
                var success = false,
                    size = 0;

                if (this.readyState === XMLHttpRequest.DONE) {
                    if (this.status === 200) {
                        window.data = window.data || {};
                        window.data[tst] = this.responseText;
                        size = this.responseText.length;
                        totalSize += size;
                        success = true;
                    }
                }

                if (success) {
                    setText(tst + '-size', kb(size));
                } else {
                    setText('status', 'Please wait. Error loading ' + src);
                    setText(tst + '-size', 'Error');
                }

                callback.apply();
            };

            xhr.send(null);
        } catch (e) {
            setText('status', 'Please wait. Error loading ' + src);
            callback.apply();
        }
    }


    function loadTests() {
        var sources = fixture.slice();

        function loadNextTest() {
            var tst;

            if (sources.length > 0) {
                tst = sources[0].split(' ');
                tst = tst[1];
                sources.splice(0, 1);
                window.setTimeout(function () {
                    load(tst, loadNextTest);
                }, 100);
            } else {
                setText('total-size', kb(totalSize));
                ready();
            }
        }

        id('run').style.visibility = 'hidden';
        loadNextTest();
    }

    function runBenchmark() {
        var test, source, parser, fn, benchmark;

        function formatTime(t) {
            return (t === 0) ? 'N/A' : (1000 * t).toFixed(1) + ' ms';
        }

        if (index >= fixture.length) {
            setText('total-size', kb(totalSize));
            setText('esprima-time', formatTime(totalTime.esprima));
            setText('parsejs-time', formatTime(totalTime.parsejs));
            setText('zeparser-time', formatTime(totalTime.zeparser));
            setText('narcissus-time', formatTime(totalTime.narcissus));
            ready();
            return;
        }

        test = fixture[index].split(' ');
        parser = test[0];
        test = test[1];

        source = window.data[test];
        setText(parser + '-' + test, 'Running...');

        // Force the result to be held in this array, thus defeating any
        // possible "dead core elimination" optimization.
        window.tree = [];

        switch (parser) {
        case 'esprima':
            fn = function () {
                var syntax = window.esprima.parse(source);
                window.tree.push(syntax.body.length);
            };
            break;
        case 'narcissus':
            fn = function () {
                var syntax = window.Narcissus.parser.parse(source);
                window.tree.push(syntax.children.length);
            };
            break;
        case 'parsejs':
            fn = function () {
                var syntax = window.parseJS.parse(source);
                window.tree.push(syntax.length);
            };
            break;
        case 'zeparser':
            fn = function () {
                var syntax = window.ZeParser.parse(source, false);
                window.tree.push(syntax.length);
            };
            break;
        default:
            throw 'Unknown parser type ' + parser;
        }

        benchmark = new window.Benchmark(test, fn, {
            'onComplete': function () {
                setText(parser + '-' + this.name, formatTime(this.stats.mean));
                totalSize += source.length;
                totalTime[parser] += this.stats.mean;
            }
        });

        window.setTimeout(function () {
            benchmark.run();
            index += 1;
            window.setTimeout(runBenchmark, 211);
        }, 211);
    }

    id('run').onclick = function () {

        var test;

        for (index = 0; index < fixture.length; index += 1) {
            test = fixture[index].split(' ').join('-');
            setText(test, '');
        }

        setText('status', 'Please wait. Running benchmarks...');
        id('run').style.visibility = 'hidden';

        index = 0;
        totalTime = {
            'esprima': 0,
            'narcissus': 0,
            'parsejs': 0,
            'zeparser': 0
        };

        for (test in totalTime) {
            if (totalTime.hasOwnProperty(test)) {
                setText(test + '-time', '');
            }
        }

        if (typeof window.Narcissus !== 'object') {
            window.Narcissus = {
                parser: {
                    parse: function (code) {
                        throw new Error('Narcissus is not available!');
                    }
                }
            };
        }

        runBenchmark();
    };

    setText('benchmarkjs-version', ' version ' + window.Benchmark.version);
    setText('version', window.esprima.version);

    loadTests();
}
/* vim: set sw=4 ts=4 et tw=80 : */
