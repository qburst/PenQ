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

var oDetailDialog = null;
function onDetailsDialogLoad() {
   oDetailDialog = new TamperDetailDialog(window.arguments[0], window.arguments[1]);
   oDetailDialog.loadValues();
}

function TamperDetailDialog(type, value) {
   this.init(type, value);
}

TamperDetailDialog.prototype = {
   init : function(type, value) {
      this.type = type;
      this.value = value;
      this.list = document.getElementById("detailsList");
      this.encoded = true;
   },

   hasValues : function() {
      return this.value != null;
   },

   isSpecial : function() {
      return this.type == "Cookie" || this.type == "Set-Cookie" || this.type == "POSTDATA";
   },

   // move these values into the tamper class, the gui should really just be displaying an array.
   getSplitValue : function() {
      var splitValue = "&";
      if (this.type == "Cookie") {
         splitValue = " ";
      } else if (this.type == "Set-Cookie") {
         splitValue = "\n";
      }
      return splitValue;
   },

   loadValues : function() {
      this.clear();
      if (this.hasValues() != null) {
         if (this.isSpecial()) {
            var data = this.value.split(this.getSplitValue()); 
            for (i in data) {
               var nameValue = data[i].split("=");
               var name = nameValue[0];
               var val = data[i].substring(nameValue[0].length + 1);
               this.addItem(name, val);
            }
         } else {
            this.addItem(this.type, this.value);
         }
      }
   },

   clear : function() {
      var nodes = this.list.getElementsByTagName("listitem");
      var count = nodes.length;
      for (var i = count - 1; i >= 0; i--) {
         this.list.removeChild(nodes.item(i));
      }
   },

   addItem : function(name, value) {
      var item = document.createElement('listitem');
      item.setAttribute("tamper.name", name);
      item.setAttribute("tamper.value", value);
      var child = document.createElement("listcell");
      child.setAttribute("label", this.encodeDecode(name));
      item.appendChild(child);
      child = document.createElement("listcell");
      child.setAttribute("label", this.encodeDecode(value));
      item.appendChild(child);
      this.list.appendChild(item);
   },

   encodeDecode : function(value) {
      var fixedValue = value;
      if (!this.encoded) {
         fixedValue = unescape(value);
         fixedValue = fixedValue.replace(/\+/g, " ");
      }
      return fixedValue;
   },

   encode : function() {
      this.encoded = true;
      this.loadValues();
   },

   decode : function() {
      this.encoded = false;
      this.loadValues();
   },

   getItemStringValue : function(list, index) {
      var retVal = "";
      if (index == -1) {
         index = list.selectedIndex;
      }
      if (index >= 0) {
         var item = list.getItemAtIndex(index);
         if (item) {
            var name = item.getAttribute("tamper.name");
            var value = item.getAttribute("tamper.value");
            retVal = name + "=" + this.encodeDecode(value);
         }
      }
      return retVal;
   },

   detailsCopySelection : function() {
      TamperUtils.copyToClipboard(this.getItemStringValue(this.list, -1));
   },

   detailsCopyAll : function() {
      var rows = this.list.getRowCount();
      var retVal = "";
      for (var index = 0; index < rows; index++) {
         retVal += this.getItemStringValue(this.list, index) + "\n";
      }
      TamperUtils.copyToClipboard(retVal);
   }

};

