/**
 * firebug lite <http://www.getfirebug.com/lite.html>
 * v1.0
 * 04.11.2008, 8:25 PM ~ 
 * v1.0a
 * 03.27.2008, 5:44 AM ~ 04.01.2008, 21:32 PM
 * Azer Koçulu <http://azer.kodfabrik.com>
 */

var firebug = {
	env:{ "cache":{}, "ctmp":[], "dIndex":"console", "init":false, "ml":false, "objCn":[] },
	init:function(){
		firebug.el = {}; // elements
		firebug.el.content = {};
		with(firebug){
			
			document.documentElement.childNodes[0].appendChild(
				new pi.element("link").attribute.set("rel","stylesheet").attribute.set("href","http://firebuglite.appspot.com/firebug-lite.css").environment.getElement()
			);

			/* 
			 * main interface
			 */
			el.main = new pi.element("DIV").attribute.set("id","Firebug").environment.addStyle({ "width":pi.util.GetWindowSize().width+"px" }).insert(document.body);
			el.header = new pi.element("DIV").attribute.addClass("Header").insert(el.main);
			el.left = {};
			el.left.container = new pi.element("DIV").attribute.addClass("Left").insert(el.main);
			el.right = {};
			el.right.container = new pi.element("DIV").attribute.addClass("Right").insert(el.main);
			el.main.child.add(new pi.element("DIV").environment.addStyle({ "clear":"both" }));
			
			/*
			 * buttons
			 */
			el.button = {};
			el.button.container = new pi.element("DIV").attribute.addClass("ButtonContainer").insert(el.header);
			el.button.logo = new pi.element("A").attribute.set("title","Firebug Lite").attribute.set("target","_blank").attribute.set("href","http://getfirebug.com/lite.html").update("&nbsp;").attribute.addClass("Button Logo").insert(el.button.container);
			el.button.inspect = new pi.element("A").attribute.addClass("Button").event.addListener("click",d.inspector.toggle).update("Inspect").insert(el.button.container);
			el.button.maximize = new pi.element("A").attribute.addClass("Button Maximize").event.addListener("click",win.maximize).insert(el.button.container);
			el.button.minimize = new pi.element("A").attribute.addClass("Button Minimize").event.addListener("click",win.minimize).insert(el.button.container);
			el.button.close = new pi.element("A").attribute.addClass("Button Close").event.addListener("click",win.close).insert(el.button.container);;
			
			if(pi.env.ie||pi.env.webkit){
				el.button.container.environment.addStyle({ "paddingTop":"12px" });
			}
			
			/*
			 * navigation
			 */
			el.nav = {};
			el.nav.container = new pi.element("DIV").attribute.addClass("Nav").insert(el.left.container);
			el.nav.console = new pi.element("A").attribute.addClass("Tab Selected").event.addListener("click",d.navigate.curry(window,"console")).update("Console").insert(el.nav.container);
			el.nav.html = new pi.element("A").attribute.addClass("Tab").update("HTML").event.addListener("click",d.navigate.curry(window,"html")).insert(el.nav.container);
			el.nav.css = new pi.element("A").attribute.addClass("Tab").update("CSS").event.addListener("click",d.navigate.curry(window,"css")).insert(el.nav.container);
			el.nav.scripts = new pi.element("A").attribute.addClass("Tab").update("Script").event.addListener("click",d.navigate.curry(window,"scripts")).insert(el.nav.container);
			el.nav.dom = new pi.element("A").attribute.addClass("Tab").update("DOM").event.addListener("click",d.navigate.curry(window,"dom")).insert(el.nav.container);
			el.nav.xhr = new pi.element("A").attribute.addClass("Tab").update("XHR").event.addListener("click",d.navigate.curry(window,"xhr")).insert(el.nav.container);
			
			/*
			 * inspector
			 */
			
			el.borderInspector = new pi.element("DIV").attribute.set("id","FirebugBorderInspector").event.addListener("click",listen.inspector).insert(document.body);
			el.bgInspector = new pi.element("DIV").attribute.set("id","FirebugBGInspector").insert(document.body);
			
			/*
			 * console
			 */
			el.left.console = {};
			el.left.console.container = new pi.element("DIV").attribute.addClass("Console").insert(el.left.container);
			el.left.console.mlButton = new pi.element("A").attribute.addClass("MLButton").event.addListener("click",d.console.toggleML).insert(el.left.console.container);
			el.left.console.monitor = new pi.element("DIV").insert(
				new pi.element("DIV").attribute.addClass("Monitor").insert(el.left.console.container)
			);
			el.left.console.container.child.add(
				new pi.element("DIV").attribute.addClass("InputArrow").update(">>>")
			);
			el.left.console.input = new pi.element("INPUT").attribute.set("type","text").attribute.addClass("Input").event.addListener("keydown",listen.consoleTextbox).insert(
				new pi.element("DIV").attribute.addClass("InputContainer").insert(el.left.console.container)
			);
			
			el.right.console = {};
			el.right.console.container = new pi.element("DIV").attribute.addClass("Console Container").insert(el.right.container);
			el.right.console.mlButton = new pi.element("A").attribute.addClass("MLButton CloseML").event.addListener("click",d.console.toggleML).insert(el.right.console.container);
			el.right.console.input = new pi.element("TEXTAREA").attribute.addClass("Input").insert(el.right.console.container);
			el.right.console.run = new pi.element("A").attribute.addClass("Button").event.addListener("click",listen.runMultiline).update("Run").insert(el.right.console.container);
			
			el.right.console.clear = new pi.element("A").attribute.addClass("Button").event.addListener("click",d.clean.curry(window,el.right.console.input)).update("Clear").insert(el.right.console.container);
			
			el.button.console = {};
			el.button.console.container = new pi.element("DIV").attribute.addClass("ButtonSet").insert(el.button.container);
			el.button.console.clear = new pi.element("A").attribute.addClass("Button").event.addListener("click",d.clean.curry(window,el.left.console.monitor)).update("Clear").insert(el.button.console.container);
			
			/*
			 * html
			 */
			
			el.left.html = {};
			el.left.html.container = new pi.element("DIV").attribute.addClass("HTML").insert(el.left.container);
			
			el.right.html = {};
			el.right.html.container = new pi.element("DIV").attribute.addClass("HTML Container").insert(el.right.container);
			
			el.right.html.nav = {};
			el.right.html.nav.container = new pi.element("DIV").attribute.addClass("Nav").insert(el.right.html.container);
			el.right.html.nav.computedStyle = new pi.element("A").attribute.addClass("Tab Selected").event.addListener("click",d.html.navigate.curry(firebug,"computedStyle")).update("Computed Style").insert(el.right.html.nav.container);
			if(!pi.env.ie6)
				el.right.html.nav.dom = new pi.element("A").attribute.addClass("Tab").event.addListener("click",d.html.navigate.curry(firebug,"dom")).update("DOM").insert(el.right.html.nav.container);
			
			el.right.html.content = new pi.element("DIV").attribute.addClass("Content").insert(el.right.html.container);
			
			el.button.html = {};
			el.button.html.container = new pi.element("DIV").attribute.addClass("ButtonSet HTML").insert(el.button.container);
			
			/*
			 * css
			 */
			
			el.left.css = {};
			el.left.css.container = new pi.element("DIV").attribute.addClass("CSS").insert(el.left.container);
			
			el.right.css = {};
			el.right.css.container = new pi.element("DIV").attribute.addClass("CSS Container").insert(el.right.container);
			
			el.right.css.nav = {};
			el.right.css.nav.container = new pi.element("DIV").attribute.addClass("Nav").insert(el.right.css.container);
			el.right.css.nav.runCSS = new pi.element("A").attribute.addClass("Tab Selected").update("Run CSS").insert(el.right.css.nav.container);
	
			el.right.css.mlButton = new pi.element("A").attribute.addClass("MLButton CloseML").event.addListener("click",d.console.toggleML).insert(el.right.css.container);
			el.right.css.input = new pi.element("TEXTAREA").attribute.addClass("Input").insert(el.right.css.container);
			el.right.css.run = new pi.element("A").attribute.addClass("Button").event.addListener("click",listen.runCSS).update("Run").insert(el.right.css.container);
			el.right.css.clear = new pi.element("A").attribute.addClass("Button").event.addListener("click",d.clean.curry(window,el.right.css.input)).update("Clear").insert(el.right.css.container);
			
			el.button.css = {};
			el.button.css.container = new pi.element("DIV").attribute.addClass("ButtonSet CSS").insert(el.button.container);
			el.button.css.selectbox = new pi.element("SELECT").event.addListener("change",listen.cssSelectbox).insert(el.button.css.container);
		
			/*
			 * scripts
			 */
			
			el.left.scripts = {};
			el.left.scripts.container = new pi.element("DIV").attribute.addClass("Scripts").insert(el.left.container);
			
			el.right.scripts = {};
			el.right.scripts.container = new pi.element("DIV").attribute.addClass("Scripts Container").insert(el.right.container);
			
			el.button.scripts = {};
			el.button.scripts.container = new pi.element("DIV").attribute.addClass("ButtonSet Scripts").insert(el.button.container);
			el.button.scripts.selectbox = new pi.element("SELECT").event.addListener("change",listen.scriptsSelectbox).insert(el.button.scripts.container);
			el.button.scripts.lineNumbers = new pi.element("A").attribute.addClass("Button").event.addListener("click",d.scripts.toggleLineNumbers).update("Show Line Numbers").insert(el.button.scripts.container);
			
			/*
			 * dom
			 */
			
			el.left.dom = {};
			el.left.dom.container = new pi.element("DIV").attribute.addClass("DOM").insert(el.left.container);
			
			el.right.dom = {};
			el.right.dom.container = new pi.element("DIV").attribute.addClass("DOM Container").insert(el.right.container);
			
			el.button.dom = {};
			el.button.dom.container = new pi.element("DIV").attribute.addClass("ButtonSet DOM").insert(el.button.container);
			el.button.dom.label = new pi.element("LABEL").update("Object Path:").insert(el.button.dom.container);
			el.button.dom.textbox = new pi.element("INPUT").event.addListener("keydown",listen.domTextbox).update("window").insert(el.button.dom.container);
			
			/*
			 * str
			 */
			
			el.left.str = {};
			el.left.str.container = new pi.element("DIV").attribute.addClass("STR").insert(el.left.container);
			
			el.right.str = {};
			el.right.str.container = new pi.element("DIV").attribute.addClass("STR").insert(el.left.container);
			
			el.button.str = {};
			el.button.str.container = new pi.element("DIV").attribute.addClass("ButtonSet XHR").insert(el.button.container);
			el.button.str.watch = new pi.element("A").attribute.addClass("Button").event.addListener("click",d.navigate.curry(window,"xhr")).update("Back").insert(el.button.str.container);

			/*
			 * xhr
			 */
			
			el.left.xhr = {};
			el.left.xhr.container = new pi.element("DIV").attribute.addClass("XHR").insert(el.left.container);
			
			el.right.xhr = {};
			el.right.xhr.container = new pi.element("DIV").attribute.addClass("XHR").insert(el.left.container);
			
			
			el.button.xhr = {};
			el.button.xhr.container = new pi.element("DIV").attribute.addClass("ButtonSet XHR").insert(el.button.container);
			el.button.xhr.label = new pi.element("LABEL").update("XHR Path:").insert(el.button.xhr.container);
			el.button.xhr.textbox = new pi.element("INPUT").event.addListener("keydown",listen.xhrTextbox).insert(el.button.xhr.container);
			el.button.xhr.watch = new pi.element("A").attribute.addClass("Button").event.addListener("click",listen.addXhrObject).update("Watch").insert(el.button.xhr.container);
			
			// fix ie6 a:hover bug
			if(pi.env.ie6)
			{
				var buttons = [
					el.button.inspect,
					el.button.close,
					el.button.inspect,
					el.button.console.clear,
					el.right.console.run,
					el.right.console.clear,
					el.right.css.run,
					el.right.css.clear
				];
				for(var i=0; i<buttons.length; i++)
					buttons[i].attribute.set("href","#");
			}
			//
			
			env.init = true;
			
			for(var i=0; i<env.ctmp.length; i++)
			{
				d.console.log.apply(window,env.ctmp[i]);
			}
		}	
	},
	win:{
		close:function(){
			with(firebug){
				el.main.update("");
				el.main.remove();
			}
		},
		minimize:function(){
			with(firebug){
				el.main.environment.addStyle({ "height":"35px" });
				el.button.maximize.environment.addStyle({ "display":"block" });
				el.button.minimize.environment.addStyle({ "display":"none" });
				d.refreshSize();
			}
		},
		maximize:function(){
			with(firebug){
				el.main.environment.addStyle({ "height":"295px" });
				el.button.minimize.environment.addStyle({ "display":"block" });
				el.button.maximize.environment.addStyle({ "display":"none" });
				d.refreshSize();
			}
		}
	},
	watchXHR:function(){
		with(firebug){
			d.xhr.addObject.apply(window,arguments);
			if(env.dIndex!="xhr"){
				d.navigate("xhr");
			}
		}
	},
	d: {
		clean:function(_element){
			with(firebug){
				_element.update("");
			}
		},
		console:{
			dir:function(_value){
				with(firebug){
					d.console.addLine().attribute.addClass("Arrow").update(">>> console.dir("+_value+")");
					d.dom.open(_value,d.console.addLine());
				}
			},
			addLine:function(){
				with (firebug) {
					return new pi.element("DIV").attribute.addClass("Row").insert(el.left.console.monitor);
				}
			},
			openObject:function(_index){
				with (firebug) {
					d.dom.open(env.objCn[_index], el.left.dom.container, pi.env.ie);
					d.navigate("dom");
				}
			},
			historyIndex:0,
			history:[],
			log:function(_values){
				with (firebug) {
					if(env.init==false){
						env.ctmp.push(arguments);
						return;
					}
					
					var value = "";
					for(var i=0; i<arguments.length; i++){
						value += (i>0?" ":"")+d.highlight(arguments[i],false,false,true);
					}
					
					d.console.addLine().update(value);
					d.console.scroll();
					
				}
			},
			print: function(_cmd,_text){
				with (firebug){
					d.console.addLine().attribute.addClass("Arrow").update(">>> "+_cmd);
					d.console.addLine().update(d.highlight(_text,false,false,true));
					d.console.scroll();
					d.console.historyIndex = d.console.history.push(_cmd);
				}
			},
			run:function(cmd){
				with(firebug){
					if(cmd.length==0)return;
					el.left.console.input.environment.getElement().value = "";
					try { 
						var result = eval.call(window,cmd);
						d.console.print(cmd,result);
					} catch(e){
						d.console.addLine().attribute.addClass("Arrow").update(">>> "+cmd);
						if(!pi.env.ff){
							d.console.scroll();
							return d.console.addLine().attribute.addClass("Error").update("<strong>Error: </strong>"+(e.description||e),true);
						}
						if(e.fileName==null){
							d.console.addLine().attribute.addClass("Error").update("<strong>Error: </strong>"+e.message,true);
						}
						var fileName = e.fileName.split("\/").getLastItem();
						d.console.addLine().attribute.addClass("Error").update("<strong>Error: </strong>"+e.message+" (<em>"+fileName+"</em>,"+e.lineNumber+")",true);
						d.console.scroll();
					}
					d.console.scroll();
				} 
			},
			scroll:function(){
				with(firebug){
					el.left.console.monitor.environment.getElement().parentNode.scrollTop = Math.abs(el.left.console.monitor.environment.getSize().offsetHeight-200);
				}
			},
			toggleML:function(){
				with(firebug){
					var open = !env.ml;
					env.ml = !env.ml;
					d.navigateRightColumn("console",open);
					el[open?"left":"right"].console.mlButton.environment.addStyle({ display:"none" });
					el[!open?"left":"right"].console.mlButton.environment.addStyle({ display:"block" });
					el.left.console.monitor.environment.addStyle({ "height":(open?233:210)+"px" });
					el.left.console.mlButton.attribute[(open?"add":"remove")+"Class"]("CloseML");
				}
			}
		},
		css:{
			index:-1,
			open:function(_index){
				with (firebug) {
					var item = document.styleSheets[_index];
					var uri = item.href;
					if(uri.indexOf("http:\/\/")>-1&&getDomain(uri)!=document.domain){
						el.left.css.container.update("<em>Access to restricted URI denied</em>");
						return;
					}
					var rules = item[pi.env.ie ? "rules" : "cssRules"];
					var str = "";
					for (var i=0; i<rules.length; i++) {
						var item = rules[i];
						var selector = item.selectorText;
						var cssText = pi.env.ie?item.style.cssText:item.cssText.match(/\{(.*)\}/)[1];
						str+=d.css.printRule(selector, cssText.split(";"), el.left.css.container);
					}
					el.left.css.container.update(str);
				}
			},
			printRule:function(_selector,_css,_layer){
				with(firebug){
					var str = "<div class='Selector'>"+_selector+" {</div>";
					for(var i=0; i<_css.length; i++){
						var item = _css[i];
						str += "<div class='CSSText'>"+item.replace(/(.+\:)(.+)/,"<span class='CSSProperty'>$1</span><span class='CSSValue'>$2;</span>")+"</div>";
					}
					str+="<div class='Selector'>}</div>";
					return str;
				}
			},
			refresh:function(){
				with(firebug){
					el.button.css.selectbox.update("");
					var collection = document.styleSheets;
					for(var i=0; i<collection.length; i++){
						var uri = collection[i].href;
						d.css.index=d.css.index<0?i:d.css.index;
						el.button.css.selectbox.child.add(
							new pi.element("OPTION").attribute.set("value",i).update(uri)
						)
					};
					d.css.open(d.css.index);
				}
			}
		},
		dom: {
			open: function(_object,_layer){
				with (firebug) {
					_layer.clean();
					var container = new pi.element("DIV").attribute.addClass("DOMContent").insert(_layer);
					d.dom.print(_object, container);
				}
			},
			print:function(_object,_parent, _inTree){
				with (firebug) {
					var obj = _object || window, parentElement = _parent;
					parentElement.update("");
					
					if(parentElement.opened&&parentElement!=el.left.dom.container){
						parentElement.environment.getParent().pi.child.get()[0].pi.child.get()[0].pi.attribute.removeClass("Opened");
						parentElement.opened = false;
						parentElement.environment.addStyle({ "display":"none" });
						return;
					}
					if(_inTree)
						parentElement.environment.getParent().pi.child.get()[0].pi.child.get()[0].pi.attribute.addClass("Opened");
					parentElement.opened = true;
					
					for (var key in obj) {
						try { 
	
							var value = obj[key], property = key, container = new pi.element("DIV").attribute.addClass("DOMRow").insert(parentElement),
							left = new pi.element("DIV").attribute.addClass("DOMRowLeft").insert(container), right = new pi.element("DIV").attribute.addClass("DOMRowRight").insert(container);
							
							container.child.add(
								new pi.element("DIV").environment.addStyle({ "clear":"both" })
							);
							
							var link = new pi.element("A").attribute.addClass(
								typeof value=="object"&&Boolean(value)?"Property Object":"Property"
							).update(property).insert(left);
							
							right.update(
								d.highlight(value,false,true)
							);
							
							var subContainer = new pi.element("DIV").attribute.addClass("DOMRowSubContainer").insert(container);
							
							if(typeof value!="object"||Boolean(value)==false)
								continue;
							
							link.event.addListener("click",d.dom.print.curry(window,value, subContainer, true));
						}catch(e){
						}
					}
					parentElement.environment.addStyle({ "display":"block" });
				}
			}
		},
		highlight:function(_value,_inObject,_inArray,_link){
			with(firebug){
				var isArray = false, isElement = false;
				try {
					isArray = pi.util.IsArray(_value);
					isElement = _value!=undefined&&Boolean(_value.nodeName)&&Boolean(_value.nodeType);
				}catch(e){};
				
				// number, string, boolean, null, function
				if(_value==null||["boolean","function","number","string"].indexOf(typeof _value)>-1){
					// NULL
					if(_value==null){
						return  "<span class='Null'>null</span>";
					}
					
					// BOOLEAN & NUMBER
					if (["boolean", "number"].indexOf(typeof _value) > -1) {
						return "<span class='DarkBlue'>" + _value + "</span>";
					}
					
					// FUNCTION
					if(typeof _value=="function"){
						return "<span class='"+(_inObject?"Italic Gray":"Green")+"'>function()</span>";
					}
					
					// STRING
					return "<span class='Red'>\""+( !_inObject&&!_inArray?_value : _value.substring(0,35) ).replace(/\n/g,"\\n").replace(/\s/g,"&nbsp;").replace(/>/g,"&#62;").replace(/</g,"&#60;")+"\"</span>";
				}
				// element 
				else if(isElement){
					if(_value.nodeType==3)return d.highlight(_value.nodeValue);
					
					if(_inArray||_inObject){
						var result = "<span class='Blue'>"+_value.nodeName.toLowerCase();
						if(_value.getAttribute&&_value.getAttribute("id"))result += "<span class='DarkBlue'>#"+_value.getAttribute("id")+"</span>";
						var elClass = _value.getAttribute?_value.getAttribute(pi.env.ie?"className":"class"):"";
						if(elClass)result += "<span class='Red'>."+elClass.split(" ")[0]+"</span>";
						return result+"</span>";
					}
					
					var result = "<span class='Blue'>&#60;"+_value.nodeName.toLowerCase()+"";
					if(_value.attributes)
					for(var i=0; i<_value.attributes.length; i++){
						var item = _value.attributes[i];
						if(pi.env.ie&&Boolean(item.nodeValue)==false)continue;
						result += " <span class='DarkBlue'>"+item.nodeName+"=\"<span class='Red'>"+item.nodeValue+"</span>\"</span>";
					}
					result += "&#62;</span>";
					return result;
				}
				// array & object
				else if(isArray||["object","array"].indexOf(typeof _value)>-1){
					var result = "";
					if(isArray||_value instanceof Array){
						if(_inObject)return "<span class='Gray Italic'>["+_value.length+"]</span>";
						result += "<span class='Strong'>[ ";
		
						for(var i=0; i<_value.length; i++){
							if((_inObject||_inArray)&&pi.env.ie&&i>3)break;
							result += (i > 0 ? ", " : "") + d.highlight(_value[i], false, true, true);
						}
						result += " ]</span>";
						return result;
					}
					if(_inObject)return "<span class='Gray Italic'>Object</span>";
					result += "<span class='Strong Green"+ ( !_link?"'":" ObjectLink' onmouseover='this.className=this.className.replace(\"ObjectLink\",\"ObjectLinkHover\")' onmouseout='this.className=this.className.replace(\"ObjectLinkHover\",\"ObjectLink\")' onclick='firebug.d.console.openObject(" +( env.objCn.push( _value ) -1 )+")'" ) + ">Object";
					var i=0;
					for(var key in _value){
							var value = _value[key];
							if((_inObject||_inArray)&&pi.env.ie&&i>3)
								break;
							result += " "+key+"="+d.highlight(value,true);
							i++;
					};
					result += "</span>";
					return result;
				} else {
					if(_inObject)
						return "<span class='Gray Italic'>"+_value+"</span>";
					return _value;
				}
				
			}
		},
		html:{
			nIndex:"computedStyle",
			current:null,
			highlight:function(_element,_clear,_event){
				with(firebug){
					if(_clear){
						el.bgInspector.environment.addStyle({ "display":"none" });
						return;
					}
					d.inspector.inspect(_element,true);
				}
			},
			inspect:function(_element){
				var el = _element, map = [], parent = _element;
				while(parent){
					map.push(parent);
					if(parent==document.body)break;
					parent = parent.parentNode;
				}
				map = map.reverse();
				with(firebug){
					d.inspector.toggle();
					var parentLayer = el.left.html.container.child.get()[1].childNodes[1].pi;
					for(var t=0; map[t];){
						if(t==map.length-1){
							
							var link = parentLayer.environment.getElement().previousSibling.pi;
							link.attribute.addClass("Selected");
							
							if(d.html.current)d.html.current[1].attribute.removeClass("Selected");
							
							d.html.current = [_element,link];
							
							return;t
						}
						parentLayer = d.html.openHtmlTree(map[t],parentLayer,map[t+1]);
						t++;
					}
				}
			},
			navigate:function(_index,_element){
				with(firebug){
					el.right.html.nav[d.html.nIndex].attribute.removeClass("Selected");
					el.right.html.nav[_index].attribute.addClass("Selected");
					d.html.nIndex = _index;
					d.html.openProperties();
					
				}
			},
			openHtmlTree:function(_element,_parent,_returnParentElementByElement,_event){
				with(firebug){
					var element = _element || document.documentElement, 
						parent = _parent || el.left.html.container, 
						returnParentEl = _returnParentElementByElement || null, 
						returnParentVal = null;	
				
					if(parent!=el.left.html.container){
						var nodeLink = parent.environment.getParent().pi.child.get()[0].pi;
						if(d.html.current)d.html.current[1].attribute.removeClass("Selected");
						nodeLink.attribute.addClass("Selected");
						
						d.html.current = [_element,nodeLink];
						d.html.openProperties();
					}
					
					if(element.childNodes&&(element.childNodes.length==0||(element.childNodes.length==1&&element.childNodes[0].nodeType==3)))return;
					parent.clean();

					if(parent.opened&&Boolean(_returnParentElementByElement)==false){
						parent.opened = false;
						parent.environment.getParent().pi.child.get()[0].pi.attribute.removeClass("Open");
						return;
					}
					if (parent != el.left.html.container) {
						parent.environment.getParent().pi.child.get()[0].pi.attribute.addClass("Open");
						parent.opened = true;
						
					}
					
					for(var i=0; i<element.childNodes.length; i++){
						var item = element.childNodes[i];
						
						if(item.nodeType==3)continue;
						var container = new pi.element().attribute.addClass("Block").insert(parent);
						var link = new pi.element("A").attribute.addClass("Link").update(d.highlight(item)).insert(container);
						var subContainer = new pi.element("DIV").attribute.addClass("SubContainer").insert(container);
						link.event.addListener("click",d.html.openHtmlTree.curry(window,item,subContainer,false));
						link.event.addListener("mouseover",d.html.highlight.curry(window,item, false));
						link.event.addListener("mouseout",d.html.highlight.curry(window,item,true));
						
						returnParentVal = returnParentEl==item?subContainer:returnParentVal;
						
						if(d.html.current==null&&item==document.body){
							link.attribute.addClass("Selected");
							d.html.current = [item,link];
							d.html.openHtmlTree(item,subContainer);
						}
						
						if(item.childNodes&&item.childNodes.length==1&&item.childNodes[0].nodeType==3){
							link.child.get()[0].appendChild(document.createTextNode(item.childNodes[0].nodeValue.substring(0,100)));
							link.child.get()[0].appendChild(document.createTextNode("</"));
							link.child.get()[0].appendChild(new pi.element("span").attribute.addClass("Blue").update(item.nodeName.toLowerCase()).environment.getElement());
							link.child.get()[0].appendChild(document.createTextNode(">"));
							continue;
						}
						else if(item.childNodes&&item.childNodes.length==0)continue;
						link.attribute.addClass("ParentLink");
						
					}
					return returnParentVal;
				}
			},
			openProperties:function(){
				with(firebug){
			
					var index = d.html.nIndex;
					var node = d.html.current[0];
					d.clean(el.right.html.content);
					var str = "";
					switch(index){
						case "computedStyle":
							var property = ["opacity","filter","azimuth","background","backgroundAttachment","backgroundColor","backgroundImage","backgroundPosition","backgroundRepeat","border","borderCollapse","borderColor","borderSpacing","borderStyle","borderTop","borderRight","borderBottom","borderLeft","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","borderTopStyle","borderRightStyle","borderBottomStyle","borderLeftStyle","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth","borderWidth","bottom","captionSide","clear","clip","color","content","counterIncrement","counterReset","cue","cueAfter","cueBefore","cursor","direction","display","elevation","emptyCells","cssFloat","font","fontFamily","fontSize","fontSizeAdjust","fontStretch","fontStyle","fontVariant","fontWeight","height","left","letterSpacing","lineHeight","listStyle","listStyleImage","listStylePosition","listStyleType","margin","marginTop","marginRight","marginBottom","marginLeft","markerOffset","marks","maxHeight","maxWidth","minHeight","minWidth","orphans","outline","outlineColor","outlineStyle","outlineWidth","overflow","padding","paddingTop","paddingRight","paddingBottom","paddingLeft","page","pageBreakAfter","pageBreakBefore","pageBreakInside","pause","pauseAfter","pauseBefore","pitch","pitchRange","playDuring","position","quotes","richness","right","size","speak","speakHeader","speakNumeral","speakPunctuation","speechRate","stress","tableLayout","textAlign","textDecoration","textIndent","textShadow","textTransform","top","unicodeBidi","verticalAlign","visibility","voiceFamily","volume","whiteSpace","widows","width","wordSpacing","zIndex"].sort();
							var view = document.defaultView?document.defaultView.getComputedStyle(node,null):node.currentStyle;
							for(var i=0; i<property.length; i++){
								var item = property[i];
								if(!view[item])continue;
								str+="<div class='CSSItem'><div class='CSSProperty'>"+item+"</div><div class='CSSValue'>"+d.highlight(view[item])+"</div></div>";
							}
							el.right.html.content.update(str);
							break;
						case "dom":
							d.dom.open(node,el.right.html.content,pi.env.ie);
							break;
					}
				}
			}
		},
		inspector:{
			enabled:false,
			el:null,
			inspect:function(_element,_bgInspector){
				var el = _element, top = el.offsetTop, left = el.offsetLeft, parent = _element.offsetParent;
				while(Boolean(parent)&&parent!=document.firstChild){
					top += parent.offsetTop;
					left += parent.offsetLeft;
					parent = parent.offsetParent;
					if(parent==document.body)break;
				};
				
				with(firebug){
					el[_bgInspector?"bgInspector":"borderInspector"].environment.addStyle({ 
						"width":_element.offsetWidth+"px", "height":_element.offsetHeight+"px",
						"top":top-(_bgInspector?0:2)+"px", "left":left-(_bgInspector?0:2)+"px",
						"display":"block"
					});

					if(!_bgInspector){
						d.inspector.el = _element;
					}
				};
			},
			toggle:function(){
				with (firebug) {
					d.inspector.enabled = !d.inspector.enabled;
					el.button.inspect.attribute[(d.inspector.enabled ? "add" : "remove") + "Class"]("Enabled");
					if(d.inspector.enabled==false){
						el.borderInspector.environment.addStyle({ "display":"none" });
						d.inspector.el = null;
					} else if(pi.env.dIndex!="html") {
						d.navigate("html");
					}
				}
			}
		},
		scripts:{
			index:-1,
			lineNumbers:false,
			open:function(_index){
				with(firebug){
					d.scripts.index = _index;
					el.left.scripts.container.update("");
					var script = document.getElementsByTagName("script")[_index],uri = script.src||document.location.href,source;
					
					if(uri.indexOf("http:\/\/")>-1&&getDomain(uri)!=document.domain){
						el.left.scripts.container.update("<em>Access to restricted URI denied</em>");
						return;
					}
					
					if(uri!=document.location.href){
						source = env.cache[uri]||pi.xhr.get(uri).responseText;
						env.cache[uri] = source;
					} else
						source = script.innerHTML;
					source = source.replace(/\n|\t|<|>/g,function(_ch){
						return ({"<":"&#60;",">":"&#62;","\t":"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;","\n":"<br />"})[_ch];
					});
				
					if (!d.scripts.lineNumbers) 
						el.left.scripts.container.child.add(
							new pi.element("DIV").attribute.addClass("CodeContainer").update(source)
						);
					else {
						source = source.split("<br />");
						for (var i = 0; i < source.length; i++) {
							el.left.scripts.container.child.add(new pi.element("DIV").child.add(new pi.element("DIV").attribute.addClass("LineNumber").update(i + 1), new pi.element("DIV").attribute.addClass("Code").update("&nbsp;" + source[i]), new pi.element("DIV").environment.addStyle({
								"clear": "both"
							})));
						};
					};
				}
			},
			toggleLineNumbers:function(){
				with(firebug){
					d.scripts.lineNumbers = !d.scripts.lineNumbers;
					el.button.scripts.lineNumbers.attribute[(d.scripts.lineNumbers ? "add" : "remove") + "Class"]("Enabled");
					d.scripts.open( d.scripts.index );
					
				}	
			},
			refresh:function(){
				with(firebug){
					el.button.scripts.selectbox.clean();
					var collection = document.getElementsByTagName("script");
					for(var i=0; i<collection.length; i++){
						var item = collection[i];
						d.scripts.index=d.scripts.index<0?i:d.scripts.index;
						el.button.scripts.selectbox.child.add(
							new pi.element("OPTION").attribute.set("value",i).update(item.src||item.baseURI||"..")
						);
					}
					d.scripts.open( d.scripts.index );
				}
			}
		},
		str: {
			open:function(_str){
				with(firebug){
					d.navigate("str");
					el.left.str.container.update(_str.replace(/\n/g,"<br />"))
				}
			}
		},
		xhr:{
			objects:[],
			addObject:function(){
				with(firebug){
					for(var i=0; i<arguments.length; i++){
						try {
							var item = arguments[i];
							var val = eval(item);
							d.xhr.objects.push([
								item, val
							]);
						} catch(e){
							continue;
						}
					}
				}
			},
			open:function(){
				with(firebug){
					el.left.xhr.container.update("");
					el.left.xhr.name = new pi.element("DIV").attribute.addClass("BlockContent").insert(new pi.element("DIV").attribute.addClass("Block").environment.addStyle({ "width":"20%" }).insert(el.left.xhr.container));
					el.left.xhr.nameTitle = new pi.element("STRONG").update("Object Name:").insert(el.left.xhr.name);
					el.left.xhr.nameContent = new pi.element("DIV").insert(el.left.xhr.name);
					el.left.xhr.status = new pi.element("DIV").attribute.addClass("BlockContent").insert(new pi.element("DIV").attribute.addClass("Block").environment.addStyle({ "width":"10%" }).insert(el.left.xhr.container));
					el.left.xhr.statusTitle = new pi.element("STRONG").update("Status:").insert(el.left.xhr.status);
					el.left.xhr.statusContent = new pi.element("DIV").insert(el.left.xhr.status);
					el.left.xhr.readystate = new pi.element("DIV").attribute.addClass("BlockContent").insert(new pi.element("DIV").environment.addStyle({ "width":"15%" }).attribute.addClass("Block").insert(el.left.xhr.container));
					el.left.xhr.readystateTitle =el.left.xhr.nameTitle = new pi.element("STRONG").update("Ready State:").insert(el.left.xhr.readystate);
					el.left.xhr.readystateContent = new pi.element("DIV").insert(el.left.xhr.readystate);
					el.left.xhr.response = new pi.element("DIV").attribute.addClass("BlockContent").insert(new pi.element("DIV").environment.addStyle({ "width":(pi.env.ie?"50":"55")+"%" }).attribute.addClass("Block").insert(el.left.xhr.container));
					el.left.xhr.responseTitle = new pi.element("STRONG").update("Response:").insert(el.left.xhr.response);
					el.left.xhr.responseContent = new pi.element("DIV").insert(el.left.xhr.response);
					setTimeout(d.xhr.refresh,500);
				}
			},
			refresh:function(){
				with(firebug){
					el.left.xhr.nameContent.update("");
					el.left.xhr.statusContent.update("");
					el.left.xhr.readystateContent.update("");
					el.left.xhr.responseContent.update("");
					for(var i=0; i<d.xhr.objects.length; i++){
						var item = d.xhr.objects[i];
						var response = item[1].responseText;
						if(Boolean(item[1])==false)continue;
						el.left.xhr.nameContent.child.add(new pi.element("span").update(item[0]));
						try { 
							el.left.xhr.statusContent.child.add(new pi.element("span").update(item[1].status));
						} catch(e){ el.left.xhr.statusContent.child.add(new pi.element("span").update("&nbsp;")); }
						el.left.xhr.readystateContent.child.add(new pi.element("span").update(item[1].readyState));
						
						el.left.xhr.responseContent.child.add(new pi.element("span").child.add(
							new pi.element("A").event.addListener("click",d.str.open.curry(window,response)).update("&nbsp;"+response.substring(0,50))
						));
					};
					if(env.dIndex=="xhr")
						setTimeout(d.xhr.refresh,500);
				}
			}
		},
		navigateRightColumn:function(_index,_open){
			with(firebug){
				el.left.container.environment.addStyle({ "width":_open?"70%":"100%" });
				el.right.container.environment.addStyle({ "display":_open?"block":"none" });
			}
		},
		navigate:function(_index){
			with(firebug){
				
				var open = _index, close = env.dIndex;
				env.dIndex = open;
				
				el.button[close].container.environment.addStyle({ "display":"none" });
				el.left[close].container.environment.addStyle({ "display":"none" });
				el.right[close].container.environment.addStyle({ "display":"none" });
				
				el.button[open].container.environment.addStyle({ "display":"inline" });
				el.left[open].container.environment.addStyle({ "display":"block" });
				el.right[open].container.environment.addStyle({ "display":"block" });
				
				if(el.nav[close])
					el.nav[close].attribute.removeClass("Selected");
				if(el.nav[open])
					el.nav[open].attribute.addClass("Selected");
				
				switch(open){
					case "console":
						d.navigateRightColumn(_index);
						break;
					case "html":
						d.navigateRightColumn(_index,true);
						d.html.openHtmlTree();
						break;
					case "css":
						d.navigateRightColumn(_index,true);
						d.css.refresh();
						break;
					case "scripts":
						d.navigateRightColumn(_index);
						d.scripts.refresh();
						break;
					case "dom":
						d.navigateRightColumn(_index);
						if(el.left.dom.container.environment.getElement().innerHTML=="")
							d.dom.open(eval(el.button.dom.textbox.environment.getElement().value),el.left.dom.container);
						break;
					case "xhr":
						d.navigateRightColumn(_index);
						d.xhr.open();
						break;
				}
				
			}
		},
		refreshSize:function(){
			with(firebug){
				el.main.environment.addStyle({ "width":pi.util.GetWindowSize().width+"px"});
				if(pi.env.ie6)
					el.main.environment.addStyle({ "top":pi.util.GetWindowSize().height-el.main.environment.getSize().offsetHeight+"px" });
			}
		}
	},
	getDomain:function(_url){
		return _url.match(/http:\/\/(www.)?([\.\w]+)/)[2];
	},
	listen: {
		addXhrObject:function(){
			with(firebug){
				d.xhr.addObject.apply(window, el.button.xhr.textbox.environment.getElement().value.split(","));
			}
		},
		consoleTextbox:function(_event){
			with(firebug){
				if(_event.keyCode==13&&(env.multilinemode==false||_event.shiftKey==false)){
					d.console.historyIndex = d.console.history.length;
					d.console.run(el.left.console.input.environment.getElement().value);
					return false;
				}
				if([13,38,40].indexOf(_event.keyCode)==-1)
					return;
				d.console.historyIndex+=_event.keyCode!=40?0:d.console.historyIndex==d.console.history.length?0:1;
				d.console.historyIndex-=_event.keyCode!=38?0:d.console.historyIndex==0?0:1;
				el.left.console.input.update(
					d.console.history.length > d.console.historyIndex ?
					d.console.history[d.console.historyIndex] :
					""
				);
			}
		},
		cssSelectbox:function(){
			with(firebug){
				d.css.open(el.button.css.selectbox.environment.getElement().selectedIndex);
			}
		},
		domTextbox:function(_event){
			with(firebug){
				if(_event.keyCode==13){
					d.dom.open(eval(el.button.dom.textbox.environment.getElement().value),el.left.dom.container);
				}
			}
		},
		inspector:function(){
			with(firebug){
				d.html.inspect(d.inspector.el);
			}
		},
		keyboard:function(_event){
			with(firebug){
				if(_event.keyCode==27&&d.inspector.enabled)
					d.inspector.toggle();
			}
		},
		mouse:function(_event){
			with(firebug){
				var target = _event[pi.env.ie?"srcElement":"target"];
				if(
					d.inspector.enabled&&
					target!=document.body&&
					target!=document.firstChild&&
					target!=document.childNodes[1]&&
					target!=el.borderInspector.environment.getElement()&&
					target!=el.main.environment.getElement()&&
					target.offsetParent!=el.main.environment.getElement()
				)
				d.inspector.inspect(target);
			}
		},
		runMultiline:function(){
			with(firebug){
				d.console.run.call(window,el.right.console.input.environment.getElement().value);
			}
		},
		runCSS:function(){
			with(firebug){
				var source = el.right.css.input.environment.getElement().value.replace(/\n|\t/g,"").split("}");
				for(var i=0; i<source.length; i++){
					var item = source[i]+"}", rule = !pi.env.ie?item:item.split(/{|}/), collection = document.getElementsByTagName("style"),
					style = collection.length>0?collection[0]:document.body.appendChild( document.createElement("style") );
					if(!item.match(/.+\{.+\}/))continue;
					if(pi.env.ie)
						style.styleSheet.addRule(rule[0],rule[1]);
					else
						style.sheet.insertRule( rule, style.sheet.cssRules.length );
				}
			}
		},
		scriptsSelectbox:function(){
			with(firebug){
				d.scripts.open(parseInt(el.button.scripts.selectbox.environment.getElement().value));
			}
		},
		xhrTextbox:function(_event){
			with(firebug){
				if(_event.keyCode==13){
					d.xhr.addObject.apply(window, el.button.xhr.textbox.environment.getElement().value.split(","));
				}
			}
		}
	}
};

window.console = firebug.d.console;
pi.util.AddEvent(window,"resize",firebug.d.refreshSize);
pi.util.AddEvent(document,"mousemove",firebug.listen.mouse);
pi.util.AddEvent(document,"keydown",firebug.listen.keyboard);
pi.util.DOMContentLoaded.push(firebug.init);