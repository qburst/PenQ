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

function TamperMenu(handler) {
   this.init(handler);
}


TamperMenu.init = function(handler) {
   TamperMenu.instance = new TamperMenu(handler);
};

TamperMenu.ADD_ITEM = "add";

TamperMenu.prototype = {
   __proto__ : new TamperLanguage("tamper.menu."),

   init : function(handler) {
      this.handler = handler;
      this.menuItems = {};
      this.dynamicItems = {};
      this.preferences = new TamperPreferences();
      this.loadMenuItems();
      this.popupShowing = 0;
      this.utilityEntries = null;
      this.getUtilityEntries();
   }, 

   getUtilityEntries : function() {
      if (this.utilityEntries == null) {
         var entries = {};
         entries[this.langString("encode")]          = "TamperMenu.instance.encodeItem(document.popupNode.parentNode);";
         entries[this.langString("decode")]          = "TamperMenu.instance.decodeItem(document.popupNode.parentNode);";
         entries[this.langString("encode.64")]       = "TamperMenu.instance.encode64Item(document.popupNode.parentNode);";
         entries[this.langString("decode.64")]       = "TamperMenu.instance.decode64Item(document.popupNode.parentNode);";
         entries[this.langString("decimal.html")]    = "TamperMenu.instance.decimalHTMLItem(document.popupNode.parentNode);";
         entries[this.langString("hex.html")]        = "TamperMenu.instance.hexItem(document.popupNode.parentNode);";
         entries[this.langString("un.html")]         = "TamperMenu.instance.unHTMLItem(document.popupNode.parentNode);";
         this.utilityEntries = entries;
      }
      return this.utilityEntries;
   },
   
   loadMenuItems : function() {
      this.addItemsToList(this.menuItems, this.preferences.getPrefillCategories(), TamperPreferences.PREFILL_PREFIX);
      this.addItemsToList(this.dynamicItems, this.preferences.getDynamicPrefillCategories(), TamperPreferences.DYNAMIC_PREFILL_PREFIX);
   },

   addItemsToList : function(list, categories, prefix) {
      var key, dataEntries, entries;
      for (var item in categories) {
         key = categories[item];
         dataEntries = this.preferences.getPrefillItems(prefix, categories[item]);
         entries = {};
         for (i in dataEntries) {
            entries[dataEntries[i].label] = dataEntries[i].value;
         }
         list[key] = entries;
      }
   }, 

   getValue : function(key, item, list) {
      return this[list][key][item];
   },
   
   clearPopup : function(popup) {
      for(var i = popup.childNodes.length - 1; i >= 0; i--) {
         popup.removeChild(popup.childNodes.item(i));
      }
   },

   customizePopup : function() {
      var popup = document.getElementById("tamper.popup.popup");
      this.popupShowing++;
      if (this.popupShowing == 1) {
         this.clearPopup(popup);

         var name = document.popupNode.parentNode.getAttribute("tamper.name");
         // add some simple entries
         this.addPopupMenuItem(popup, 
                               this.langString("add.element"), 
                               "TamperMenu.instance.addItem(document.popupNode);");
         this.addPopupMenuItem(popup, 
                               this.langString("add.elements"), 
                               "TamperMenu.instance.addItems(document.popupNode);");
         this.addPopupMenuItem(popup, 
                               this.langString("add.elements.from.file"), 
                               "TamperMenu.instance.importItems(document.popupNode);");
         // evil hack for add
         var myAddMenu = document.createElement("menu");
         myAddMenu.setAttribute("label", this.langString("add"));
         var myAddPopup = document.createElement("menupopup");
         this.addPopupEntries(this.menuItems[TamperMenu.ADD_ITEM], myAddPopup, TamperMenu.ADD_ITEM, "menuItems");
         myAddMenu.appendChild(myAddPopup);
         popup.appendChild(myAddMenu);

         if (name) {
            this.addPopupMenuItem(popup, this.langString("delete"), "TamperMenu.instance.deleteItem(document.popupNode.parentNode);");
            this.addPopupSeparator(popup);
            // now the utility entries
            var utilItems = this.getUtilityEntries();
            for (var element in utilItems) {
               this.addPopupMenuItem(popup, element, utilItems[element]);
            }
            this.addPopupSeparator(popup);
            
            // now the complex entries
            var myPopup, myMenu;
            for (var menuKey in this.menuItems) {
               // evil hack for add
               if (menuKey != TamperMenu.ADD_ITEM) {
                  myMenu = document.createElement("menu");
                  // try to look up this value in a nice way
                  myMenu.setAttribute("label", menuKey);
                  myPopup = document.createElement("menupopup");
                  this.addPopupEntries(this.menuItems[menuKey], myPopup, menuKey, "menuItems");
                  myMenu.appendChild(myPopup);
                  popup.appendChild(myMenu);
               }
            }

            this.addPopupSeparator(popup);
            // now item specific entries
            if (this.dynamicItems[name]) {
               myMenu = document.createElement("menu");
               myMenu.setAttribute("label", name);
               myPopup = document.createElement("menupopup");
               this.addPopupEntries(this.dynamicItems[name], myPopup, name, "dynamicItems");
               myMenu.appendChild(myPopup);
               popup.appendChild(myMenu);
            }
         }
      }
   },
   
   unCustomizePopup : function() {
      if (this.popupShowing > 0) {
         this.popupShowing--;
      }
   },

   addPopupEntries : function(items, popup, key, list) {
      if (items) {
         var tmpItem = null;
         for (var id in items) {
            this.addPopupItem(popup, key, id, list);
         }
      }
   },
   
   addPopupItem  : function(parent, key, id, list) {
      this.addPopupMenuItem(parent, id, "TamperMenu.instance.menuSelect(document.popupNode, '" + key + "', '" + id + "', '" + list + "');");
   },

   addPopupMenuItem : function(parent, label, oncommand) {
      var tmpItem = document.createElement("menuitem");
      tmpItem.setAttribute("label", label);
      tmpItem.setAttribute("oncommand", oncommand);
      parent.appendChild(tmpItem);
   },

   addPopupSeparator : function(popup) {
      popup.appendChild(document.createElement("menuseparator"));
   },

   encodeItem : function(element) {
      this.convertListElement(element, this.encodeData);
   },

   decodeItem : function(element) {
      this.convertListElement(element, this.decodeData);
   },

   encode64Item : function(element) {
      this.convertListElement(element, this.encode64Data);
   },

   decode64Item : function(element) {
      this.convertListElement(element, this.decode64Data);
   },

   hexItem : function(element) {
      this.convertListElement(element, this.hexData);
   },

   decimalHTMLItem : function(element) {
      this.convertListElement(element, this.decimalHTMLData);
   },

   unHTMLItem : function(element) {
      this.convertListElement(element, this.unHTMLData);
   },

   convertListElement : function(listElement, func) {
      var name = listElement.getAttribute("tamper.name");
      if (this.confirmItem(name)) {
         func.apply(this, [name, listElement.lastChild]);
      }
   },

   confirmItem : function(name) {
      if (name) {
         return true;
      } else {
         // probably right clicked where there wasn't an element
         window.alert(this.langString("select.an.element"));
         return false;
      }
   },

   changeValue : function(control) {
      if (this.handler.changeValue) {
         this.handler.changeValue(control);
      }
   },

   menuSelect : function(element, key, item, list) {
      // evil hack for add
      var listValue;
      if (key == TamperMenu.ADD_ITEM) {
         listValue = this.getValue(key, item, list);
         var elementsArray = listValue.split(",");
         this.myAddItems(elementsArray, element);
      } else {
         // element is the list we are in, so we need to get the entry field
         var name = element.parentNode.getAttribute("tamper.name");
         if (this.confirmItem(name)) {
            var control = element.parentNode.lastChild;
            listValue = this.getValue(key, item, list);
            control.value = listValue;
            this.changeValue(control);
         }
      }
   },

   addItem : function(element) {
      // element is the list we are in, so we need to get the list
      // either element is the list, or element.parentNode.parentNode
      var promptText = this.handler.getAddPrompt(element.parentNode.parentNode, element);
      if (promptText) {
         var nameValue = window.prompt(promptText);
         if (nameValue) {
            this.myAddItem(element, nameValue);
         }
      } else {
         window.alert(this.langString("nope"));
      }
   },

   addItems : function(element) {
      // element is the list we are in, so we need to get the list
      var promptText = this.handler.getAddPrompt(element.parentNode.parentNode, element);
      if (promptText) {
         var elements = window.prompt(promptText + this.langString("comma.separated"));
         if (elements) {
            var elementsArray = elements.split(",");
            this.myAddItems(elementsArray, element);
         }
      } else {
         window.alert(this.langString("nope"));
      }
   },

   importItems : function(element) {
      // element is the list we are in, so we need to get the list
      var promptText = this.langString("add.elements.from.file");
      if (promptText) {
         promptText += this.langString("select.file");

         var input = TamperUtils.loadFile(promptText);

         if (input) {
            // now parse the string, into name value pairs
            // figure out the linebreak from the character at the end of the first line
            // multiple blank lines will break this...
            var linebreak = input.match(/(?:.*)(((\n+)|(\r+))+)/m)[1];
            var inputArray = input.split(linebreak);
            this.myAddItems(inputArray, element);
         }
      } else {
         window.alert(this.langString("nope"));
      }
   },

   myAddItems : function(elementsArray, element) {
      var nameValue;
      for (var i in elementsArray) {
         nameValue = elementsArray[i];
         this.myAddItem(element, nameValue);
      }
   },

   myAddItem : function(element, nameValue) {
      var nv = nameValue.split("=");
      var name = nv[0];
      if (name) {
         var value = "put+value+here";
         if (nv[1] != undefined) {
            value = nv[1];
            // in case there were "="s in the rhs
            for (var i = 2; i < nv.length; i++) {
               value += "=" + nv[i];
            }
         }
         this.handler.addItem(element.parentNode.parentNode, element, name, value);
      }
   },

   deleteItem : function(listItem) {
      var parent = listItem.parentNode;
      var name = listItem.getAttribute("tamper.name");
      if (this.confirmItem(name)) {
         if (this.handler.deleteItem) {
            this.handler.deleteItem(listItem, name);
         }
         parent.removeChild(listItem);
      }
   },

   encodeData : function(name, element) {
      element.value = TamperUtils.escapeValue(element.value);
      this.changeValue(element);
   },

   decodeData : function(name, element) {
      element.value = TamperUtils.unescapeValue(element.value);
      this.changeValue(element);
   },

   encode64Data : function(name, element) {
      element.value = TamperUtils.encode64(element.value);
      this.changeValue(element);
   },

   decode64Data : function(name, element) {
      element.value = TamperUtils.decode64(element.value);
      this.changeValue(element);
   },

   hexData : function(name, element) {
      element.value = TamperUtils.hexHTMLValue(element.value);
      this.changeValue(element);
   },

   decimalHTMLData : function(name, element) {
      element.value = TamperUtils.decimalHTMLValue(element.value);
      this.changeValue(element);
   },

   unHTMLData : function(name, element) {
      element.value = TamperUtils.unHTMLValue(element.value);
      this.changeValue(element);
   }

};
