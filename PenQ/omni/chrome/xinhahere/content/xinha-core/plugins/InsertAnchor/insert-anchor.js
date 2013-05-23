function InsertAnchor(editor) {
  this.editor = editor;
  var cfg = editor.config;
  var self = this;
  
  this.placeholderImg = '<img class="IA_placeholder" src="'+_editor_url+'plugins/InsertAnchor/img/placeholder.gif" />';
  
  // register the toolbar buttons provided by this plugin
  cfg.registerButton({
  id       : "insert-anchor", 
  tooltip  : this._lc("Insert Anchor"), 
  image    : editor.imgURL("insert-anchor.gif", "InsertAnchor"),
  textMode : false,
  action   : function(editor) {
               self.buttonPress(editor);
             }
  });
  cfg.addToolbarElement("insert-anchor", "createlink", 1);
}

InsertAnchor._pluginInfo = {
  name          : "InsertAnchor",
  origin        : "version: 1.0, by Andre Rabold, MR Printware GmbH, http://www.mr-printware.de",
  version       : "2.0",
  developer     : "Udo Schmal",
  developer_url : "http://www.schaffrath-neuemedien.de",
  c_owner       : "Udo Schmal",
  sponsor       : "L.N.Schaffrath NeueMedien",
  sponsor_url   : "http://www.schaffrath-neuemedien.de",
  license       : "htmlArea"
};

InsertAnchor.prototype._lc = function(string) {
    return Xinha._lc(string, 'InsertAnchor');
};

InsertAnchor.prototype.onGenerate = function() {
  this.editor.addEditorStylesheet(_editor_url + 'plugins/InsertAnchor/insert-anchor.css');
  
};

InsertAnchor.prototype.inwardHtml = function(html)
{
	html= html.replace(/(<a[^>]*class="anchor"[^>]*>)/g,"$1"+this.placeholderImg);
	return html;
}
InsertAnchor.prototype.outwardHtml = function(html)
{
	html= html.replace(/(<img[^>]*class="?IA_placeholder"?[^>]*>)/ig,"");
	return html;
}

InsertAnchor.prototype.buttonPress = function(editor) {
  var outparam = null;
  var html = editor.getSelectedHTML();
  var sel  = editor._getSelection();
  var range  = editor._createRange(sel);
  var self = this;
  var  a = editor._activeElement(sel);
  if(!(a != null && a.tagName.toLowerCase() == 'a')) {
    a = editor._getFirstAncestor(sel, 'a'); 
  }
  if (a != null && a.tagName.toLowerCase() == 'a')
    outparam = { name : a.id };
  else
    outparam = { name : '' };

  editor._popupDialog( "plugin://InsertAnchor/insert_anchor", function( param ) {
    if ( param ) {
      var anchor = param["name"];
      if (anchor == "" || anchor == null) {
        if (a) {
          var child = self.outwardHtml(a.innerHTML);
          a.parentNode.removeChild(a);
          editor.insertHTML(child);
        }
        return;
      } 
      try {
        var doc = editor._doc;
        if (!a) {
//          editor.surroundHTML('<a id="' + anchor + '" name="' + anchor + '" title="' + anchor + '" class="anchor">', '</a>');
          a = doc.createElement("a");
          a.id = anchor;
          a.name = anchor;
          a.title = anchor;
          a.className = "anchor";
          a.innerHTML = self.placeholderImg;
		  if (html) a.innerHTML += html;
          if (Xinha.is_ie) {
            range.pasteHTML(a.outerHTML);
          } else {
            editor.insertNodeAtSelection(a);
          }
        } else {
          a.id = anchor;
          a.name = anchor;
          a.title = anchor;
          a.className = "anchor";
        }
      }
      catch (e) { }
    }
  }, outparam);
};
