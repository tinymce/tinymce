Esprima ([esprima.org](http://esprima.org)) is an educational
[ECMAScript](http://www.ecma-international.org/publications/standards/Ecma-262.htm)
(also popularly known as [JavaScript](http://en.wikipedia.org/wiki/JavaScript>JavaScript))
parsing infrastructure for multipurpose analysis. It is also written in ECMAScript.

Esprima serves as a good basis for various tools such as source
modification ([Esmorph](https://github.com/ariya/esmorph)), coverage analyzer
([node-cover](https://github.com/itay/node-cover) and
[coveraje](https://github.com/coveraje/coveraje)),
source-to-source compiler ([Marv](https://github.com/Yoric/Marv-the-Tinker)),
syntax formatter ([Code Painter](https://github.com/fawek/codepainter)),
and code generator ([escodegen](https://github.com/Constellation/escodegen)).

Esprima can be used in a web browser:

    <script src="esprima.js"></script>

or in a Node.js application via the package manager:

    npm install esprima

Esprima parser output is compatible with Mozilla (SpiderMonkey)
[Parser API](https://developer.mozilla.org/en/SpiderMonkey/Parser_API).

A very simple example:

    esprima.parse('var answer=42').body[0].declarations[0].init

produces the following object:

    { type: 'Literal', value: 42 }

Esprima is still in the development, for now please check
[the wiki documentation](http://wiki.esprima.org).

Since it is not comprehensive nor complete, refer to the
[issue tracker](http://issues.esprima.org) for
[known problems](http://code.google.com/p/esprima/issues/list?q=Defect)
and [future plans](http://code.google.com/p/esprima/issues/list?q=Enhancement).
Esprima is supported on [many browsers](http://code.google.com/p/esprima/wiki/BrowserCompatibility):
IE 6+, Firefox 1+, Safari 3+, Chrome 1+, and Opera 8+.

Feedback and contribution are welcomed! Please join the
[mailing list](http://groups.google.com/group/esprima) and read the
[contribution guide](http://code.google.com/p/esprima/wiki/ContributionGuide)
for further info.


### License

Copyright (C) 2012, 2011 [Ariya Hidayat](http://ariya.ofilabs.com/about)
 (twitter: [@ariyahidayat](http://twitter.com/ariyahidayat)) and other contributors.

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

