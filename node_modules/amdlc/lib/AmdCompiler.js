var UglifyJS = require("uglify-js");
var fs = require("fs");
var vm = require("vm");
var path = require("path");
var crypto = require('crypto');
var utils = require("./Utils");

var fileContentsCache = {};

function dump(astNode) {
	for (var name in UglifyJS) {
		var func = UglifyJS[name];

		if (typeof(func) == "function" && astNode instanceof func) {
			console.log(name);
		}
	}
}

function getPublicModules(modules) {
	var publicModules = [];
	modules.forEach(function(module) {
		if (module.isPublic) {
			publicModules.push(module);
		}
	});

	return publicModules;
}

function idToVarName(id) {
	return '__' + id.replace(/[\.\/]/g, '_');
}

function instrumentCode(path, source) {
	var Instrument = require('coverjs').Instrument;

	return new Instrument(source, {
		name: path
	}).instrument();
}

function shouldBeInstrumented(id, options) {
	if (!options.coverageId) {
		return true;
	}

	if (id == options.coverageId.replace(/\./g, '/')) {
		return true;
	}

	return false;
}

function parseModules(options) {
	var modules = [], loadedPaths = {};

	// Returns true/false if the module is to be exposed to the global namespace or not
	function isExposed(id, source) {
		var exposeOptions = getLibFromId(id) || options;

		if (exposeOptions.expose !== false) {
			// Specific modules to expose
			if (exposeOptions.expose instanceof Array && exposeOptions.expose.indexOf(id) == -1) {
				return false;
			}

			// Only modules that are public according to jsdoc
			if (exposeOptions.expose == "public") {
				var matches, docCommentRegExp = /\/\*\*([\s\S]+?)\*\//g;

				for (matches = docCommentRegExp.exec(source); matches; matches = docCommentRegExp.exec(source)) {
					var docComment = matches[1];

					var classNameMatch = /\@class\s+(.+)/g.exec(docComment);
					if (classNameMatch) {
						if (classNameMatch[1] === id) {
							if (/@private/.test(docComment)) {
								return false;
							}
						}
					}
				}
			}

			return true;
		}

		return false;
	}

	// Returns library options if the id is part of a dependent lib
	function getLibFromId(id) {
		// Resolve id from dependent libraries
		for (var libName in options.libs) {
			var lib = options.libs[libName];

			if (id.indexOf(libName + '/') === 0) {
				return lib;
			}
		}
	}

	function resolveId(id) {
		id = normalize(id);

		// Resolve external library id
		var lib = getLibFromId(id);
		if (lib) {
			if (lib.rootNS) {
				id = id.replace(normalize(lib.rootNS).replace(/[\/]$/, '') + '/', '');
			}

			return utils.toUnixPath(path.join(lib.baseDir, id + ".js"));
		}

		// Resolve internal id
		if (options.rootNS) {
			id = id.replace(normalize(options.rootNS).replace(/[\/]$/, '') + '/', '');
		}

		return utils.toUnixPath(path.join(options.baseDir, id + ".js"));
	}

	function resolvePath(filePath) {
		if (!/\.js$/.test(filePath)) { // seems to be an id or not js file
			filePath = resolveId(filePath);
		}

		if (/^[^\/\\]/.test(filePath)) { // do not resolve if begins with slash
			filePath = path.resolve(options.baseDir, filePath);
		}

		return utils.toUnixPath(filePath);
	}

	function normalize(id) {
		return id.replace(/\./g, '/');
	}

	function shouldLoadModule(id) {
		id = normalize(id);

		for (var libName in options.libs) {
			if (id.indexOf(libName + '/') === 0) {
				return true;
			}
		}

		return !options.rootNS || id.indexOf(normalize(options.rootNS)) === 0;
	}

	function parseModule(filePath) {
		var source;

		// module might be passed as object containing full source
		if (typeof filePath === 'object') {
			source = filePath.source || '';
			filePath = filePath.filePath;
		}

		filePath = utils.toUnixPath(filePath);
		//filePath = resolvePath(filePath);

		if (loadedPaths[filePath]) {
			return;
		}

		loadedPaths[filePath] = true;

		if (typeof filePath === 'string' && !source) {
			source = utils.getFileContents(filePath);
		}

		if (options.version) {
			var version = options.version.split('.');

			source = source.replace(/@@version@@/g, options.version);
			source = source.replace(/@@majorVersion@@/g, version.shift());
			source = source.replace(/@@minorVersion@@/g, version.join('.'));
		}

		if (options.releaseDate) {
			source = source.replace(/@@releaseDate@@/g, options.releaseDate);
		}

		if (options.verbose) {
			console.log("Parsing module file: " + filePath);
		}

		try {
			vm.runInNewContext(source, {
				define: function(id, deps, func) {
					deps.forEach(function(id) {
						var filePath = resolveId(id);

						if (options.moduleOverrides && options.moduleOverrides[id]) {
							filePath = options.moduleOverrides[id];
						}

						if (!loadedPaths[filePath] && shouldLoadModule(id)) {
							parseModule(filePath);
						}
					});

					modules.push({
						filePath: filePath,
						source: source,
						id: id,
						deps: deps,
						isPublic: isExposed(id, source)
					});
				}
			});
		} catch(ex) {
			console.info(ex);
			process.exit(1);
		}
	}

	utils.findFiles(options.from, options.baseDir).forEach(parseModule);

	return modules;
}

function mangleModuleIds(body) {
	var ast, value, args, elements, moduleIds = [], lookup = {};

	for (var i = 0; i < body.length; i++) {
		ast = body[i].body;

		if (ast instanceof UglifyJS.AST_Call && ast.expression.name === "define") {
			args = ast.args;

			if (args.length == 3) {
				if (args[0] instanceof UglifyJS.AST_String) {
					var id = args[0].value, varName = idToVarName(id);

					args[0] = new UglifyJS.AST_SymbolVar({
						name: varName
					});

					if (!lookup[id]) {
						moduleIds.push({
							id: id,
							varName: varName
						});

						lookup[id] = true;
					}
				}

				if (args[1] instanceof UglifyJS.AST_Array) {
					elements = args[1].elements;

					for (var ei = 0; ei < elements.length; ei++) {
						if (elements[ei] instanceof UglifyJS.AST_String) {
							var depId = elements[ei].value;

							elements[ei] = new UglifyJS.AST_SymbolVar({
								name: idToVarName(depId)
							});

							if (!lookup[depId]) {
								moduleIds.push({
									id: depId,
									varName: idToVarName(depId)
								});

								lookup[depId] = true;
							}
						}
					}
				} else {
					elements = [];
				}

				if (args[2] instanceof UglifyJS.AST_Function) {
					if (elements.length !== args[2].argnames.length) {
						throw new Error("Module defs are not equal to define function args");
					}
				}
			}
		}
	}

	var moduleVarDef = [];

	moduleIds.forEach(function(module) {
		moduleVarDef.push(new UglifyJS.AST_VarDef({
			name : new UglifyJS.AST_SymbolVar({
				name: module.varName
			}),

			value: new UglifyJS.AST_String({
				value: module.id
			})
		}));
	});

	body.unshift(new UglifyJS.AST_Var({
		definitions: moduleVarDef
	}));
}

function exposeModules(body, publicModules) {
	var moduleIdArray = [];

	publicModules.forEach(function(module) {
		moduleIdArray.push(new UglifyJS.AST_SymbolVar({name: idToVarName(module.id)}));
	});

	body.push(new UglifyJS.AST_SimpleStatement({
		body: new UglifyJS.AST_Call({
			expression: new UglifyJS.AST_SymbolRef({name: "expose"}),
			args: [new UglifyJS.AST_Array({elements: moduleIdArray})]
		})
	}));
}

function compileMinified(modules, options) {
	var toplevel, loader, innerScope, compressor, source;

	utils.removeDuplicates(modules); // make sure items do not repeat (might happen when modules is constructed manually)

	if (options.outputMinified) {
		modules.forEach(function(module) {
			toplevel = UglifyJS.parse(module.source, {
				filename: module.filePath,
				toplevel: toplevel
			});
		});

		mangleModuleIds(toplevel.body);
		exposeModules(toplevel.body, getPublicModules(modules));

		// Inject code into loader
		loader = UglifyJS.parse(utils.getFileContents(path.join(__dirname, "AmdInlineLoader.js")));
		innerScope = loader.body[0].body.expression.body;
		innerScope.splice(-1);
		toplevel.body.forEach(function(stmt) {
			innerScope.push(stmt);
		});
		toplevel = loader;
		toplevel.figure_out_scope();

		// Compress and mangle
		if (options.compress) {
			compressor = UglifyJS.Compressor({unused: false}); // TODO: Fix this
			toplevel = toplevel.transform(compressor);
			toplevel.figure_out_scope();
			toplevel.compute_char_frequency();
			toplevel.mangle_names();
		}

		source = toplevel.print_to_string({ascii_only: true, beautify: false});

		if (options.version && options.releaseDate) {
			source = "// " + options.version + " (" + (options.releaseDate) + ")\n" + source;
		}

		if (options.verbose) {
			console.log("Writing minified version output to: " + utils.toUnixPath(options.outputMinified));
		}

		fs.writeFileSync(utils.createDirForFile(options.outputMinified), source);
	}
}

function compileSource(modules, options) {
	utils.removeDuplicates(modules); // make sure items do not repeat (might happen when modules is constructed manually)

	if (options.outputSource) {
		var source = "";
		var outFile = options.outputSource;

		// Generate source version
		modules.forEach(function(module) {
			source += "// Included from: " + module.filePath + "\n\n";

			// TODO: Maybe add specific module id:s only here
			if (options.instrument && shouldBeInstrumented(module.id, options)) {
				source += instrumentCode(module.filePath, module.source) + "\n\n";
			} else {
				source += module.source.trim() + "\n\n";
			}

			if (options.globalModules && options.globalModules[module.id]) {
				source += 'var ' + options.globalModules[module.id] + ' = modules["' + module.id + '"];\n\n';
			}
		});

		// Write expose call for public modules
		var publicModules = getPublicModules(modules);
		if (publicModules.length > 0) {
			var exposeCall = "expose([";

			publicModules.forEach(function(module, i) {
				exposeCall += (i > 0 ? ',' : '') + '"' + module.id + '"';
			});

			exposeCall += "]);";
			source += exposeCall;
		}

		var inlineLoaderSrc = utils.getFileContents(path.join(__dirname, "AmdInlineLoader.js"));
		source = inlineLoaderSrc.replace(/\s*\$code\(\);/g, function() {
			return "\n\n" + source.trim();
		});

		if (options.verbose) {
			console.log("Writing source version output to: " + utils.toUnixPath(options.outputSource));
		}

		if (options.version && options.releaseDate) {
			source = "// " + options.version + " (" + (options.releaseDate) + ")\n\n" + source;
		}

		fs.writeFileSync(utils.createDirForFile(options.outputSource), source);
	}
}

function compileDevelopment(modules, options) {
	var source = "";

	utils.removeDuplicates(modules); // make sure items do not repeat (might happen when modules is constructed manually)

	if (options.outputDev) {
		// Add expose call
		var publicModules = getPublicModules(modules);
		if (publicModules.length > 0) {
			source += "\n\texpose([";

			publicModules.forEach(function(module, i) {
				source += (i > 0 ? ',' : '') + '"' + module.id + '"';
			});

			source += "]);\n\n";
		}

		if (options.globalModules) {
			source += "\tglobals = " + JSON.stringify(options.globalModules) + ";\n\n";
		}

		// Generate source version
		modules.forEach(function(module) {
			if (fs.existsSync(module.filePath)) {
				source += "\tload('" + utils.toUnixPath(path.relative(path.dirname(options.outputDev), module.filePath)) + "');\n";
			} else if (module.source) {
				source += "\thtml += '<script type=\"text/javascript\">" + module.source.replace(/([\\\'\^])/g, "\\$1").replace(/([\n]+)/g, '\\n').replace(/([\t]+)/g, '\\t') + "</script>';\n";
				source += '\tmoduleCount++;\n';
			}
		});

		var inlineLoaderSrc = utils.getFileContents(path.join(__dirname, "AmdDevLoader.js"));
		inlineLoaderSrc = inlineLoaderSrc.replace(/\$fileName/g, function() {
			return path.basename(options.outputDev);
		});

		source += "\n\twriteScripts();";
		source = inlineLoaderSrc.replace(/\s*\$code\(\);/g, function() {
			return "\n\n\t" + source.trim();
		});

		if (options.hash) {
			source += '\n\n// $hash: ' + options.hash;
		}

		if (options.verbose) {
			console.log("Writing development version to: " + utils.toUnixPath(options.outputDev));
		}

		fs.writeFileSync(utils.createDirForFile(options.outputDev), source);
	}
}

function compileCoverage(modules, options) {
	compileSource(modules, utils.extend(options, {
		outputSource: options.outputCoverage,
		instrument: true
	}));
}

function generateHash(modules, options) {
	var hashData = '';

	modules.forEach(function(module) {
		hashData += module.filePath;
		hashData += utils.getFileModTime(module.filePath);
	});

	hashData += JSON.stringify(options);

	return crypto.createHash('md5').update(hashData).digest("hex");
}

function parseHash(scriptFile) {
	if (fs.existsSync(scriptFile)) {
		var matches = /\$hash: ([a-z0-9]+)$/.exec(utils.getFileContents(scriptFile));

		if (matches) {
			return matches[1];
		}
	}
}

/**
 * Compile functions to be used by build scripts/cli.
 *
 * Usage:
 *  AmdCompiler.compile({
 *     from: "js/namespace/Class.js",
 *     baseDir: "js",
 *     outputSource: "mylib.js",
 *     outputMinified: "mylib.min.js",
 *     outputDev: "mylib.dev.js"
 *  });
 */
function compile(options) {
	var modules, currentHash, previousHash;

	modules = parseModules(options);
	currentHash = options.hash = generateHash(modules, options);
	previousHash = parseHash(options.outputDev);

	if (options.force || currentHash != previousHash) {
		compileMinified(modules, options);
		compileSource(modules, options);
		compileDevelopment(modules, options);
		compileCoverage(modules, options);
	}
}

exports.compile = compile;
exports.parseModules = parseModules;
exports.compileMinified = compileMinified;
exports.compileSource = compileSource;
exports.compileDevelopment = compileDevelopment;
exports.compileCoverage = compileCoverage;
