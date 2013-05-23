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
// TamperPreferences is the object we use to set and get things
// from the Moxilla Preferences system
//
// We don't listen for changes at this point.
//
function TamperPreferences() {
   this.init();
}


TamperPreferences.PREFILL_PREFIX         = "prefill.static.";
TamperPreferences.DYNAMIC_PREFILL_PREFIX = "prefill.dynamic.";

TamperPreferences.prototype = {
   PREFERENCES_ROOT     : "extensions.tamperdata.",
   TAMPER_IMAGES        : "shouldTamperImages",
   ADD_REPLACE_EXISTING : "shouldAddOverwritesExisting", 
   FORCE_CACHING        : "forceCaching", 
   TAMPER_DEBUG         : "debug",

   init : function() {
      // connected to the preferences system etc.
      this.root = Components.classes["@mozilla.org/preferences-service;1"].
                     getService(Components.interfaces.nsIPrefService).
                     getBranch(this.PREFERENCES_ROOT);
   },


   getString : function(value) {
      return this.root.getCharPref(value);
   },

   setString : function(key, value) {
      return this.root.setCharPref(key, value);
   },

   removeString : function(key) {
      TamperUtils.log("Removing string: " + key);
      this.root.clearUserPref(key);
   },

   get shouldTamperImages() {
      return this.getString(this.TAMPER_IMAGES) == "true";
   },

   set shouldTamperImages(value) {
      this.setString(this.TAMPER_IMAGES, value ? "true" : "false");
   },

   set shouldAddReplaceExisting(value) {
      this.setString(this.ADD_REPLACE_EXISTING, value ? "true" : "false");
   },

   get shouldAddReplaceExisting() {
      return this.getString(this.ADD_REPLACE_EXISTING) == "true";
   },

   set forceCaching(value) {
      this.setString(this.FORCE_CACHING, value ? "true" : "false");
   },

   get forceCaching() {
      return this.getString(this.FORCE_CACHING) == "true";
   },

   removeMenuEntry : function(prefix, key) {
      // this doesn't work
      // this.root.resetBranch(key);
      // loop through the sub elements and reset them.
      var items = this.getPrefillItems(prefix, key);
      for (var item in items) {
         this.removeMenuItem(items[item].key);
      }
   },

   removeMenuItem : function(key) {
      this.removeString(key);
   },

   getPrefillItems : function(prefix, key) {
      var items = new Array();
      var count = {};
      var bigKey = prefix + key;
      var keyLength = bigKey.length;
      if (key) {
         // we'll get another "."
         keyLength++;
      }
      try {
         var children = this.root.getChildList(bigKey, count);
         var itemKey, label, value;
         for (var a in children) {
            itemKey = children[a];
            label = itemKey.substring(keyLength);
            try {
               value = this.getString(itemKey);
               items.push({"key" : itemKey, "label" : label, "value" : value});
            } catch (ex) {
               TamperUtils.log("Caught an exception looking for :" + itemKey +"[" + ex + "]");
            }
         }
      } catch (e) {
         TamperUtils.log("Caught an exception looking for :" + bigKey +"[" + e + "]");
      }
      return items;
   },

   getCategories : function(prefix) {
      var items = new Array();

      var set = {};
      var allItems = this.getPrefillItems(prefix, "");
      // this is everything, 
      // loop through them, keeping onthe unique ones
      for (var i in allItems) {
         // get the key
         var key = allItems[i].label.substring(0, allItems[i].label.indexOf("."));
         if (!set[key]) {
            set[key] = "!";
            items.push(key);
         }
      }
      return items;
   }, 

   getPrefillCategories : function() {
      return this.getCategories(TamperPreferences.PREFILL_PREFIX);
   },

   getDynamicPrefillCategories : function() {
      return this.getCategories(TamperPreferences.DYNAMIC_PREFILL_PREFIX);
   },

   isDebug : function() {
      return this.getString(this.TAMPER_DEBUG) == "true";
   },

   getAllPreferences : function() {
      var items = new Array();
      var count = {};
      try {
         var children = this.root.getChildList("", count);
         var itemKey, value;
         for (var a in children) {
            itemKey = children[a];
            try {
               value = this.getString(itemKey);
               items.push({"key" : itemKey, "value" : value});
            } catch (ex) {
               TamperUtils.log("Caught an exception looking for :" + itemKey +"[" + ex + "]");
            }
         }
      } catch (e) {
         TamperUtils.log("Caught an exception looking for all items: " + e);
      }
      return items;
   },

   disableTidyExtension : function() {
      var wasEnabled = false;
      try {
         var tidyRoot = Components.classes["@mozilla.org/preferences-service;1"].
                        getService(Components.interfaces.nsIPrefService).
                        getBranch("tidy.options.");
         wasEnabled = !tidyRoot.getBoolPref("browser_disable");
         if (wasEnabled) {
            tidyRoot.setBoolPref("browser_disable", true);
         }
      } catch (e) {
         // I guess it wasn't installed...
      }
      return wasEnabled;
   }
};

