/* ===================================================================
// Author: Jayson Harshbarger <xinhahere@hypercubed.com>
// WWW: http://www.hypercubed.com/projects/firefox/
//
//All code unless otherwise posted is licensed under the htmlArea License (based on BSD license)
// ===================================================================*/

var xinhahereOverlay = {
  init_html: null,  // temp place to store data while loading
  src_elm: null,				// element to pushback data
  but_elm: null,  
  loc: null,
  win: null,
  e_url: "chrome://xinhahere/content/xinha_editor.html",
  
  CleanHTML: function(html) {
	html = html.replace(/</g, "&lt;");
  	html = html.replace(/>/g, "&gt;");
	html = html.replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
	html = html.replace(/\n\n/g,"</p><p>");
	html = html.replace(/\n/g,"<br />");
	return html;
  },
	
  openDef: function(s) {
  	var _open = xinhahereOptions.getCharPref("openmode");
	if (_open == "last") _open = xinhahereOptions.getCharPref("lastmode");
  	if (_open == "win") { 
		xinhahereOverlay.openWin(s); 
	} else { 
		xinhahereOverlay.showBottomBar(s); 
	}
  },
  
  openWin: function(s) {
    xinhahereOverlay.src_elm = document.commandDispatcher.focusedElement;
    //xinhahereOverlay.src_elm = gContextMenu.target;
	var _text = xinhahereOverlay.src_elm.value;
	if (s) { _text = xinhahereOverlay.CleanHTML(_text); }
	xinhahereOverlay.init_html = _text;
	
	xinhahereOverlay.loc = "win";
	xinhahereOptions.setCharPref("lastmode", "win");
	
	var e_par = "toolbar=no,menubar=no,personalbar=no,status=no,width=600,height=420,"
				+"left=20,top=40,scrollbars=no,resizable=yes,dependent=yes,chrome=no";
	var e_win = window.open(xinhahereOverlay.e_url, "xinha_editor", e_par);
  },
  
  showBottomBar: function(s) {
  		xinhahereOverlay.src_elm = document.commandDispatcher.focusedElement;
  		//xinhahereOverlay.src_elm = gContextMenu.target;
		var _text = xinhahereOverlay.src_elm.value;
		if (s) { _text = xinhahereOverlay.CleanHTML(_text); }
		xinhahereOverlay.init_html = _text;
	
		xinhahereOverlay.loc = "bot";
		xinhahereOptions.setCharPref("lastmode", "bot");
	
          var bottomBar = document.getElementById("xinhahereFrame");
          var botSplit = document.getElementById("xinhahereSplit");
		  var botBox = document.getElementById("xinhahereBox");
          
		  if (typeof(bottomBar.contentWindow.load_src) != "undefined") {
		  	bottomBar.contentWindow.load_src();
		  } else {
		  	bottomBar.setAttribute("src", "");  // Reset previous bar if present
		  	bottomBar.setAttribute("src", xinhahereOverlay.e_url);
			//bottomBar.setAttribute("height", "300px");
		  }
		  
		  //botSplit.setAttribute('collapsed', true );
		  //botBox.setAttribute('collapsed', true );
		  
          botSplit.setAttribute('collapsed', false );
		  botSplit.setAttribute('state', 'open' );
		  botBox.setAttribute('collapsed', false );	
		  //alert("test");  
  },
  
  closeBottomBar: function() {

          var bottomBar = document.getElementById("xinhahereFrame");
          var botSplit = document.getElementById("xinhahereSplit");
		  var botBox = document.getElementById("xinhahereBox");

          botBox.setAttribute('collapsed', true );
          botSplit.setAttribute('collapsed', true );
		  botSplit.setAttribute('state', 'open' );
          bottomBar.setAttribute("src", "about:blank");
  },
  
  showSideBar: function() {
  		xinhahereOverlay.src_elm = gContextMenu.target;
		xinhahereOverlay.init_html = gContextMenu.target.value;
		xinhahereOverlay.loc = "side";
		//var sideBar = document.getElementById('xinhahereSidebar');
		//if (sidebar.getAttribute('sidebarurl') == '') {
		//	sidebar.setAttribute('sidebarurl',xinhahereOverlay.e_url);
			toggleSidebar('xinhahereSidebar',true);
		//}
		
		var sideBar = document.getElementById('sidebar');
		if (typeof(sideBar.contentWindow.load_src) != "undefined") {
		  	sideBar.contentWindow.load_src();  // Reset previous bar if present
		//} else {
			//toggleSidebar('xinhahereSidebar',true);
			//sideBar.setAttribute("src", xinhahereOverlay.e_url);	
		}
		//alert(gBrowser.getElementById('sidebar-box').getElementById('sidebar'));
		//sidebar.contentWindow.loadWebPanel(xinhahereOverlay.e_url);
		//alert(nsISidebar);  // If already open (doesn't work)
  },
  
  closeSideBar: function() {
		
		//var sideBar = document.getElementById('xinhahereSidebar');
		
		toggleSidebar('xinhahereSidebar',false);
  },
  
  openTab: function() {
  			xinhahereOverlay.src_elm = gContextMenu.target;
			xinhahereOverlay.init_html = gContextMenu.target.value;
			xinhahereOverlay.loc = "win";
  
  
		  editorInTab = gBrowser.addTab(xinhahereOverlay.e_url);
		  gBrowser.selectedTab = editorInTab;
		  //window.openNewTabWith(xinhahereOverlay.e_url);
		  xinhahereOverlay.win = editorInTab.ownerDocument.getElementById("content").contentWindow;
		  xinhahereOverlay.sendSrc();
		  //while (typeof(win.load_src) == "undefined") { };  // I don't like this
		  //win.load_src(xinhahereOverlay);
		  //alert(editorInTab.window);
		  //alert(editorInTab.contentWindow);
		  //window.openNewTabWith(xinhahereOverlay.e_url, null, null, true);
  },
  
  sendSrc: function() {  // Hack, need to wait for tab to load
  	 if (!!xinhahereOverlay.win) {  // Make sure window is still available
	  	 if (typeof(xinhahereOverlay.win.load_src) != "undefined") {
		 	xinhahereOverlay.win.load_src(xinhahereOverlay);
		 } else {
	  	 	self.setTimeout('xinhahereOverlay.sendSrc()', 2500);
		 }
	 }
  },
  
  show_ops: function() {
		var e_url = "chrome://xinhahere/content/options.xul";
		var e_par = "toolbar=no,menubar=no,personalbar=no,width=300,height=420,"
				+"left=20,top=40,scrollbars=no,resizable=yes,dependent=yes,chrome=yes";
		window.open(e_url, "xinha_options", e_par);
	},
	
  initOverlay: function() {
  	xinhahereOverlay.but_elm = document.getElementById("xinhahere-button");
	
  	var menu = document.getElementById("contentAreaContextMenu");
	if(menu)
  	  menu.addEventListener("popupshowing", xinhahereOverlay.contextPopupShowing, false);
	
	var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent)
      appcontent.addEventListener("DOMContentLoaded", xinhahereOverlay.onPageLoad, true);

  },
  
  onPageLoad: function() {
      //alert('onPageLoad');
      //xinhahereOverlay.but_elm.disabled = true;
	  //var pageDoc = document.commandDispatcher.focusedWindow.document;
	  //var pageDoc = document.getElementById("appcontent");
	  var pageDoc = window.content.document
	  
	  var inputList = pageDoc.getElementsByTagName('input');
	  for (var i=0; i<inputList.length; i++) {
	    if (inputList.item(i).type == "text") {
			inputList.item(i).addEventListener("focus", xinhahereOverlay.onFocusInput, false);
			inputList.item(i).addEventListener("blur", xinhahereOverlay.onBlurInput, false);
		}
	  }
	  
	  inputList = pageDoc.getElementsByTagName('textarea');
	  for (var i=0; i<inputList.length; i++) {
		inputList.item(i).addEventListener("focus", xinhahereOverlay.onFocusInput, false);
		inputList.item(i).addEventListener("blur", xinhahereOverlay.onBlurInput, false);
	  }
	  
	  //pageDoc.addEventListener("focus", this.onFocusInput2, false);
  },
  
  onFocusInput: function(e) {
    //alert('onFocusInput');
    if (xinhahereOverlay.but_elm) { xinhahereOverlay.but_elm.disabled = false; }
  },

  onBlurInput: function(e) {
    if (xinhahereOverlay.but_elm) { xinhahereOverlay.but_elm.disabled = true; }
  },
  
  onFocusInput2: function(e) {
    alert(e.target);
  },
  
  contextPopupShowing: function() {
  	gContextMenu.showItem("mnu_xinhahere", gContextMenu.onTextInput);
  	gContextMenu.showItem("sep_xinhahere", gContextMenu.onTextInput);
	gContextMenu.showItem("mnu_xinhahereopen", gContextMenu.onTextInput);
  }
}

window.addEventListener("load", xinhahereOverlay.initOverlay, false);
