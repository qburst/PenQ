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


//
// TamperLang is the object we use to set and get things
// from the Moxilla Lang system
//
// We don't listen for changes at this point.
//
function TamperLang() {
   this.init();
}

TamperLang.instance = function() {
   if (!TamperLang.myInstance) {
      TamperLang.myInstance = new TamperLang();
   }
   return TamperLang.myInstance;
};


TamperLang.STRING_BUNDLE = "chrome://tamperdata/locale/tamperData.properties";

TamperLang.prototype = {
   init : function() {
      var service = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
      this.stringBundle = service.createBundle(TamperLang.STRING_BUNDLE);
   },

   getString : function(key) {
      var value = key;
      try {
         value = this.stringBundle.GetStringFromName(key);
      } catch (e) {
         TamperUtils.log("Translation not found for: " + key);
         window.alert("Translation not found for: " + key);
      }
      return value;
   },

   getMessage : function(key, parameters) {
      var message = this.getString(key);
      for (param in parameters) {
         if (parameters[param]) {
            var regExp = new RegExp("%" + param, "g");
            message = message.replace(regExp, parameters[param]);
         }
      }
      return message;
   }
};

function TamperLanguage(prefix) {
   this.langPrefix = prefix;
};

TamperLanguage.prototype = {
   langString : function(key) {
      return TamperLang.instance().getString(this.langPrefix + key);
   },

   langMessage : function(key, parameters) {
      return TamperLang.instance().getMessage(this.langPrefix + key, parameters);
   }
};