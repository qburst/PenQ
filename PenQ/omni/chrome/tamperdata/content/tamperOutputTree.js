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

// tree implementation for request/response output on main window
function TamperOutputTree(requests, gui) {
   this.start(requests, gui);
}

function myPush(data) {
   this.oldPush(data);
   var count = 0;
   if (this.tree.gui.currentFilter) {
      if (data.uri.toLowerCase().indexOf(this.tree.gui.currentFilter.toLowerCase()) >= 0) {
         count = this.tree.rowCount;
         this.tree.filteredData.push(data);
         this.tree.rowCountChanged(count, 1);
      }
   } else {
      count = this.tree.rowCount;
      this.tree.rowCountChanged(count, 1);
   }
   this.tree.gui.hasData = true;
}

TamperOutputTree.prototype = {
   set data(tamper) {
      var oldCount = this.rowCount;
      this.sourceData = tamper;
      this.filteredData = this.sourceData.requests;
      // hook into the push function of the array
      this.sourceData.requests.tree = this;
      this.sourceData.requests.oldPush = this.sourceData.requests.push;
      this.sourceData.requests.push = myPush;
      this.filteredData = this.sourceData.requests;
      this.rowCountChanged(0, -oldCount);
      this.gui.hasData = (this.sourceData.requests.length > 0);
      this.filter(this.gui.currentFilter);
   }, 

   start : function(tamper, gui) {
      this.gui = gui;
      this.data = tamper;
      this.tree = document.getElementById("outputTree");
      this.tree.view = this;
   },

   set rowCount(c) { 
      throw "rowCount is a readonly property"; 
   },

   get rowCount() {
      if (this.filteredData) {
         return this.filteredData.length;
      } else {
         return 0;
      }
   },

   getCellText : function(row, column) {
      var item = this.filteredData[row];
      if (item) {
         // in deer park, the column is actually a tree column, rather than an id
         if (column.id) {
            column = column.id;
         }
         if (column == "output.time") {
            return item.time;
         } else if (column == "output.duration") {
            return item.elapsedTime + " ms";
         } else if (column == "output.total.duration") {
            if (item.totalTime == 0) {
               return item.elapsedTime + " ms";
            } else {
               return item.totalTime + " ms";
            }
         } else if (column == "output.size") {
            return item.contentSize;
         } else if (column == "output.method") {
            return item.requestMethod;
         } else if (column == "output.status") {
            return item.status;
         } else if (column == "output.content.type") {
            return item.mimeType;
         } else if (column == "output.url") {
            return item.uri;
         } else if (column == "output.load.flags") {
            return item.loadFlags;
         } else {
            return "bad column: " + column;
         }
      } else {
         return "Bad row: " + row;
      }
   },

   setTree: function(treebox) { 
      this.treebox = treebox; 
   },

   isContainer: function(row) { 
      return false; 
   },
   isSeparator: function(row) { 
      return false; 
   },
   isSorted: function(row) { 
      return false; 
   },
   getLevel: function(row) { 
      return 0; 
   },
   getImageSrc: function(row, col) { 
      return null; 
   },
   getRowProperties: function(row,props) {
   },
   getCellProperties: function(row,col,props) {
   },
   getColumnProperties: function(colid, col, props) {
   },

   rowCountChanged: function(index, count) {
      if (this.treebox) {
         var lvr = this.treebox.getLastVisibleRow();
         this.treebox.rowCountChanged(index, count);
         // If the last line of the tree is visible on screen, we will autoscroll
         if (lvr <= index)  {
            this.treebox.ensureRowIsVisible(this.rowCount - 1);
         }
      }
      if (this.rowCount > 0) {
         this.gui.hasVisibleData = true;
      } else {
         this.gui.hasVisibleData = false;
      }
   },

   invalidateRow : function(index) {
      if (this.treebox) {
         this.treebox.invalidateRow(index);
      }
   },

   getCurrent : function() {
      if (this.filteredData[this.tree.currentIndex]) {
         return this.filteredData[this.tree.currentIndex];
      } else {
         return null;
      }
   },

   getText : function(all) {
      var text = "";
      var start = 0;
      var end = 0;
      if (all) {
         end = this.filteredData.length;
         for (var current = start; current < end; current++) {
            if (current > start) {
               text += "\n";
            }
            text += this.filteredData[current].toString() + "\n";
         }
      } else {
         // do some tricky stuff here to retrieve all of the
         // selected rows
         var rangeStart = new Object();
         var rangeEnd = new Object();
         var numRanges = this.tree.view.selection.getRangeCount();
         
         for (var t = 0; t < numRanges; t++){
            this.tree.view.selection.getRangeAt(t , rangeStart, rangeEnd);
            for (var v = rangeStart.value; v <= rangeEnd.value; v++){
               // now we've got the index ...
               if (t != 0 || v != 0) {
                  text += "\n";
               }
               text += this.filteredData[v].toString() + "\n";
            }
         }
      }
      return text;
   },

   getXML : function(all) {
      var text = TamperRequestResponse.XML_HEADER;
      if (all) {
         var start = 0;
         var end = this.filteredData.length;
         for (var current = start; current < end; current++) {
            text += this.filteredData[current].toXML();
         }
      } else {
         var rangeStart = {};
         var rangeEnd = {};
         var numRanges = this.tree.view.selection.getRangeCount();
         
         for (var t = 0; t < numRanges; t++){
            this.tree.view.selection.getRangeAt(t , rangeStart, rangeEnd);
            for (var v = rangeStart.value; v <= rangeEnd.value; v++){
               // now we've got the index ...
               text += this.filteredData[v].toXML();
            }
         }
      }
      text += TamperRequestResponse.XML_TRAILER;
      return text;
   },

   filter : function(value) {
      var oldRowCount = this.rowCount;
      if (value == null || value == "") {
         this.filteredData = this.sourceData.requests;
      } else {
         value = value.toLowerCase();
         this.filteredData = new Array();
         var request = null;
         for (var i = 0; i < this.sourceData.requests.length; i++) {
            request = this.sourceData.requests[i];
            if (request.uri.toLowerCase().indexOf(value) >= 0) {
            // make it a preference to filter on uri v.s. whole string
            // if (request.toString().toLowerCase().indexOf(value) >= 0) {
               this.filteredData.push(request);
            }
         }
      }
      if (this.treebox) {
         this.treebox.invalidate();
         this.rowCountChanged(0, this.rowCount - oldRowCount);
      }
   }
};
