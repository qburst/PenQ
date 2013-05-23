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
//  TamperOptions is the controller for tamperOptions.xul
//  The TamperPreferences class is used to access the values we 
//  get and set.
//
//

function TamperOptions() {
   this.init();
}


TamperOptions.init = function() {
   TamperOptions.instance = new TamperOptions();
};

// these are things we shouldn't delete
TamperOptions.staticOptions = {"xss" : true, 
                               "sql" : true, 
                               "data": true,
                               "add" : true};

TamperOptions.prototype = {
   __proto__ : new TamperLanguage("tamper.options."),

   init : function() {
      this.preferences = new TamperPreferences();
      this.getScreenObjects();
      this.prefillScreen();
   },

   getScreenObjects : function() {
      this.tamperImageCB         = document.getElementById("tamper.options.images.CB");
      this.addReplaceExistingCB  = document.getElementById("tamper.options.addReplace.CB");
      this.forceCachingCB        = document.getElementById("tamper.options.forceCaching.CB");
      this.prefillList           = document.getElementById("tamper.options.prefillLB");
      this.itemsList             = document.getElementById("tamper.options.items.tree");
      this.prefillDeletePB       = document.getElementById("tamper.prefill.delete.PB");
      this.itemListDeletePB      = document.getElementById("tamper.itemList.delete.PB");
      this.updatePB              = document.getElementById("tamper.options.item.update");
      this.itemText              = document.getElementById("tamper.options.item.text");
   },

   prefillScreen : function() {
      this.tamperImageCB.checked        = this.preferences.shouldTamperImages;
      this.addReplaceExistingCB.checked = this.preferences.shouldAddReplaceExisting;
      this.forceCachingCB.checked       = this.preferences.forceCaching;
      this.populatePrefillList();
   },

   clearListWithHeaders : function(list) {
      var nodes = list.getElementsByTagName("listitem");
      var count = nodes.length;
      for (var i = count - 1; i >= 0; i--) {
         list.removeChild(nodes.item(i));
      }
   },
   
   populatePrefillList : function() {
      this.clearListWithHeaders(this.prefillList);
      // add static entries
      var key = null;
      var entries = this.preferences.getPrefillCategories();
      for (key in entries) {
         this.addPrefillEntry(this.prefillList, "prefill.static.", entries[key], entries[key], (TamperOptions.staticOptions[entries[key]] == undefined), true);
      }

      var canDelete = true;
      // add dynamic entries
      entries = this.preferences.getDynamicPrefillCategories();
      for (key in entries) {
         this.addPrefillEntry(this.prefillList, "prefill.dynamic.", entries[key], entries[key], canDelete, false);
      }
   },

   addPrefillEntry : function(parent, prefix, key, label, canDelete, isStatic) {
      var tmpItem = document.createElement("listitem");
      tmpItem.setAttribute("tamper.prefill.prefix",    prefix);
      tmpItem.setAttribute("tamper.prefill.key",       key);
      tmpItem.setAttribute("tamper.prefill.canDelete", canDelete);
      var tmpCell = document.createElement("listcell");
      if (isStatic) {
         tmpCell.setAttribute("label", this.langString("static") + label);
      } else {
         tmpCell.setAttribute("label", label);
      }
      tmpItem.appendChild(tmpCell);
      parent.appendChild(tmpItem);
   },

   addSeparator : function(list) {
      list.appendChild(document.createElement("menuseparator"));
   },

   tamperImagesClick : function() {
      this.preferences.shouldTamperImages = this.tamperImageCB.checked;
   },

   addReplaceExistingClick : function() {
      this.preferences.shouldAddReplaceExisting = this.addReplaceExistingCB.checked;
   },

   forceCachingClick : function() {
      this.preferences.forceCaching = this.forceCachingCB.checked;
   },

   prefillSelectionChange: function() {
      var item = this.prefillList.selectedItem;
      var canDelete = false;
      if (item != null) {
         canDelete  = item.getAttribute("tamper.prefill.canDelete");
         var prefix = item.getAttribute("tamper.prefill.prefix");
         var key    = item.getAttribute("tamper.prefill.key");
         this.populateItemsList(prefix, key);
      } else {
         this.itemText.value = "";
      }
      this.enablePrefillDelete(canDelete == "true");
   },

   populateItemsList : function(prefix, key) {
      this.clearListWithHeaders(this.itemsList);

      var items = this.preferences.getPrefillItems(prefix, key);

      var item, label, value;
      for (var i in items) {
         item  = items[i];
         key   = item.key;
         label = item.label;
         value = item.value;
         this.addItemsEntry(this.itemsList, key, label, value);
      }
      if (this.itemsList.getRowCount() > 0) {
         this.itemsList.selectItem(this.itemsList.getItemAtIndex(0));
      } else {
         this.itemText.value = "";
      }
   },

   addItemsEntry : function(parent, key, label, value) {
      var tmpItem = document.createElement("listitem");
      tmpItem.setAttribute("id",                key);
      tmpItem.setAttribute("tamper.item.value", value);
      var tmpCell = document.createElement("listcell");
      tmpCell.setAttribute("label",       label);
      tmpCell.setAttribute("tooltiptext", value);
      tmpItem.appendChild(tmpCell);
      parent.appendChild(tmpItem);
   },

   itemSelected : function() {
      var item = this.itemsList.selectedItem;
      if (item) {
         this.itemText.value = item.getAttribute("tamper.item.value");
         this.itemText.tamperItemKey = item.getAttribute("id");
         this.enableItemListDelete(true);
         this.updatePB.removeAttribute("disabled");
      } else {
         this.updatePB.setAttribute("disabled", "true");
      }
   },

   itemValueChanged : function() {
      var itemKey = this.itemText.tamperItemKey;
      var newText = this.itemText.value;
      
      TamperUtils.log("Setting value [" + itemKey + "][" + newText + "]");
      this.preferences.setString(itemKey, newText);
      var listBoxItem = document.getElementById(itemKey);
      if (listBoxItem) {   
         listBoxItem.setAttribute("tamper.item.value", newText);
      }
   },

   newMenuEntry : function() {
      // get a reference to the prompt service component.
      var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
      var staticEntry = {};
      staticEntry.value = false;
      var entryName = {};
      entryName.value = this.langString("new.value");
      var retVal = promptService.prompt(window,
                                        this.langString("new.entry"),
                                        this.langString("enter.name"),
                                        entryName, 
                                        this.langString("static.entry"),
                                        staticEntry);   

      if (retVal) {
         var prefix;
         if (!staticEntry.value) {
            prefix = "prefill.dynamic.";
         } else {
            prefix = "prefill.static.";
         }
         this.addPrefillEntry(this.prefillList, prefix, entryName.value, entryName.value, true);
         this.prefillList.selectItem(this.prefillList.getItemAtIndex(this.prefillList.getRowCount() - 1));
      }
   },

   deleteMenuEntry : function() {
      var item = this.prefillList.selectedItem;
      if (item) {
         var prefix = item.getAttribute("tamper.prefill.prefix");
         var itemKey = item.getAttribute("tamper.prefill.key");
         if (window.confirm(this.langMessage("delete.cascade.prompt", [itemKey]))) {
            TamperUtils.log("Removing menu entry: " + prefix + itemKey);
            this.preferences.removeMenuEntry(prefix, itemKey);
            this.prefillList.removeChild(item);
            this.prefillList.selectItem(this.prefillList.getItemAtIndex(0));
         }
      }
   },

   newItem : function() {
      var item = this.prefillList.selectedItem;
      if (item != null) {
         var prefix = item.getAttribute("tamper.prefill.prefix");
         var key = item.getAttribute("tamper.prefill.key");
         var newLabel = window.prompt(this.langString("enter.label"));
         if (newLabel) {
            var itemKey = prefix + key + "." + newLabel;
            var value = "bogus value";
            this.addItemsEntry(this.itemsList, itemKey, newLabel, value);
            this.preferences.setString(itemKey, value);
            this.itemsList.selectItem(this.itemsList.getItemAtIndex(this.itemsList.getRowCount() - 1));
         }
      } else {
         window.alert(this.langString("no.selection"));
      }
   },

   deleteItem : function() {  
      var item = this.itemsList.selectedItem.firstChild;
      if (item && this.itemText.tamperItemKey) {
         if (window.confirm(this.langMessage("delete.prompt", [item.getAttribute("label")]))) {
            TamperUtils.log("Removing menu item: " + this.itemText.tamperItemKey);
            this.preferences.removeMenuItem(this.itemText.tamperItemKey);
            this.prefillSelectionChange();
         }
      }
   },

   enablePrefillDelete : function(enable) {
      this.enable(this.prefillDeletePB, enable);
   },

   enableItemListDelete : function(enable) {
      this.enable(this.itemListDeletePB, enable);
   },

   enable : function(control, enable) {
      if (enable) {
         control.removeAttribute("disabled");
      } else {
         control.setAttribute("disabled", "true");
      }
   },

   importPreferences : function() {
      var input = TamperUtils.loadFile(this.langString("select.file"));
      if (input) {
         // now parse the string, and update the preferences.         
         // figure out the linebreak from the character at the end of the first line
         var linebreak = input.match(/(?:\[[Tt]amper[Dd]ata\])(((\n+)|(\r+))+)/m)[1];
         var inputArray = input.split(linebreak);
         
         var headerRe = /\[[Tt]amper[Dd]ata\]/;
         if (headerRe.test(inputArray[0])) {
            var keyValue, key, value;
            // skip the first line
            for(var current = 1; current < inputArray.length; current++) {
               keyValue = inputArray[current].split('" = "');
               key = keyValue[0].substring(1);
               value = keyValue[1].substring(0, keyValue[1].length - 1);
               this.preferences.setString(key, value);
            }
            this.prefillScreen();
         } else {
            window.alert(this.langString("file.not.valid"));
         }
      }
   },

   exportPreferences : function() {
      var prefString = "[TamperData]";
      var prefValues = this.preferences.getAllPreferences();
      var key, value, output;
      for (var item in prefValues) {
         key   = prefValues[item].key;
         value = prefValues[item].value;
         prefString += '\n"' + key + '" = "' + value + '"';
      }
      TamperUtils.writeFile(this.langString("select.file"), prefString);
   }
};
