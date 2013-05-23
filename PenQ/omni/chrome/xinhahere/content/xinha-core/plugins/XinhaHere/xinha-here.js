// Save text Implementation for XINHA in XINHA HERE
// Client-side test save
// This implements the nsIFileOutputStream component in Firefox
// only avalible when Xinha is running with extensed privliges
//
// Distributed under the same terms as HTMLArea itself.
// This notice MUST stay intact for use (see license.txt).
//
// Todo: add save function
// Add open function
// Add restore previous button

function XinhaHere(editor) {
  this.editor = editor;

  var cfg = editor.config;
  var bl = XinhaHere.btnList;
  var self = this;

  // see if we can find the mode switch button, insert this before that
  var id = "xinhahere";
  
    cfg.registerButton("xhopen", this._lc("Open"), editor.imgURL("ed_open.gif", "XinhaHere"), false,
    	function(editor, id) { self.open(editor); });
			 
	//cfg.registerButton("xhsave", this._lc("Save"), editor.imgURL("ed_save.gif", "XinhaHere"), false,
    	//function(editor, id) { self.save(editor); });
			 
	cfg.registerButton("xhsaveas", this._lc("Save As"), editor.imgURL("ed_saveas.gif", "XinhaHere"), false,
		function(editor, id) { self.saveAs(editor); });
			 
	cfg.registerButton("xhrestore", this._lc("Restore"), editor.imgURL("ed_restore.gif", "XinhaHere"), false,
		function(editor, id) { self.restore(editor); });
		
	cfg.addToolbarElement(["xhopen", "xhsaveas", "xhrestore"], ["separator", "formatblock","fontsize","fontname"], -1);
			 

	if (typeof(Components.classes["@mozilla.org/spellbound;1"]) != 'undefined') {
		cfg.registerButton("xhspellbound", this._lc("Spell-check"), editor.imgURL("clientside-spellcheck.gif", "XinhaHere"), false,
			function(editor) { spellBound_useNode(editor); });
		cfg.addToolbarElement(["xhspellbound"], ["separator", "formatblock","fontsize","fontname"], -1);	
  	}

}

XinhaHere._pluginInfo = {
  name          : "XinhaHere",
  version       : "0.1",
  developer     : "Jayson Harshbarger",
  developer_url : "http://blog.hypercubed.com/",
  c_owner       : "Jayson Harshbarger",
  sponsor       : "none",
  sponsor_url   : "http://blog.hypercubed.com/",
  license       : "htmlArea"
};

XinhaHere.prototype._lc = function(string) {
  return Xinha._lc(string, 'XinhaHere');
};

// some of the code was adapted from save_text_area extension
XinhaHere.prototype.save = function (editor) {
	//alert("Trying to save: "+editor.getHTML());
	var path = xinhahereOptions.getCharPref("savepath");
	
	if (path == "") 
		self.saveAs(editor);
	else
		XinhaHere.saveToFile(editor.getHTML(), path);
};

XinhaHere.prototype.saveAs = function (editor) {
	//alert("Trying to save: "+editor.getHTML());
	
    const filePicker = XinhaHere.getFilePicker(false);
    
    var result = filePicker.show();
    
    if(result == filePicker.returnOK || result == filePicker.returnReplace) {
		XinhaHere.saveToFile(editor.getHTML(), filePicker.file);
		
        xinhahereOptions.setCharPref("savepath", filePicker.file.path);  // Save filename for next time
    }
};

XinhaHere.prototype.open = function (editor) {
	//alert("Trying to save: "+editor.getHTML());
	
    const filePicker = XinhaHere.getFilePicker(true);
    
    if(filePicker.show() == filePicker.returnOK)
    {
		XinhaHere.loadFromFile(editor, filePicker.file);
		xinhahereOptions.setCharPref("savepath", filePicker.file.path);
    }
};

XinhaHere.loadFromFile = function (editor, file) {
	var text = "";
	if (file.exists) {
        const inputStream      = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        const scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);

        inputStream.init(file, 0x01, 0444, null);
        scriptableStream.init(inputStream);

		text = scriptableStream.read(scriptableStream.available());
  
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].getService(Components.interfaces.nsIScriptableUnicodeConverter);
		
		converter.charset = 'UTF-8';
		text = converter.ConvertToUnicode(text);

        scriptableStream.close();
        inputStream.close();

	}
	
    editor.setHTML(text);

};

XinhaHere.getFilePicker = function(openMode) {
	//alert("file picker here");
	var filePicker   = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);

	if (openMode)
		filePicker.init(window, XinhaHere.prototype._lc("Open"), filePicker.modeOpen);
	else
	    filePicker.init(window, XinhaHere.prototype._lc("Save As"), filePicker.modeSave);
	    
    filePicker.appendFilters(filePicker.filterAll);
    filePicker.appendFilters(filePicker.filterText);
    filePicker.appendFilters(filePicker.filterHTML);
	filePicker.defaultExtension = "txt";

	var path = xinhahereOptions.getCharPref("savepath");  // If an exitsing file name load it here
	if (path != null) {
		try {
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(path);
		
			filePicker.displayDirectory = file.parent;
			filePicker.defaultString = file.leafName;
		} catch (error) {
		//	alert(error.message);
		}
	}

	return filePicker;
};

XinhaHere.saveToFile = function(text, file) {
	if(!file.exists()) {
		file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 444);
	}
	var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].getService(Components.interfaces.nsIScriptableUnicodeConverter);
	converter.charset = 'UTF-8';
	text = converter.ConvertFromUnicode(text);

	const outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);   
	outputStream.init(file, 0x04 | 0x08 | 0x20, 0444, null);
	outputStream.write(text, text.length);
	outputStream.close();
};

XinhaHere.prototype.restore = function (editor) {
    const text = xinhahereOptions.getCharPref("lastvalue");
    editor.setHTML(text);
};

function spellBound_useNode(ed) {
  var args = [];
  args[0] = ed._iframe.contentDocument;
  window.openDialog("chrome://spellbound/content/SBSpellCheck.xul","_blank","chrome,close,titlebar,modal", false, false, true, args);
}
