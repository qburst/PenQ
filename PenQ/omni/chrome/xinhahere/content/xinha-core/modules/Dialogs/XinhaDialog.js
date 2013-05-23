  /*--------------------------------------:noTabs=true:tabSize=2:indentSize=2:--
    --  Xinha (is not htmlArea) - http://xinha.org
    --
    --  Use of Xinha is granted by the terms of the htmlArea License (based on
    --  BSD license)  please read license.txt in this package for details.
    --
    --  Copyright (c) 2005-2008 Xinha Developer Team and contributors
    --
    --  Xinha was originally based on work by Mihai Bazon which is:
    --      Copyright (c) 2003-2004 dynarch.com.
    --      Copyright (c) 2002-2003 interactivetools.com, inc.
    --      This copyright notice MUST stay intact for use.
    --
    --  This is the new all-in-one implementation of dialogs for Xinha
    --
    --
    --  $HeadURL:http://svn.xinha.webfactional.com/trunk/modules/Dialogs/inline-dialog.js $
    --  $LastChangedDate:2008-04-12 19:10:04 +0200 (Sa, 12 Apr 2008) $
    --  $LastChangedRevision:990 $
    --  $LastChangedBy:ray $
    --------------------------------------------------------------------------*/

/** Xinha Dialog
 *
 *
 * @param editor Xinha object    
 * @param html string 
 * @param localizer string the "context" parameter for Xinha._lc(), typically the name of the plugin
 * @param size object with two possible properties of the size: width & height as int, where height is optional
 * @param options dictionary with optional boolean attributes 'modal', 'closable', 'resizable', and 'centered', as well as integer attribute 'layer'
 */
Xinha.Dialog = function(editor, html, localizer, size, options)
{
  var dialog = this;
  this.id    = { };
  this.r_id  = { }; // reverse lookup id
  this.editor   = editor;
  this.document = document;
  this.size = size;
  this.modal = (options && options.modal === false) ? false : true;
  this.closable = (options && options.closable === false) ? false : true;
  this.resizable = (options && options.resizable === false) ? false : true;
  this.layer = (options && options.layer) ? options.layer : 0;
  this.centered = (options && options.centered === true) ? true : false;
  this.closeOnEscape = (options && options.closeOnEscape === true) ? true : false;

  /* Check global config to see if we should override any of the above options
    If a global option is set, it will apply to all dialogs, regardless of their
    individual settings (i.e., it will override them). If the global option is
    undefined, the options passed in above will be used.
  */
  var globalOptions = editor.config.dialogOptions
  if (globalOptions) {
    if (typeof(globalOptions.centered) != 'undefined') {
      this.centered = globalOptions.centered;
    }
    if (typeof(globalOptions.resizable) != 'undefined') {
      this.resizable = globalOptions.resizable;
    }
    if (typeof(globalOptions.closable) != 'undefined') {
      this.closable = globalOptions.closable;
    }
    if (typeof(globalOptions.greyout) != 'undefined') {
      this.greyout = globalOptions.greyout;
    }
    if (typeof(globalOptions.closeOnEscape) != 'undefined') {
      this.closeOnEscape = globalOptions.closeOnEscape;
    }
  }

  if (Xinha.is_ie)
  { // IE6 needs the iframe to hide select boxes
    var backG = document.createElement("iframe");
    backG.src = "about:blank";
    backG.onreadystatechange = function () 
    {
      var doc = window.event.srcElement.contentWindow.document;
      if (this.readyState == 'complete' && doc && doc.body)
      {
        var div = doc.createElement('div');
        //insert styles to make background color skinable
        var styles, stylesheets = document.styleSheets;
        
        for (var i=0;i<stylesheets.length;i++)
        {
          if (stylesheets[i].id.indexOf('Xinha') != -1 && stylesheets[i].cssText) 
            styles += stylesheets[i].cssText;
        }
        div.innerHTML = '<br><style type="text/css">\ņ'+styles+'\n</style>'; // strange way, but didn't work otherwise
        doc.getElementsByTagName('body')[0].appendChild(div);
        doc.body.className = 'xinha_dialog_background';
        if (dialog.modal) doc.body.className += ' modal';
        if (dialog.greyout) doc.body.className += ' greyout';
      }
    }
  }
  else
  { // Mozilla (<FF3) can't have the iframe, because it hides the caret in text fields
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=226933
    var backG = document.createElement("div");
  }
  backG.className = "xinha_dialog_background";
  if (this.modal) backG.className += ' modal';
  if (this.greyout) backG.className += ' greyout';
  with (backG.style)
  {
    position = "absolute";
    top = 0;
    left = 0;
    border = 'none';
    overflow = "hidden";
    display = "none";
    zIndex = (this.modal ? 1025 : 1001 ) + this.layer;
  }
  document.body.appendChild(backG);
  this.background = backG;

  backG = null;
  Xinha.freeLater(this, "background");

  var rootElem = document.createElement('div');
  //I've got the feeling dragging is much slower in IE7 w/ pos:fixed, besides the strange fact that it only works in Strict mode 
  //rootElem.style.position = (Xinha.ie_version < 7 ||(Xinha.is_ie && document.compatMode == "BackCompat") || !this.modal) ? "absolute" : "fixed";
  rootElem.style.position = (Xinha.is_ie || !this.modal) ? "absolute" : "fixed";
  rootElem.style.zIndex = (this.modal ? 1027 : 1003 ) + this.layer;
  rootElem.style.display  = 'none';
  
  if (!this.modal)
  {
    Xinha._addEvent(rootElem,'mousedown', function () { Xinha.Dialog.activateModeless(dialog);});
  }
  
  // FIXME: This is nice, but I don't manage to get it switched off on text inputs :(
  // rootElem.style.MozUserSelect = "none";
  
  rootElem.className = 'dialog';
  
 // this.background[1].appendChild(rootElem);
  document.body.appendChild(rootElem);

  rootElem.style.paddingBottom = "10px";
  rootElem.style.width = ( size && size.width )  ? size.width + 'px' : '';

  if (size && size.height)
  {
    if (Xinha.ie_version < 7)
    {
      rootElem.style.height = size.height + 'px';
    }
    else
    {
      rootElem.style.minHeight =  size.height + 'px';
    }
  }

  html = this.translateHtml(html,localizer)

  var main = document.createElement('div');
  rootElem.appendChild(main);
  main.innerHTML = html;

  //make the first h1 to drag&drop the rootElem
  var captionBar = main.removeChild( main.getElementsByTagName("h1")[0]);
  rootElem.insertBefore(captionBar,main);
  Xinha._addEvent(captionBar, 'mousedown',function(ev) { dialog.dragStart(ev); });
  
  captionBar.style.MozUserSelect = "none";
  captionBar.style.WebkitUserSelect = "none"; //seems to have no effect
  captionBar.unselectable = "on";
  captionBar.onselectstart = function() {return false;};

  this.buttons = document.createElement('div');
  with (this.buttons.style)
  {
    position = "absolute";
    top = "0";
    right = "2px";
  }
  rootElem.appendChild(this.buttons);

  if (this.closable && this.closeOnEscape)
  {
    Xinha._addEvent(document, 'keypress', function(ev) {
      if (ev.keyCode == 27) // ESC key
      {
        if (Xinha.Dialog.activeModeless == dialog || dialog.modal)
        {
          dialog.hide();
          return true;
        }
      }
    });
  }

  this.closer = null;
  if ( this.closable )
  {
    this.closer = document.createElement('div');
    this.closer.className= 'closeButton'; 
      
    this.closer.onmousedown = function(ev) { this.className = "closeButton buttonClick"; Xinha._stopEvent(Xinha.getEvent(ev)); return false;};
    this.closer.onmouseout = function(ev) { this.className = "closeButton"; Xinha._stopEvent(Xinha.getEvent(ev)); return false;};
    this.closer.onmouseup = function() { this.className = "closeButton"; dialog.hide(); return false;};
  
    this.buttons.appendChild(this.closer);
  
    var butX = document.createElement('span');
    butX.className = 'innerX';
    butX.style.position = 'relative';
    butX.style.top = '-3px';
  
    butX.appendChild(document.createTextNode('\u00D7')); // cross
    //below different symbols for future use
    //butX.appendChild(document.createTextNode('\u25AC')); //bar
    //butX.appendChild(document.createTextNode('\u25BA')); //triangle right
    //butX.appendChild(document.createTextNode('\u25B2')); //triangle up
    //butX.appendChild(document.createTextNode('\u25BC')); //triangle down
    this.closer.appendChild(butX);
    butX = null;
  }
  
  this.icon = document.createElement('img');
  with (this.icon)
  {
    className = 'icon';
    src = _editor_url + 'images/xinha-small-icon.gif';
    style.position = 'absolute';
    style.top = '3px';
    style.left = '2px';
    ondrag = function () {return false;};
  }
  captionBar.style.paddingLeft = '22px';
  rootElem.appendChild(this.icon);
  
  var all = rootElem.getElementsByTagName("*");

  for (var i=0; i<all.length;i++)
  {
    var el = all[i]; 
    if (el.tagName.toLowerCase() == 'textarea' || el.tagName.toLowerCase() == 'input')
    {
      // FIXME: this doesn't work
      //el.style.MozUserSelect = "text";
    }
    else
    {
      el.unselectable = "on";
    }
  }

  this.resizer = null;
  if (this.resizable)
  {
    this.resizer = document.createElement('div');
    this.resizer.className = "resizeHandle";
    with (this.resizer.style)
    {
      position = "absolute";
      bottom = "0px";
      right= "0px";
    }
    Xinha._addEvent(this.resizer, 'mousedown', function(ev) { dialog.resizeStart(ev); });
    rootElem.appendChild(this.resizer);
  }

  this.rootElem = rootElem;
  this.captionBar = captionBar;
  this.main = main;
  
  captionBar = null;
  rootElem = null;
  main = null;
  
  Xinha.freeLater(this,"rootElem");
  Xinha.freeLater(this,"captionBar");
  Xinha.freeLater(this,"main");
  Xinha.freeLater(this, "buttons");
  Xinha.freeLater(this, "closer");
  Xinha.freeLater(this, "icon");
  Xinha.freeLater(this, "resizer");
  Xinha.freeLater(this, "document");
  
  // for caching size & position after dragging & resizing
  this.size = {};

};

Xinha.Dialog.prototype.onresize = function()
{
  return true;
};

Xinha.Dialog.prototype.show = function(values)
{
  var rootElem = this.rootElem;
  var rootElemStyle = rootElem.style;
  var modal = this.modal;
  var scrollPos = this.scrollPos = this.editor.scrollPos();
  var dialog = this;
  //dialog.main.style.height = '';
  if ( this.attached ) 
  {
    this.editor.showPanel(rootElem);
  }
    
  // We need to preserve the selection
  // if this is called before some editor has been activated, it activates the editor
  if (Xinha._someEditorHasBeenActivated)
  {
    this._lastRange = this.editor.saveSelection();
     
    if (Xinha.is_ie && !modal)
    {
      dialog.saveSelection = function() { dialog._lastRange = dialog.editor.saveSelection();};
      Xinha._addEvent(this.editor._doc,'mouseup', dialog.saveSelection);
    }
  }
 
  if ( modal )
  {
    this.editor.deactivateEditor();
    this.editor.currentModal = dialog;
  }

  // unfortunately we have to hide the editor (iframe/caret bug)
  if (Xinha.is_ff2 && modal)
  {
    this._restoreTo = [this.editor._textArea.style.display, this.editor._iframe.style.visibility, this.editor.hidePanels()];
    this.editor._textArea.style.display = 'none';
    this.editor._iframe.style.visibility   = 'hidden';
  }
  
  if ( !this.attached )
  {
    if ( modal )
    {
      this.showBackground()
      this.posBackground({top:0, left:0}); 
      this.resizeBackground(Xinha.Dialog.calcFullBgSize());
    }
    else this.background.style.display = '';

    //this.onResizeWin = function () {dialog.sizeBackground()};
    //Xinha._addEvent(window, 'resize', this.onResizeWin );

    //rootElemStyle.display   = '';
    Xinha.Dialog.fadeIn(this.rootElem, 100,function() {
      //this is primarily to work around a bug in IE where absolutely positioned elements have a frame that renders above all #1268
      //but could also be seen as a feature ;)
      if (modal)
      {
        var input = dialog.rootElem.getElementsByTagName('input');
        for (var i=0;i<input.length;i++)
        {
          if (input[i].type == 'text')
          {
            input[i].focus();
            break;
          }
        }
      }
    });
    var dialogHeight = rootElem.offsetHeight;
    var dialogWidth = rootElem.offsetWidth;
    var viewport = Xinha.viewportSize();
    var viewportHeight = viewport.y;
    var viewportWidth = viewport.x;
    
    if (dialogHeight >  viewportHeight)
    {
      rootElemStyle.height =  viewportHeight + "px";
      if (rootElem.scrollHeight > dialogHeight)
      {
        dialog.main.style.overflowY = "auto";
      }
    }

    if(this.size.top && this.size.left)
    {
      rootElemStyle.top =  parseInt(this.size.top,10) + 'px';
      rootElemStyle.left = parseInt(this.size.left,10) + 'px';
    }
    else if (this.editor.btnClickEvent && !this.centered)
    {
      var btnClickEvent = this.editor.btnClickEvent;
      if (rootElemStyle.position == 'absolute')
      {
        rootElemStyle.top =  btnClickEvent.clientY + this.scrollPos.y +'px';
      }
      else
      {
        rootElemStyle.top =  btnClickEvent.clientY +'px';
      }

      if (dialogHeight + rootElem.offsetTop >  viewportHeight)
      {
        rootElemStyle.top = (rootElemStyle.position == 'absolute' ? this.scrollPos.y : 0 ) + "px" ;
      }

      if (rootElemStyle.position == 'absolute')
      {
        rootElemStyle.left = btnClickEvent.clientX +  this.scrollPos.x +'px';
      }
      else
      {
        rootElemStyle.left =  btnClickEvent.clientX +'px';
      }

      if (dialogWidth + rootElem.offsetLeft >  viewportWidth)
      {
        rootElemStyle.left =  btnClickEvent.clientX - dialogWidth   + 'px';
        if (rootElem.offsetLeft < 0)
        {
          rootElemStyle.left = 0;
        }
      }
      this.editor.btnClickEvent = null;
    }
    else
    {
      var top =  ( viewportHeight - dialogHeight) / 2;
      var left = ( viewportWidth - dialogWidth) / 2;
      rootElemStyle.top =  ((top > 0) ? top : 0) +'px';
      rootElemStyle.left = ((left > 0) ? left : 0)+'px';
    }
  }
  this.width = dialogWidth;
  this.height = dialogHeight;

  if (!modal)
  {
    this.resizeBackground({width: dialogWidth + 'px', height: dialogHeight + 'px' });
    this.posBackground({top:  rootElemStyle.top, left: rootElemStyle.left});
  }
 
  if(typeof values != 'undefined')
  {
    this.setValues(values);
  }
  this.dialogShown = true;
};

Xinha.Dialog.prototype.hide = function()
{
  if ( this.attached )
  {
    this.editor.hidePanel(this.rootElem);
  }
  else
  {
    //this.rootElem.style.display = 'none';
    Xinha.Dialog.fadeOut(this.rootElem);
    this.hideBackground();
    var dialog = this;

    if (Xinha.is_ff2 && this.modal)
    {
      this.editor._textArea.style.display = this._restoreTo[0];
      this.editor._iframe.style.visibility   = this._restoreTo[1];
      this.editor.showPanels(this._restoreTo[2]);
    }

    if (!this.editor._isFullScreen && this.modal)
    {
      window.scroll(this.scrollPos.x, this.scrollPos.y);
    }

    if (Xinha.is_ie && !this.modal)
    {
      Xinha._removeEvent(this.editor._doc,'mouseup', dialog.saveSelection);
    }

    if (this.modal)
    {
      this.editor.activateEditor();
      this.editor.currentModal = null;
    }
  }

  if (this.modal)
  {
    this.editor.restoreSelection(this._lastRange);
  }
  
  this.dialogShown = false;
  this.editor.updateToolbar();
  this.editor.focusEditor();
  return this.getValues();
};

Xinha.Dialog.prototype.toggle = function()
{
  if(this.rootElem.style.display == 'none')
  {
    this.show();
  }
  else
  {
    this.hide();
  }
};
Xinha.Dialog.prototype.collapse = function()
{
  if(this.collapsed)
  {
    this.collapsed = false;
    this.show();
  }
  else
  {
    this.main.style.height = 0;
    this.collapsed = true;
  }
};

Xinha.Dialog.prototype.getElementById = function(id)
{
  return this.document.getElementById(this.id[id] ? this.id[id] : id);
};

Xinha.Dialog.prototype.getElementsByName = function(name)
{
  return this.document.getElementsByName(this.id[name] ? this.id[name] : name);
};

Xinha.Dialog.prototype.dragStart = function (ev) 
{
  if ( this.attached || this.dragging) 
  {
    return;
  }
  if (!this.modal)
  {
    this.posBackground({top:0, left:0}); 
    this.resizeBackground(Xinha.Dialog.calcFullBgSize());
  }
  ev = Xinha.getEvent(ev);
  
  this.editor.suspendUpdateToolbar = true;
  var dialog = this;

  dialog.dragging = true;

  dialog.scrollPos = dialog.editor.scrollPos();
   
  var st = dialog.rootElem.style;

  dialog.xOffs =  ev.offsetX || ev.layerX; //first value for IE/Opera/Safari, second value for Gecko (or should I say "netscape";))
  dialog.yOffs =  ev.offsetY || ev.layerY;

  dialog.mouseMove = function(ev) { dialog.dragIt(ev); };
  Xinha._addEvent(document,"mousemove", dialog.mouseMove );
  if (Xinha.is_ie) Xinha._addEvent(this.background.contentWindow.document,"mousemove", dialog.mouseMove );
  
  dialog.mouseUp = function (ev) { dialog.dragEnd(ev); };
  Xinha._addEvent(document,"mouseup",  dialog.mouseUp);
  if (Xinha.is_ie) Xinha._addEvent(this.background.contentWindow.document,"mouseup",  dialog.mouseUp);
};

Xinha.Dialog.prototype.dragIt = function(ev)
{
  var dialog = this;

  if (!dialog.dragging) 
  {
    return false;
  }

  if (dialog.rootElem.style.position == 'absolute')
  {
    var posY = (ev.clientY + this.scrollPos.y) - dialog.yOffs + "px";
    var posX = (ev.clientX + this.scrollPos.x) - dialog.xOffs + "px";

    var newPos = {top: posY,left: posX};
  }
  else if (dialog.rootElem.style.position == 'fixed')
  {
    var posY = ev.clientY  - dialog.yOffs + "px";
    var posX = ev.clientX - dialog.xOffs + "px";

    var newPos = {top: posY,left: posX};
  }
  
  dialog.posDialog(newPos);
};

Xinha.Dialog.prototype.dragEnd = function(ev)
{
  var dialog = this;
  this.editor.suspendUpdateToolbar = false;

  if (!dialog.dragging) 
  {
    return false;
  }
  dialog.dragging = false;

  Xinha._removeEvent(document, "mousemove", dialog.mouseMove );
  if (Xinha.is_ie) Xinha._removeEvent(this.background.contentWindow.document, "mousemove", dialog.mouseMove );
  Xinha._removeEvent(document, "mouseup", dialog.mouseUp);
  if (Xinha.is_ie) Xinha._removeEvent(this.background.contentWindow.document, "mouseup",  dialog.mouseUp);

  var rootElemStyle = dialog.rootElem.style;
  
  dialog.size.top  = dialog.rootElem.style.top;
  dialog.size.left = dialog.rootElem.style.left;
  
  if (!this.modal)
  {
    this.sizeBgToDialog();
  }

};

Xinha.Dialog.prototype.resizeStart = function (ev) {
  var dialog = this;
  this.editor.suspendUpdateToolbar = true;
  if (dialog.resizing)
  {
    return;
  }
  dialog.resizing = true;
  if (!this.modal)
  {
    this.posBackground({top:0, left:0}); 
    this.resizeBackground(Xinha.Dialog.calcFullBgSize());
  }
  dialog.scrollPos = dialog.editor.scrollPos();
  
  var st = dialog.rootElem.style;
  st.minHeight = '';
  st.overflow  =  'hidden';
  dialog.xOffs = parseInt(st.left,10);
  dialog.yOffs = parseInt(st.top,10);

  dialog.mouseMove = function(ev) { dialog.resizeIt(ev); };
  Xinha._addEvent(document,"mousemove", dialog.mouseMove );
  if (Xinha.is_ie) Xinha._addEvent(this.background.contentWindow.document,"mousemove", dialog.mouseMove );
  dialog.mouseUp = function (ev) { dialog.resizeEnd(ev); };
  Xinha._addEvent(document,"mouseup",  dialog.mouseUp); 
  if (Xinha.is_ie) Xinha._addEvent(this.background.contentWindow.document,"mouseup", dialog.mouseUp );
};

Xinha.Dialog.prototype.resizeIt = function(ev)
{
  var dialog = this;

  if (!dialog.resizing) {
    return false;
  }

  if (dialog.rootElem.style.position == 'absolute')
  {
    var posY = ev.clientY + dialog.scrollPos.y;
    var posX = ev.clientX + dialog.scrollPos.x;
  }
  else
  {
    var posY = ev.clientY;
    var posX = ev.clientX;
  }

  posX -=  dialog.xOffs;
  posY -=  dialog.yOffs;

  var newSize = {};
  newSize.width  = (( posX > 10) ? posX : 10) + 8 + "px";
  newSize.height = (( posY > 10) ? posY : 10) + "px";

  dialog.sizeDialog(newSize);
  
  
  dialog.width = dialog.rootElem.offsetWidth;
  dialog.height = dialog.rootElem.offsetHeight;

  dialog.onresize();
};

Xinha.Dialog.prototype.resizeEnd = function(ev)
{
  var dialog = this;
  dialog.resizing = false;
  this.editor.suspendUpdateToolbar = false;

  Xinha._removeEvent(document, "mousemove", dialog.mouseMove );
  if (Xinha.is_ie) Xinha._removeEvent(this.background.contentWindow.document, "mouseup",  dialog.mouseUp);
  Xinha._removeEvent(document, "mouseup",  dialog.mouseUp);
  if (Xinha.is_ie) Xinha._removeEvent(this.background.contentWindow.document, "mouseup",  dialog.mouseUp);
  
  dialog.size.width  = dialog.rootElem.offsetWidth;
  dialog.size.height = dialog.rootElem.offsetHeight;

  if (!this.modal) 
  {
    this.sizeBgToDialog();
  }  
};

Xinha.Dialog.prototype.attachToPanel = function(side)
{
  var dialog = this;
  var rootElem = this.rootElem;
  var editor = this.editor;
  
  this.attached = true;
  this.rootElem.side = side;
  this.captionBar.ondblclick = function(ev) { dialog.detachFromPanel(Xinha.getEvent(ev)); };
  
  rootElem.style.position = "static";
  rootElem.parentNode.removeChild(rootElem);
  
  this.background.style.display = 'none';
  
  this.captionBar.style.paddingLeft = "3px";
  this.resizer.style.display = 'none';
  if ( this.closable ) this.closer.style.display = 'none';
  this.icon.style.display = 'none';
  
  if ( side == 'left' || side == 'right' )
  {
    rootElem.style.width  = editor.config.panel_dimensions[side];
  }
  else
  {
    rootElem.style.width = '';
  }
  Xinha.addClasses(rootElem, 'panel');
  editor._panels[side].panels.push(rootElem);
  editor._panels[side].div.appendChild(rootElem);

  editor.notifyOf('panel_change', {'action':'add','panel':rootElem});
};

Xinha.Dialog.prototype.detachFromPanel = function(ev)
{
  var dialog = this;
  var rootElem = dialog.rootElem;
  var rootElemStyle = rootElem.style;
  var editor = dialog.editor;
  
  dialog.attached = false;
  
  this.background.style.display = '';
  this.sizeBgToDialog();
  
  var pos = Xinha.getElementTopLeft(rootElem);
  rootElemStyle.position = "absolute";
  rootElemStyle.top = pos.top + "px";
  rootElemStyle.left = pos.left + "px";
  
  dialog.captionBar.style.paddingLeft = "22px";
  dialog.resizer.style.display = '';
  if ( dialog.closable ) dialog.closer.style.display = '';
  dialog.icon.style.display = '';
  
  if ( dialog.size.width ) rootElem.style.width  = dialog.size.width + 'px';

  Xinha.removeClasses(rootElem, 'panel');
  editor.removePanel(rootElem);
  document.body.appendChild(rootElem);
  
  dialog.captionBar.ondblclick = function() { dialog.attachToPanel(rootElem.side); };
  
};

Xinha.Dialog.calcFullBgSize = function()
{
  var page = Xinha.pageSize();
  var viewport = Xinha.viewportSize();
  return {width:(page.x > viewport.x  ? page.x : viewport.x )  + "px",height:(page.x > viewport.y ? page.y : viewport.y ) + "px"};
}

Xinha.Dialog.prototype.sizeBgToDialog = function()
{
  var rootElemStyle = this.rootElem.style;
  var bgStyle = this.background.style;
  bgStyle.top = rootElemStyle.top;
  bgStyle.left = rootElemStyle.left;
  bgStyle.width = rootElemStyle.width;
  bgStyle.height = rootElemStyle.height;
}
Xinha.Dialog.prototype.hideBackground = function()
{
  //this.background.style.display = 'none';
  Xinha.Dialog.fadeOut(this.background);
}
Xinha.Dialog.prototype.showBackground = function()
{
  //this.background.style.display = '';
  Xinha.Dialog.fadeIn(this.background,70);
}
Xinha.Dialog.prototype.posBackground = function(pos)
{
  if (this.background.style.display != 'none')
  {
    this.background.style.top  = pos.top;
    this.background.style.left = pos.left;
  }
}
Xinha.Dialog.prototype.resizeBackground = function(size)
{
  if (this.background.style.display != 'none')
  {
    this.background.style.width  = size.width;
    this.background.style.height = size.height;
  }
}
Xinha.Dialog.prototype.posDialog = function(pos)
{
  var st = this.rootElem.style;
  st.left = pos.left;
  st.top  = pos.top;
}
Xinha.Dialog.prototype.sizeDialog = function(size)
{
  var st = this.rootElem.style;
  st.height = size.height;
  st.width  = size.width;
  var width = parseInt(size.width, 10);
  var height = parseInt(size.height,10) - this.captionBar.offsetHeight;
  this.main.style.height = (height > 20) ? height : 20 + "px";
  this.main.style.width = (width > 10) ? width : 10 + 'px';
}
Xinha.Dialog.prototype.setValues = function(values)
{
  for(var i in values)
  {
    var elems = this.getElementsByName(i);
    if(!elems) continue;
    for(var x = 0; x < elems.length; x++)
    {
      var e = elems[x];
      switch(e.tagName.toLowerCase())
      {
        case 'select'  :
        {
          for(var j = 0; j < e.options.length; j++)
          {
            if(typeof values[i] == 'object')
            {
              for(var k = 0; k < values[i].length; k++)
              {
                if(values[i][k] == e.options[j].value)
                {
                  e.options[j].selected = true;
                }
              }
            }
            else if(values[i] == e.options[j].value)
            {
              e.options[j].selected = true;
            }
          }
          break;
        }

        case 'textarea':
        case 'input'   :
        {
          switch(e.getAttribute('type'))
          {
            case 'radio'   :
            {
              if(e.value == values[i])
              {
                e.checked = true;
              }
              break;
            }

            case 'checkbox':
            {
              if(typeof values[i] == 'object')
              {
                for(var j in values[i])
                {
                  if(values[i][j] == e.value)
                  {
                    e.checked = true;
                  }
                }
              }
              else
              {
                if(values[i] == e.value)
                {
                  e.checked = true;
                }
              }
              break;
            }

            default    :
            {
              e.value = values[i];
            }
          }
          break;
        }

        default        :
        break;
      }
    }
  }
};

Xinha.Dialog.prototype.getValues = function()
{
  var values = [ ];
  var inputs = Xinha.collectionToArray(this.rootElem.getElementsByTagName('input'))
              .append(Xinha.collectionToArray(this.rootElem.getElementsByTagName('textarea')))
              .append(Xinha.collectionToArray(this.rootElem.getElementsByTagName('select')));

  for(var x = 0; x < inputs.length; x++)
  {
    var i = inputs[x];
    if(!(i.name && this.r_id[i.name])) continue;

    if(typeof values[this.r_id[i.name]] == 'undefined')
    {
      values[this.r_id[i.name]] = null;
    }
    var v = values[this.r_id[i.name]];

    switch(i.tagName.toLowerCase())
    {
      case 'select':
      {
        if(i.multiple)
        {
          if(!v.push)
          {
            if(v != null)
            {
              v = [v];
            }
            else
            {
              v = new Array();
            }
          }
          for(var j = 0; j < i.options.length; j++)
          {
            if(i.options[j].selected)
            {
              v.push(i.options[j].value);
            }
          }
        }
        else
        {
          if(i.selectedIndex >= 0)
          {
            v = i.options[i.selectedIndex];
          }
        }
        break;
      }

      case 'textarea':
      case 'input'   :
      default        :
      {
        switch(i.type.toLowerCase())
        {
          case  'radio':
          {
            if(i.checked)
            {
              v = i.value;
              break;
            }
          }

          case 'checkbox':
          {
            if(v == null)
            {
              if(this.getElementsByName(this.r_id[i.name]).length > 1)
              {
                v = new Array();
              }
            }

            if(i.checked)
            {
              if(v != null && typeof v == 'object' && v.push)
              {
                v.push(i.value);
              }
              else
              {
                v = i.value;
              }
            }
            break;
          }

          default   :
          {
            v = i.value;
            break;
          }
        }
      }

    }

    values[this.r_id[i.name]] = v;
  }
  return values;
};

Xinha.Dialog.prototype.translateHtml = function(html,localizer)
{
  var dialog = this;
  if(typeof localizer == 'function')
  {
    dialog._lc = localizer;
  }
  else if(localizer)
  {
    this._lc = function(string)
    {
      return Xinha._lc(string,localizer);
    };
  }
  else
  {
    this._lc = function(string)
    {
      return string;
    };
  }
  
  html = html.replace(/\[([a-z0-9_]+)\]/ig,
    function(fullString, id)
    {
      return dialog.createId(id);
    }
    ).replace(/<l10n>(.*?)<\/l10n>/ig,
    function(fullString,translate)
    {
      return dialog._lc(translate) ;
    }
    ).replace(/="_\((.*?)\)"/g,
    function(fullString, translate)
    {
      return '="' + dialog._lc(translate) + '"';
    }
  );
  return html;
}

/** Use this function when adding an element with a new ID/name to a 
 *  dialog after it has already been created. This function ensures
 *  that the dialog has the id/name stored in its reverse-lookup table
 *  (which is required for form values to be properly returned by
 *  Xinha.Dialog.hide).
 * 
 * @param {id} the id (or name) to add 
 *
 * Returns the internal ID to which the passed in ID maps
 *
 * TODO: createId is a really awful name, but I can't think of anything better...
 */
Xinha.Dialog.prototype.createId = function(id)
{
  var dialog = this;
  if (typeof dialog.id[id] == 'undefined')
  {
    dialog.id[id] = Xinha.uniq('Dialog');
    dialog.r_id[dialog.id[id]] = id;
  }
  return dialog.id[id];
};

/** When several modeless dialogs are shown, one can be brought to front with this function (as happens on mouseclick) 
 * 
 * @param {XinhaDialog} dialog The dialog to activate
 */

Xinha.Dialog.activateModeless = function(dialog)
{
  if (Xinha.Dialog.activeModeless == dialog || dialog.attached ) 
  {
    return;
  }
  
  if (Xinha.Dialog.activeModeless )
  {
    Xinha.Dialog.activeModeless.rootElem.style.zIndex = parseInt(Xinha.Dialog.activeModeless.rootElem.style.zIndex) -10;
  }
  Xinha.Dialog.activeModeless = dialog;

  Xinha.Dialog.activeModeless.rootElem.style.zIndex = parseInt(Xinha.Dialog.activeModeless.rootElem.style.zIndex) + 10;
}
/** Set opacity cross browser 
 * 
 * @param {DomNode} el The element to set the opacity
 * @param {Object} value opacity value (percent)
 */
Xinha.Dialog.setOpacity = function(el,value)
{
    if (typeof el.style.filter != 'undefined')
    {
        el.style.filter = (value < 100) ?  'alpha(opacity='+value+')' : '';
    }
    else
    {
        el.style.opacity = value/100;
    }
}
/** Fade in an element
 * 
 * @param {DomNode} el The element to fade
 * @param {Number} delay Time for one step in ms
 * @param {Number} endOpacity stop when this value is reached (percent)
 * @param {Number} step Fade this much per step (percent)
 */
Xinha.Dialog.fadeIn = function(el,endOpacity,callback, delay,step)
{
    delay = delay || 1;
    step = step || 25;
    endOpacity = endOpacity || 100;
    el.op = el.op || 0;
    var op = el.op;
    if (el.style.display == 'none')
    {
        Xinha.Dialog.setOpacity(el,0);
        el.style.display = '';
    }
    if (op < endOpacity)
    {
        el.op += step;
        Xinha.Dialog.setOpacity(el,op);
        el.timeOut = setTimeout(function(){Xinha.Dialog.fadeIn(el, endOpacity, callback, delay, step);},delay);
    }
    else
    {
        Xinha.Dialog.setOpacity(el,endOpacity);
        el.op = endOpacity;
        el.timeOut = null;
        if (typeof callback == 'function') callback.call();
    }
}
/** Fade out an element
 * 
 * @param {DomNode} el The element to fade
 * @param {Number} delay Time for one step in ms
 * @param {Number} step Fade this much per step (percent)
 */
Xinha.Dialog.fadeOut = function(el,delay,step)
{
    delay = delay || 1;
    step = step || 30;
    if (typeof el.op == 'undefined') el.op = 100;
    var op = el.op;

    if (op >= 0)
    {
        el.op -= step;
        Xinha.Dialog.setOpacity(el,op);
        el.timeOut = setTimeout(function(){Xinha.Dialog.fadeOut(el,delay,step);},delay);
    }
    else
    {
        Xinha.Dialog.setOpacity(el,0);
        el.style.display = 'none';
        el.op = 0;
        el.timeOut = null;
    }
}