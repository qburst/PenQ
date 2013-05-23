//  **** BEGIN LICENSE BLOCK ****
//  Copyright(c) 2005 Adam Judson
//
//  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  Portions of this code have been based upon 
//  LiveHttpHeaders  - http://livehttpheaders.mozdev.org
//  Copyright(c) 2002-2003 Daniel Savard.
//  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
//
//  TamperData: 
//  - track and modify http requests and responses
//
//  This program is free software; you can redistribute it and/or modify it under
//  the terms of the GNU General Public License as published by the Free
//  Software Foundation; either version 2 of the License, or (at your option)
//  any later version.
//
//  This program is distributed in the hope that it will be useful, but
//  WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
//  or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
//  more details.
//
//  You should have received a copy of the GNU General Public License along with
//  this program; if not, write to the Free Software Foundation, Inc., 59 Temple
//  Place, Suite 330, Boston, MA 02111-1307 USA
//
//  **** END LICENSE BLOCK ****

function TamperURI(uriObject) {
   this.init(uriObject);
}


TamperURI.init = function() {
   TamperURI.instance = new TamperURI(window.arguments[0]);
};


TamperURI.prototype = {
   __proto__ : new TamperLanguage("tamper.uri."),

   init : function(uriObject) {
      TamperMenu.init(this);
      this.uri = uriObject;
      this.lookupScreenObjects();
      this.prefillScreen();
   },

   lookupScreenObjects : function() {
      this.getParametersList = document.getElementById("parameter list");
      this.protocolEF        = document.getElementById('tamper.uri.protocol');
      this.hostEF            = document.getElementById('tamper.uri.host');
      this.credentialsEF     = document.getElementById('tamper.uri.credentials');
      this.portEF            = document.getElementById('tamper.uri.port');
      this.pathEF            = document.getElementById('tamper.uri.path');
      this.refEF             = document.getElementById('tamper.uri.ref');
   },

   changeTextValue: function(name, key, item, list) {
      var listValue = TamperMenu.instance.getValue(key, item, list);
      var control = document.getElementById(name);
      control.value = listValue;
      this.changeValue(name, control);
   },

   modifyURI : function() {
      this.uri.value = this.createURI();
   },

   dontModifyURI : function() {
      if (!window.confirm(this.langString("submit.original.request"))) {
         this.uri.value = "";
      }
   },

   createURI : function() {
      var url = new URI();
      url.protocol = this.protocolEF.value;
      url.host = this.hostEF.value;
      url.credentials = this.credentialsEF.value;
      url.port = this.portEF.value;
      url.path = this.pathEF.value;
      url.reference = this.refEF.value;
      url.getParameters = this.buildGetParameters();
      return url.toString();
   },

   buildGetParameters : function() {
      var params = new Array();
      var nodes = this.getParametersList.childNodes;
      var entryFieldId, entryField, tamperName;
      for(var i = 0; i < nodes.length; i++) {
         entryFieldId = nodes.item(i).getAttribute("tamper.ef.name");
         if (entryFieldId) {
            tamperName = nodes.item(i).getAttribute("tamper.name");
            entryField = document.getElementById(entryFieldId);
            params.push({name : tamperName, value : entryField.value});
         }
      }
      return params;
   },

   prefillScreen : function() {
      var url = new URI(this.uri.value);

      this.protocolEF.value    = url.protocol;
      this.hostEF.value        = url.host;
      this.credentialsEF.value = url.credentials;
      this.portEF.value        = url.port;
      this.pathEF.value        = url.path;
      this.refEF.value         = url.reference;

      for (i in url.getParameters) {
         this.addGetParameterRow(url.getParameters[i].name, url.getParameters[i].value);
      }
   },

   addGetParameterRow : function(name, value) {
      var item = document.createElement('listitem');
      item.setAttribute("allowevents", true);
      item.setAttribute("tamper.name", name);
      item.appendChild(this.createCell(name));

      var ef = this.createEntryField(name, value);
      item.setAttribute("tamper.ef.name", ef.getAttribute("id"));
      item.appendChild(ef);

      this.getParametersList.appendChild(item);
   },

   createCell : function(text) {
      var cell = document.createElement("listcell");
      cell.setAttribute("label", text);
      return cell;
   },

   createEntryField : function(name, text) {
      var cell = null;
      cell = document.createElement("textbox");
      if (text) {
         cell.setAttribute("value", text);
      }
      var id = name;
      // make sure the id is unique
      while (document.getElementById(id)) {
         id += "x";
      }
      cell.setAttribute("id", id);
      return cell;
   },

   getAddPrompt : function(parent, element) {
      if (parent == this.getParametersList || element == this.getParametersList) {
         return this.langString("add.prompt.text");
      } else {
         return null;
      }
   }, 

   addItem : function(parent, element, name, data) {
      if (parent == this.getParametersList || element == this.getParametersList) {
         this.addGetParameterRow(name, data);
      }
   }
};


function URI(uri) {
   this.init(uri);
};

URI.prototype = {
   protocol : "",
   credentials : "",
   host : "",
   port : "",
   path : "",
   query : "",
   reference : "",

   init : function(uriString) {
      if (uriString) {
         var url = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
         
         url.spec = uriString;
         this.protocol = url.scheme;
         this.port = (url.port == -1 ? "" : url.port);
         this.host = url.asciiHost;
         this.credentials = url.userPass;
         url.QueryInterface(Components.interfaces.nsIURL);
         this.path = url.path;
         this.query = url.query;
         this.getParameters = new Array();
         if (this.query) {
            this.path = this.path.substring(0, this.path.indexOf("?"));
            var params = this.query.split("&");
            var nameValue;
            for (p in params) {
               nameValue = params[p].split("=");
               this.getParameters.push({name : nameValue.shift(), value : nameValue.join("=")});
            }
         }
         this.reference = url.ref;
         if (this.reference && (this.path.indexOf("#") > 0)) {
            this.path = this.path.substring(0, this.path.indexOf("#"));
         }            
      }

   },

   toString : function() {
      var uriString = "";
      if (this.protocol && this.host) {
         uriString = this.protocol + "://";
         if (this.credentials) {
            uriString += this.credentials + "@";
         }
         uriString += this.host;
         if (this.port) {
            uriString += ":" + this.port;
         }
      }
      uriString += this.path;
      if (this.getParameters) {
         var first = true;
         var nameValue;
         for (var p in this.getParameters) {
            if (first) {
               first = false;
               uriString += "?";
            } else {
               uriString += "&";
            }
            nameValue = this.getParameters[p];
            uriString += nameValue.name;
            if (nameValue.value) {
               uriString += "=" + nameValue.value;
            }
         }
      }
      if (this.reference) {
         uriString += "#" + this.reference;
      }
      return uriString;
   }
};
