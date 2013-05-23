/* ===================================================================
// Author: Jayson Harshbarger <xinhahere@hypercubed.com>
// WWW: http://www.hypercubed.com/projects/firefox/
//
// All code unless otherwise posted is licensed under the htmlArea License (based on BSD license)
// ===================================================================*/

var xinhahereOptions = null;

if (typeof(Components) != "undefined") {

	var xinhahereOptions = {
		_prefBranch: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.xinhahere."),
		
		_allowed_plugins:  'Abbreviation,CharacterMap,CharCounter,ContextMenu,DefinitionList,EditTag,Filter,FindReplace,Forms,GetHtml,HorizontalRule,InsertAnchor,InsertMarquee,InsertPagebreak,InsertWords,LangMarks,ListType,PasteText,QuickTag,SetId,TableOperations,Template,UnFormat',

		getCharPref: function(x) {
			return xinhahereOptions._prefBranch.getCharPref(x);
		},
		
		setCharPref: function(x,y) {
			return xinhahereOptions._prefBranch.setCharPref(x,y);
		},
		
		getBoolPref: function(x) {
			return xinhahereOptions._prefBranch.getBoolPref(x);
		},
		
		setBoolPref: function(x,y) {
			return xinhahereOptions._prefBranch.setBoolPref(x,y);
		},
		
		init: function() {
			
			var e = document.getElementById("xinhahere.style");
			e.value = xinhahereOptions._prefBranch.getCharPref("style");
			
			var e = document.getElementById("xinhahere.open");
			e.value = xinhahereOptions._prefBranch.getCharPref("openmode");
			
			var e = document.getElementById("XinhaHerePlugin");
			e.checked = xinhahereOptions._prefBranch.getBoolPref("xinhahereplugin");
			
			var e = document.getElementById("xinhahere.lang");
			e.value = xinhahereOptions._prefBranch.getCharPref("lang");
			
			var _plugins = xinhahereOptions._allowed_plugins.split(",");
			var _plugins_lst = xinhahereOptions._prefBranch.getCharPref("plugins");
			for (var x = 0; x < _plugins.length; x++) {
				var newItem = document.createElement('listitem');
				newItem.setAttribute('type', 'checkbox');
				newItem.setAttribute('name', 'plugins');
				newItem.setAttribute('id', _plugins[x]);
				newItem.setAttribute('label', _plugins[x]);
				if (_plugins_lst.indexOf(_plugins[x]) > -1) {
					newItem.setAttribute('checked', 'true');
				} else {
					newItem.setAttribute('checked', 'false');
				}
				document.getElementById('plugins_list').appendChild(newItem);			
			}
		},
	
		save: function() {
			
			var e = document.getElementById("xinhahere.style");
			this._prefBranch.setCharPref("style", e.value);
			
			var e = document.getElementById("xinhahere.open");
			this._prefBranch.setCharPref("openmode", e.value);
			
			var e = document.getElementById("xinhahere.lang");
			this._prefBranch.setCharPref("lang", e.value);
			
			var e = document.getElementById("XinhaHerePlugin");
			this._prefBranch.setBoolPref("xinhahereplugin", e.checked);
			
			var _plugins = document.getElementById("plugins_list").childNodes;
			var _plugins_str = ""
			for (var x = 0; x < _plugins.length; x++) {
				if (_plugins[x].checked) {
					if (_plugins_str != "") _plugins_str += ","
					_plugins_str += _plugins[x].id;
				}
			}
			//alert(_plugins_str);
			this._prefBranch.setCharPref("plugins", _plugins_str);
			
		},
		
		getPlugins:	function() {
			
			_xinha_plugins = [ ];
			
			var _plugins = xinhahereOptions.getCharPref("plugins");
			if (_plugins=="") { 
				_plugins = [ ]; 
			} else {
				_plugins = _plugins.split(",");
				for (var x = 0; x < _plugins.length; x++) {
					if (xinhahereOptions._allowed_plugins.indexOf(_plugins[x]) > -1) {
						_xinha_plugins[_xinha_plugins.length] = _plugins[x];
					}
				}
			}
			if (xinhahereOptions.getBoolPref("xinhahereplugin")) {
				_xinha_plugins[_xinha_plugins.length] = "XinhaHere";
			}
			return _xinha_plugins;
		}
	
	};
};


