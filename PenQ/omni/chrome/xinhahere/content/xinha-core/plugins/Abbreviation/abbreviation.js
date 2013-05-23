// Abbreviation plugin for Xinha
// Implementation by Udo Schmal & Schaffrath NeueMedien
// Original Author - Udo Schmal
//
// (c) Udo Schmal & Schaffrath NeueMedien 2004
// Distributed under the same terms as HTMLArea itself.
// This notice MUST stay intact for use (see license.txt).

function Abbreviation(editor) {
  this.editor = editor;
  var cfg = editor.config;
  var self = this;

  // register the toolbar buttons provided by this plugin
  cfg.registerButton({
    id       : "abbreviation",
    tooltip  : this._lc("Abbreviation"),
    image    : editor.imgURL("ed_abbreviation.gif", "Abbreviation"),
    textMode : false,
    action   : function(editor) {
                 self.buttonPress(editor);
               }
  })
  cfg.addToolbarElement("abbreviation", "inserthorizontalrule", 1);
}

Abbreviation._pluginInfo = {
  name          : "Abbreviation",
  version       : "1.0",
  developer     : "Udo Schmal",
  developer_url : "",
  sponsor       : "L.N.Schaffrath NeueMedien",
  sponsor_url   : "http://www.schaffrath-neuemedien.de/",
  c_owner       : "Udo Schmal & Schaffrath-NeueMedien",
  license       : "htmlArea"
};

Abbreviation.prototype._lc = function(string) {
    return Xinha._lc(string, 'Abbreviation');
};

Abbreviation.prototype.onGenerate = function() {
  this.editor.addEditorStylesheet(_editor_url + 'plugins/Abbreviation/abbreviation.css');
};

Abbreviation.prototype.buttonPress = function(editor, context, updatecontextclass) {
  var outparam = null;
  var html = editor.getSelectedHTML();
  var sel  = editor._getSelection();
  var range  = editor._createRange(sel);
  var abbr = editor._activeElement(sel);
  if(!(abbr != null && abbr.tagName.toLowerCase() == "abbr")) {
    abbr = editor._getFirstAncestor(sel, 'abbr');
  }
  if (abbr != null && abbr.tagName.toLowerCase() == "abbr")
    outparam = { title : abbr.title,
                 text : abbr.innerHTML};
  else
    outparam = { title : '',
                 text : html};

  editor._popupDialog( "plugin://Abbreviation/abbreviation", function( param ) {
    if ( param ) {
      var title = param["title"];
      if (title == "" || title == null) {
        if (abbr) {
          var child = abbr.innerHTML;
          abbr.parentNode.removeChild(abbr);
          editor.insertHTML(child);
        }
        return;
      }
      try {
        var doc = editor._doc;
        if (!abbr) {
          abbr = doc.createElement("abbr");
          abbr.title = title;
          abbr.innerHTML = html;
          if (Xinha.is_ie) {
            range.pasteHTML(abbr.outerHTML);
          } else {
            editor.insertNodeAtSelection(abbr);
          }
        } else {
          abbr.title = title;
        }
      }
      catch (e) { }
    }
  }, outparam);
};