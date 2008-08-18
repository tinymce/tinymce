(function(_scope){
	
	/*
	 * pi.js
	 * 1.0
	 * Azer Koçulu <http://azer.kodfabrik.com>
	 * http://pi-js.googlecode.com
	 */
	
	_scope.pi = Object(3.14159265358979323846);
	var pi  = _scope.pi;
	pi.version = 1.0;
	
	pi.env = {
		ie: /MSIE/i.test(navigator.userAgent),
		ie6: /MSIE 6/i.test(navigator.userAgent),
		ie7: /MSIE 7/i.test(navigator.userAgent),
		ie8: /MSIE 8/i.test(navigator.userAgent),
		firefox: /Firefox/i.test(navigator.userAgent),
		opera: /Opera/i.test(navigator.userAgent),
		webkit: /Webkit/i.test(navigator.userAgent)
	};
	
	pi.util = {
		IsArray:function(_object){
			return _object && _object != window && ( _object instanceof Array || ( typeof _object.length == "number" && typeof _object.item =="function" ) )
		},
		IsHash:function(_object){
			return _object && typeof _object=="object"&&(_object==window||_object instanceof Object)&&!_object.nodeName&&!pi.util.IsArray(_object)
		},
		DOMContentLoaded:[],
		AddEvent: function(_element,_eventName,_fn,_useCapture){
			_element[pi.env.ie.toggle("attachEvent","addEventListener")](pi.env.ie.toggle("on","")+_eventName,_fn,_useCapture||false);
			return pi.util.AddEvent.curry(this,_element);
		},
		RemoveEvent: function(_element,_eventName,_fn,_useCapture){
			return _element[pi.env.ie.toggle("detachEvent","removeEventListener")](pi.env.ie.toggle("on","")+_eventName,_fn,_useCapture||false);
		},
		GetWindowSize:function(){
			return {
				height:pi.env.ie?Math.max(document.documentElement.clientHeight,document.body.clientHeight):window.innerHeight,
				width:pi.env.ie?Math.max(document.documentElement.clientWidth,document.body.clientWidth):window.innerWidth
			}
		},
		Include:function(_url,_callback){
			var script = new pi.element("script").attribute.set("src",_url), callback = _callback||new Function, done = false, head = pi.get.byTag("head")[0];
			script.environment.getElement().onload = script.environment.getElement().onreadystatechange = function(){
				if(!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")){
					callback.call(this);
					done = true;
					head.removeChild(script.environment.getElement());
				}
			};
			script.insert(head);
		},
		Element:{
			addClass:function(_element,_class){
				if( !pi.util.Element.hasClass(_element,_class) )
					pi.util.Element.setClass(_element, pi.util.Element.getClass(_element) + " " + _class );
			},
			getClass:function(_element){
				return _element.getAttribute(pi.env.ie.toggle("className","class"))||"";
			},
			hasClass:function(_element,_class){
				return pi.util.Element.getClass(_element).split(" ").indexOf(_class)>-1;
			},
			removeClass:function(_element,_class){
				if( pi.util.Element.hasClass(_element,_class) )
					pi.util.Element.setClass(
						_element, 
						pi.util.Element.getClass(_element,_class).split(" ").removeValue(_class).join(" ")
					);
			},
			setClass:function(_element,_value){
				_element.setAttribute( pi.env.ie.toggle("className","class"), _value );
			},
			toggleClass:function(){
				if(pi.util.Element.hasClass.apply(this,arguments))
					pi.util.Element.removeClass.apply(this,arguments);
				else
					pi.util.Element.addClass.apply(this,arguments);
			},
			getOpacity:function(_styleObject){
				var styleObject = _styleObject;
				if(!pi.env.ie)
					return styleObject["opacity"];
					
				var alpha = styleObject["filter"].match(/opacity\=(\d+)/i);
				return alpha?alpha[1]/100:1;
			},
			setOpacity:function(_element,_value){
				if(!pi.env.ie)
					return pi.util.Element.addStyle(_element,{ "opacity":_value });
				_value*=100;
				pi.util.Element.addStyle(_element,{ "filter":"alpha(opacity="+_value+")" });
				return this._parent_;
			},
			getPosition:function(_element){
				var parent = _element,offsetLeft = 0, offsetTop = 0, view = pi.util.Element.getView(_element);
				while(parent&&parent!=document.body&&parent!=document.firstChild){
					offsetLeft +=parseInt(parent.offsetLeft);
					offsetTop += parseInt(parent.offsetTop);
					parent = parent.offsetParent;
				};
				return {
					"bottom":view["bottom"],
					"left":view["left"],
					"marginTop":view["marginTop"],
					"marginLeft":view["marginLeft"],
					"offsetLeft":offsetLeft,
					"offsetTop":offsetTop,
					"position":view["position"],
					"right":view["right"],
					"top":view["top"],
					"z-index":view["zIndex"]
				};
			},
			getSize:function(_element){
				var view = pi.util.Element.getView(_element);
				return {
					"height":view["height"],
					"offsetHeight":_element.offsetHeight,
					"offsetWidth":_element.offsetWidth,
					"width":view["width"]
				}
			},
			addStyle:function(_element,_style){
				for(var key in _style){
					key = key=="float"?pi.env.ie.toggle("styleFloat","cssFloat"):key;
					if (key == "opacity" && pi.env.ie) {
						pi.util.Element.setOpacity(_element,_style[key]);
						continue;
					}
					_element.style[key] = _style[key];
				}
			},
			getStyle:function(_element,_property){
				_property = _property=="float"?pi.env.ie.toggle("styleFloat","cssFloat"):_property;
				if(_property=="opacity"&&pi.env.ie)
					return pi.util.Element.getOpacity(_element.style);
				return typeof _property=="string"?_element.style[_property]:_element.style;
			},
			getView:function(_element,_property){
				var view = document.defaultView?document.defaultView.getComputedStyle(_element,null):_element.currentStyle;
				_property = _property=="float"?pi.env.ie.toggle("styleFloat","cssFloat"):_property;
				if(_property=="opacity"&&pi.env.ie)
					return pi.util.Element.getOpacity(_element,view);
				return typeof _property=="string"?view[_property]:view;
			}
		},
		CloneObject:function(_object,_fn){
			var tmp = {};
			for(var key in _object)
			{
				if( pi.util.IsArray( _object[key] ) ){
					tmp[key] = Array.prototype.clone.apply( _object[key] );
				} else
					if( pi.util.IsHash( _object[key] ) ){
						tmp[ key ] = pi.util.CloneObject(_object[key]);
						if(_fn)_fn.call(tmp,key,_object);
					} else
						tmp[key] = _object[key];
			}
			return tmp;
		},
		MergeObjects:function(_object,_source){
			for(var key in _source){
				var value = _source[key];
				if (pi.util.IsArray(_source[key])) {
					if(pi.util.IsArray( _object[key] )){
						Array.prototype.push.apply( _source[key], _object[key] )
					}
					else
						value = _source[key].clone();
				}
				else 
					if (pi.util.IsHash(_source[key])) {
						if (pi.util.IsHash(_object[key])) {
							value = pi.util.MergeObjects(_object[key], _source[key]);
						} else {
							value = pi.util.CloneObject( _source[key] );
						}
					}
				_object[key] = value;
			};
			return _object;
		}
	};
	
	pi.get = function(){
		return document.getElementById(arguments[0]);
	};
	pi.get.byTag = function(){
		return document.getElementsByTagName(arguments[0]);
	};
	pi.get.byClass = function(){ return document.getElementsByClassName.apply(document,arguments); };
	
	pi.base = function(){
		this.body = {};
		this.constructor = null;
		
		this.build = function(_skipClonning){
			var base = this, skipClonning = _skipClonning||false, _private = {},
				fn = function(){
					var _p = pi.util.CloneObject(_private);
					if(!skipClonning){
						for(var key in this){
							
							if(pi.util.IsArray( this[ key ] ) ){
								this[key] = Array.prototype.clone.apply( this[key] );
							} else
								if( pi.util.IsHash(this[key]) ){
									this[key] = pi.util.CloneObject( 
										this[ key ],
										function(_key,_object){
											this[ _key ]._parent_ = this;
										}
									);
									this[key]._parent_ = this;
								}
						}
					};
					base.createAccessors( _p, this );
					if(base.constructor)
						return base.constructor.apply(this,arguments);
					return this;
				};
			this.movePrivateMembers(this.body,_private);
			if(this.constructor){
				fn["$Constructor"] = this.constructor;
			}
			fn.prototype = this.body;
			return fn;
		};
		
		this.createAccessors = function(_p, _branch){
			var getter = function(_property){ return this[_property]; },
				setter = function(_property,_value){ this[_property] = _value; return _branch._parent_||_branch; };
	
			for (var name in _p) {
				var isPrivate = name.substring(0, 1) == "_", title = name.substring(1, 2).toUpperCase() + name.substring(2);
				if (isPrivate) {
					_branch["get" + title] = getter.curry(_p,name);
					_branch["set" + title] = setter.curry(_p,name);
				}
				else 
					if (pi.util.IsHash(_p[name])){
						if(!_branch[name])
							_branch[name] = {};
						this.createAccessors(_p[name], _branch[name]);
					}	
			};
		};
		
		this.movePrivateMembers = function(_object, _branch){
			for (var name in _object) {
				var isPrivate = name.substring(0, 1) == "_";
				
				if (isPrivate) {
					_branch[name] = _object[name];
					delete _object[name];
				}
				else 
					if (pi.util.IsHash(_object[name])){
						_branch[name] = {};
						this.movePrivateMembers(_object[name], _branch[name]);
					}
			};
		};
	};
	
	Function.prototype.extend = function(_prototype,_skipClonning){
		var object = new pi.base, superClass = this;
		if(_prototype["$Constructor"]){
			object.constructor = _prototype["$Constructor"];
			delete _prototype["$Constructor"];
		};
	
		object.body = superClass==pi.base?_prototype:pi.util.MergeObjects(_prototype,superClass.prototype,2);
		object.constructor=object.constructor||function(){
			if(superClass!=pi.base)
				superClass.apply(this,arguments);
		};
		
		return object.build(_skipClonning);
	};
	
	Function.prototype.curry = function(_scope){
		var fn = this, scope = _scope||window, args = Array.prototype.slice.call(arguments,1);
		return function(){ 
			return fn.apply(scope,args.concat( Array.prototype.slice.call(arguments,0) )); 
		};
	};
	
	pi.element = pi.base.extend({
		"$Constructor":function(_tag){
			this.environment.setElement(document.createElement(_tag||"DIV"));
			this.environment.getElement().pi = this;
			return this;
		},
		"clean":function(){
			var childs = this.child.get();
			while(childs.length){
				childs[0].parentNode.removeChild(childs[0]);
			}
		},
		"clone":function(_deep){
			return this.environment.getElement().cloneNode(_deep);
		},
		"insert":function(_element){
			_element = _element.environment?_element.environment.getElement():_element;
			_element.appendChild(this.environment.getElement());
			return this;
		},
		"insertAfter":function(_referenceElement){
			_referenceElement = _referenceElement.environment?_referenceElement.environment.getElement():_referenceElement;
			_referenceElement.nextSibling?this.insertBefore(_referenceElement.nextSibling):this.insert(_referenceElement.parentNode);
			return this;
		},
		"insertBefore":function(_referenceElement){
			_referenceElement = _referenceElement.environment?_referenceElement.environment.getElement():_referenceElement;
			_referenceElement.parentNode.insertBefore(this.environment.getElement(),_referenceElement);
			return this;
		},
		"query":function(_expression,_resultType,namespaceResolver,_result){
			return pi.xpath(_expression,_resultType||"ORDERED_NODE_SNAPSHOT_TYPE",this.environment.getElement(),_namespaceResolver,_result);
		},
		"remove":function(){
			this.environment.getParent().removeChild(
				this.environment.getElement()
			);
		},
		"update":function(_value){
				["TEXTAREA","INPUT"].indexOf(this.environment.getName())>-1?
				(this.environment.getElement().value = _value):
				(this.environment.getElement().innerHTML = _value);
				return this;
		},
		"attribute":{
			"getAll":function(_name){
				return this._parent_.environment.getElement().attributes;
			},
			"clear":function(_name){
				this.set(_name,"");
				return this._parent_;
			},
			"get":function(_name){
				return this._parent_.environment.getElement().getAttribute(_name);
			},
			"has":function(_name){
				return pi.env.ie?(this.get(_name)!=null):this._parent_.environment.getElement().hasAttribute(_name);
			},
			"remove":function(_name){
				this._parent_.environment.getElement().removeAttribute(_name);
				return this._parent_;
			},
			"set":function(_name,_value){
				this._parent_.environment.getElement().setAttribute(_name,_value);
				return this._parent_;
			},
			"addClass":function(_classes){
				for (var i = 0; i < arguments.length; i++) {
					pi.util.Element.addClass(this._parent_.environment.getElement(),arguments[i]);
				};
				return this._parent_;
			},
			"clearClass":function(){
				this.setClass("");
				this._parent_;
			},
			"getClass":function(){
				return pi.util.Element.getClass( this._parent_.environment.getElement() );
			},
			"hasClass":function(_class){
				return pi.util.Element.hasClass( this._parent_.environment.getElement(), _class );
			},
			"setClass":function(_value){
				return pi.util.Element.setClass( this._parent_.environment.getElement(), _value );
			},
			"removeClass":function(_class){
				pi.util.Element.removeClass( this._parent_.environment.getElement(), _class );
				return this._parent_;
			},
			"toggleClass":function(_class){
				pi.util.Element.toggleClass( this._parent_.environment.getElement(), _class );
			}
		},
		"child":{
			"get":function(){
				return this._parent_.environment.getElement().childNodes;
			},
			"add":function(_elements){
				for (var i = 0; i < arguments.length; i++) {
					var el = arguments[i];
					this._parent_.environment.getElement().appendChild(
						el.environment ? el.environment.getElement() : el
					);
				}
				return this._parent_;
			},
			"addAfter":function(_element,_referenceElement){
				this.addBefore(
					_element.environment?_element.environment.getElement():_element,
					(_referenceElement.environment?_referenceElement.environment.getElement():_referenceElement).nextSibling
				);
				return this._parent_;
			},
			"addBefore":function(_element,_referenceElement){
				this._parent_.environment.getElement().insertBefore(
					_element.environment?_element.environment.getElement():_element,
					_referenceElement.environment?_referenceElement.environment.getElement():_referenceElement
				);
				return this._parent_;
			},
			"query":function(_tag,_attributeName,_attributeValue){
				return this._parent_.query(
					"{0}{1}".format( (_tag?"{0}".format(_tag):"/*"), _attributeName||_attributeValue?"[contains(concat(' ', @{0}, ' '),' {1} ')]".format(_attributeName||"",_attributeValue||""):"" )
				);
			},
			"remove":function(_element){
				this._parent_.environment.getElement().removeChild(_element.environment?_element.environment.getElement():_element);
			}
		},
		"environment":{
			"_element":null,
			"getParent":function(){
				return this.getElement().parentNode;
			},
			"getPosition":function(){
				return pi.util.Element.getPosition(this.getElement());
			},
			"getSize":function(){
				return pi.util.Element.getSize( this.getElement() );
			},
			"addStyle":function(_styleObject){
				pi.util.Element.addStyle(this.getElement(),_styleObject);
				return this._parent_;
			},
			"getStyle":function(_property){
				return pi.util.Element.getStyle(_property);
			},
			"getName":function(){
				return this.getElement().nodeName;
			},
			"getType":function(){
				return this.getElement().nodeType;
			},
			"getView":function(_property){
				return pi.util.Element.getView(this.getElement(),_property);
			}
		},
		"event":{
			"addListener":function(_event,_fn,_useCapture){
				pi.util.AddEvent(this._parent_.environment.getElement(),_event,_fn,_useCapture);
				return this._parent_;
			},
			"removeListener":function(_event,_fn,_useCapture){
				pi.util.RemoveEvent(this._parent_.environment.getElement(),_event,_fn,_useCapture);
				return this._parent_;
			}
		}
	});
	
	pi.xhr = new pi.base;
	pi.xhr.constructor = function(){
		var api;
		if(!window.XMLHttpRequest){
			var names = ["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Msxml2.XMLHTTP","Microsoft.XMLHTTP"];
			for (var i = 0; i < names.length; i++) {
				try {
					this.environment.setApi(new ActiveXObject(names[i]));
					break;
				} catch (e) { continue; }
			}
		}
		else
			this.environment.setApi(new XMLHttpRequest());
		this.environment.getApi().onreadystatechange=this.event.readystatechange.curry(this);
		return this;
	};
	pi.xhr.body = {
		"abort":function(){
			this.environment.getApi().abort();
		},
		"send":function(){
			var url = this.environment.getUrl(), data = this.environment.getData(),dataUrl = ""; 

			for (var key in data)
				dataUrl += "{0}={1}&".format(key, data[key]);
				
			if (this.environment.getType()=="GET")
				url += (url.search("\\?")==-1?"?":"&")+"{0}".format(dataUrl);
			
			this.environment.getApi().open(this.environment.getType(),url,this.environment.getAsync());
			
			for(var key in this.environment.getHeader())
				this.environment.getApi().setRequestHeader(key,this.environment.getHeader()[key]);

			this.environment.getApi().send(this.environment.getType()=="GET"?"":dataUrl);
		}
	};
	pi.xhr.body.environment = {
		"_async":true, "_api":null, "_cache":true, "_callback":[], "_channel":null, "_data":{}, "_header":{}, "_mimeType":null, "_multipart":false, "_type":"GET", "_timeout":0, "_url":"",
		"addCallback": function(_options,_fn){
			this.getCallback().push({ "fn":_fn, "options":_options  });
		},
		"addHeader": function(_key,_value){
			this.getHeader()[_key] = _value;
		},
		"addData": function(_key,_value){
			this.getData()[_key] = _value;
		},
		"changeCache":function(_value){
			if(_value==false){
				this.addData("forceCache",Math.round(Math.random()*10000));
			}
			this.setCache(_value);
		},
		"changeType": function(_value){
			if(_value=="POST"){
				this.addHeader("Content-Type","application/x-www-form-urlencoded");
			}
			this.setType(_value);
		}
	};
	pi.xhr.body.event = {
		"readystatechange":function(){
			var readyState = this.environment.getApi().readyState;
			var callback=this.environment.getCallback();

			for (var i = 0; i < callback.length; i++) {
				if(callback[i].options.readyState.indexOf(readyState)>-1)
					 callback[i].fn.apply(this);
			}
		}
	};
	pi.xhr = pi.xhr.build();
	
	/*
	 * xml.xhr.get
	 */
	
	pi.xhr.get = function(_url,_returnPiObject){
		var request = new pi.xhr();
		request.environment.setAsync(false);
		request.environment.setUrl(_url);
		request.send();
		return _returnPiObject?request:request.environment.getApi();
	};
	
	/*
	 * pi.xpath
	 */
	
	pi.xpath = function(_expression,_resultType,_contextNode,_namespaceResolver,_result){
		var contextNode = _contextNode||document, 
		expression = _expression||"",
		namespaceResolver = _namespaceResolver||null, 
		result=_result||null,
		resultType=_resultType||"ANY_TYPE";
		return document.evaluate(expression, contextNode, namespaceResolver, XPathResult[resultType], result);
	};
	
	Array.prototype.clone = function(){
		var tmp = [];
		Array.prototype.push.apply(tmp,this);
		tmp.forEach(function(item,index,object){
			if(item instanceof Array)
	    		object[index] = object[index].clone();
		});
	    return tmp;
	};
	Array.prototype.count = function(_value){
		var count = 0;
		this.forEach(function(){
			count+=Number(arguments[0]==_value);
		});
		return count;
	};
	
	Array.prototype.forEach = Array.prototype.forEach||function(_function){
		for(var i=0; i<this.length; i++)
			_function.apply(this,[this[i],i,this]);
	};
	
	Array.prototype.getLastItem = function(){
		return this[this.length-1];
	};
	
	Array.prototype.indexOf = Array.prototype.indexOf||function(_value){
		var index = -1;
		for(var i=0; i<this.length; i++)
			if(this[i]==_value){
				index = i;
				break;
			}
		return index;
	};
	
	Array.prototype.remove = function(_index){
		var array = this.slice(0,_index);
		Array.prototype.push.apply(array,this.slice(_index+1));
		return array;
	};
	
	Array.prototype.removeValue = function(_value){
		return this.remove(this.indexOf(_value));
	};

	Boolean.prototype.toggle = function(){
		return this==true?arguments[0]:arguments[1];
	};

	Number.prototype.base = function(_system){
		var remain = this%_system;
		if(this==remain)return String.fromCharCode(this+(this>9?87:48));
		return ((this-remain)/_system).base(_system)+String.fromCharCode(remain+(remain>9?87:48));
	};
	Number.prototype.decimal = function(_system){
		var result = 0, digit = String(this).split("");
		for(var i=0; i<digit.length; i++)
		{
			digit[i]=parseInt((digit[i].charCodeAt(0)>58)?digit[i].charCodeAt(0)-87:digit[i]);
			result += digit[i]*(Math.pow(_system,digit.length-1-i));
		}
		return result;
	};
	Number.prototype.range = function(_pattern){
		for(
			var value = String(this), isFloat = /\./i.test(value), 
			i = isFloat.toggle(parseInt(value.split(".")[0]),0), 
			end = parseInt(value.split(".")[isFloat.toggle(1,0)]), 
			array = []; i<end; i++
		){
			array.push(
				Boolean(_pattern)==false?i:(typeof _pattern=="function"?_pattern(i):_pattern[i])
			);
		}
		return array;
	};

	String.prototype.escape = function(){
		return escape(this);
	};

	String.prototype.format = function(){
		var values = arguments;
		return this.replace(/\{(\d)\}/g,function(){
			return values[arguments[1]];
		})
	};
	
	String.prototype.leftpad = function(_len,_ch){
		var str=this;
		var ch = Boolean(_ch)==false?" ":_ch;
		while(str.length<_len)
			str=ch+str;
		return str;
	};
	
	String.prototype.toggle = function(_value,_other){
		return this==_value?_value:_other;
	};
	
	String.prototype.unicode = function(){
		var str="", obj = this.split("");
		for(var i=obj.length-1; i>=0; i--)
			str="\\u{0}{1}".format(String(obj[i].charCodeAt(0).base(16)).leftpad(4,"0"),str);
		return str;
	};
	
	pi.util.AddEvent(
		pi.env.ie?window:document,
		pi.env.ie?"load":"DOMContentLoaded",
		function(){
			for(var i=0; i<pi.util.DOMContentLoaded.length; i++){
				pi.util.DOMContentLoaded[ i ]();
			}
		}
	);
	
})(window);