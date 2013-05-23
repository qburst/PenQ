/* ===================================================================
// Author: Jayson Harshbarger <xinhahere@hypercubed.com>
// WWW: http://www.hypercubed.com/projects/firefox/
//
// All code unless otherwise posted is licensed under the htmlArea License (based on BSD license)
// ===================================================================*/

	var src_elm = null;  // Each Xinha incarnation needs to store it's own source elemnt to avoid conflict
    var src_xhOverlay = null;  // warning: this Xinha Here Overlay can be common to multiple instances
	var src_type = null;
	
	var xinha_editors = null;
    var xinha_init    = null;
    var xinha_config  = null;
    var xinha_plugins = null;

	var str_plugins = "";
	var _editor_lang = "en";
	var _editor_skin = "";
	
	// Override Xinha Functions here (not in core files)
	// Note: These overrides only work if XinhaCore is lodaed not XinhaLoader
	Xinha.isRunLocally = true;
	Xinha._geturlcontent = function(url)
		{
		  var req = null;
		  req = Xinha.getXMLHTTPRequestObject();

		  // Synchronous!
		  try {
			req.open('GET', url, false);
		  	req.send(null);
			//alert(url);  // Testing
		  } catch ( e ) {
			return '';
		  }
		  
		  if ( req.status == 200 || Xinha.isRunLocally && req.status == 0 )
		  {
		    return req.responseText;
		  } else {
		    return '';
		  }

		};
	
	if (xinhahereOptions) {
		_editor_lang =  xinhahereOptions.getCharPref("lang");
		_editor_skin = xinhahereOptions.getCharPref("style");
		str_plugins = xinhahereOptions.getCharPref("plugins");
		xinha_plugins = xinhahereOptions.getPlugins();
	}

	function load_src(x) {
	
	  if (!!x) {  // Overlay is passed, otherwise try to detect
	  	src_xhOverlay = x;
	  } else if (window.opener) { // Window open
	    src_xhOverlay = window.opener.xinhahereOverlay;
	  } else if (parent.xinhahereOverlay) { //bottom bar or sidebar
	  	src_xhOverlay = parent.xinhahereOverlay;
	  } 

	  if (src_xhOverlay) {
	  	src_elm = src_xhOverlay.src_elm;
		src_type = src_xhOverlay.loc;
		
		document.getElementById("submits").style.visibility = "visible";
		document.getElementById("myTextArea").value = src_xhOverlay.init_html;
		document.getElementById("myTextArea").focus();
		xinha_editors['myTextArea'].setHTML(src_xhOverlay.init_html);
		
		//alert(src_xhOverlay.init_html);
	  }

      xinha_editors['myTextArea'].activateEditor();
	  xinha_editors['myTextArea'].focusEditor();
	  //var doc = xinha_editors['myTextArea']._doc; // get a grip on the document
	  //var element = doc.lastChild; //get some element
	  //xinha_editors['myTextArea'].scrollToElement(element); // use one of the many built-in secret magic functions :)
	}

    xinha_init = xinha_init ? xinha_init : function()
    {
	  xinha_size();

      xinha_editors = xinha_editors ? xinha_editors : [ 'myTextArea' ];

	  if(!Xinha.loadPlugins(xinha_plugins, xinha_init)) return;
      xinha_config = xinha_config ? xinha_config() : new Xinha.Config();
	  
	  //xinha_config.specialReplacements['<?php'] = '[?php';
	  //xinha_config.specialReplacements['<?'] = '[?';
	  //xinha_config.specialReplacements['?>'] = '?]';
	  //xinha_config.specialReplacements['<%'] = '[%';
	  //xinha_config.specialReplacements['%>'] = '%]';
	  //xinha_config.pageStyle = 'code_php { color: red; background: #FDF8E3; }\n' + 'code_asp { color: blue; background: #FDF8E3; }\n';
	  //alert(xinha_config.specialReplacements);
	  
	  xinha_config.Filters = ["Word", "Paragraph"];
	  xinha_config.width  = "98%";
	  xinha_config.height = "100%";
	  xinha_config.align = "center";
	  
	  xinha_config.toolbar =
		  [
		    ["separator","formatblock","fontname","fontsize"],
			["separator", "bold","italic","underline","strikethrough"],
		  ["separator","forecolor","hilitecolor","textindicator"],
		    ["separator","subscript","superscript"],
		    ["linebreak","separator","justifyleft","justifycenter","justifyright","justifyfull"],
		    ["separator","insertorderedlist","insertunorderedlist","outdent","indent"],
		    ["separator","inserthorizontalrule","createlink","insertimage","inserttable"],
		    ["separator","undo","redo","selectall","print"], (Xinha.is_gecko ? [] : ["cut","copy","paste","overwrite","saveas"]),
		    ["separator","killword","clearfonts","removeformat","toggleborders","splitblock","lefttoright", "righttoleft"],
		    ["separator","htmlmode","showhelp"]
		  ];
	  
      xinha_editors   = Xinha.makeEditors(xinha_editors, xinha_config, xinha_plugins);
	  
	  xinha_editors['myTextArea']._onGenerate = function() { load_src() }
	  
      Xinha.startEditors(xinha_editors);
	  //alert("all set!");
	  
	  translate();
	  
	  // Some URIs are set incorrectly in 0.95
	  xinha_editors['myTextArea'].config.URIs.blank = "blank.html";
	  xinha_editors['myTextArea'].config.URIs.help = "editor_help.html";
	  xinha_editors['myTextArea'].config.URIs.select_color = "select_color.html";
	  
	  //xinha_editors['myTextArea'].whenDocReady(load_src());
	  
	  //xinha_editors['myTextArea']..activateEditor();
	  
    }

	function translate() {  // For now using HTMLArea language
		var buttons = document.getElementsByTagName("button");
		for (var i = buttons.length; --i >= 0;) {
 			buttons[i].innerHTML = Xinha._lc(buttons[i].innerHTML, "XinhaHere");
 			buttons[i].title = Xinha._lc(buttons[i].title, "XinhaHere");
		}
	}

	function update(s)
	{
		//var _text = xinha_editors['myTextArea'].getHTML();
		var _text = xinha_editors['myTextArea'].outwardHtml(xinha_editors['myTextArea'].getHTML());
		xinhahereOptions.setCharPref("lastvalue", _text);
		if (src_elm) {  // detection doesn't work!
			if (s) {
				_text=_text.replace(/\n/g,"");		// replace single Lf
				//_text=_text.replace("p","");		// replace single Cr
			}		
			src_elm.value = _text;
			return true;
		} else {  
			alert("Source textbox is missing!");
			return false;
		}
	}
	
	function xinhaClose()
	{
		Xinha.flushEvents;
		Xinha.collectGarbageForIE;// Don't know if this does anything in Firefox
   
		Xinha  = null;
		xinha_editors['myTextArea']  = null;
		xinha_editors  = null;
    	xinha_init  = null;
    	xinha_config  = null;
    	xinha_plugins  = null;
		src_elm  = null;
    	_editor_url  = null;
		str_plugins  = null;
		_editor_lang  = null;
		_editor_skin  = null;
		xinhahereOptions  = null; 
		if (src_type == "win") {
			window.close();
		} else if (src_type == "bot") {
			src_xhOverlay.closeBottomBar();
		} else if (src_type == "side") {
			src_xhOverlay.closeSideBar();
		}
		src_type = null;
		src_xhOverlay = null;
		
		return;
	}
	
	function finish()
	{
		if (confirm("Update text field?")) {
			update();
		}
	}
	
	var refreshFlag = false;
	
	function showopts()
	{
		refreshFlag = false;
		var r = window.openDialog("options.xul", "xinha_options", "toolbar=no,menubar=no,personalbar=no,width=300,height=420,left=20,top=40,scrollbars=no,resizable=yes,dependent=yes,chrome=no,modal=yes");
		if (refreshFlag) {
			refreshFlag = false;
			src_xhOverlay.init_html = xinha_editors['myTextArea'].getHTML();  // Strore current value for after reload
			src_xhOverlay.src_elm = src_elm;
			window.location.reload();
		}
	}
	
	function xinha_size() {
	  var OFFSET = 40;
	  var MIN = 300;
	  var newHeight;
	  var content = document.getElementById("content");
	  var newHeight = ((window.innerHeight > MIN ? window.innerHeight : MIN) - OFFSET) + "px";
	  if(newHeight != content.style.height) {
		  content.style.height = newHeight;
	  }
	}
	
	window.onresize = xinha_size;
    window.onload = xinha_init;
	//Xinha.addOnloadHandler(xinha_init);
	
	//window.onunload = finish;
    //window.onunload = HTMLArea.collectGarbageForIE;
