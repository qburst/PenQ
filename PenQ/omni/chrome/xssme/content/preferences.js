/*
Copyright 2007 Security Compass

This file is part of XSS Me.

XSS Me is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

XSS Me is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with XSS Me.  If not, see <http://www.gnu.org/licenses/>.

If you have any questions regarding XSS Me please contact
tools@securitycompass.com
*/

/**
 * prefereneces.js 
 * @requires JSON
 * @requires AttackStringContainer
 * @requires util.js
 */
function PreferencesController() {
    this.init();
}

PreferencesController.prototype = {
    init: function(){
        getAttackStringContainer();
        
        var attacks = attackStringContainer.getStrings();
        if (attacks.length) {
            this.makeUI(attacks);
        }
        else {
            var label = document.getElementById('noattackslbl');
            label.style.visibility = 'visible';
        }
    }
    ,
    makeUI: function(attacks, aWindow){
        var theWindow
        if (typeof(aWindow) === 'undefined' || !aWindow){
            theWindow = window;
        }
        else {
            theWindow = aWindow;
        }
        
        var listbox = theWindow.document.getElementById('existingXSSstrings');
        while (listbox.itemCount > 0) {
            listbox.removeItemAt(0);
        }
        for(var i = 0; i < attacks.length; i++){
                listbox.insertItemAt(i, attacks[i].string, i);
        }
    }
    ,
    removeAttack: function(){
        this.removeItem(getAttackStringContainer(), 'existingXSSstrings');
    }
    ,
    removeItem: function(container, listboxID){
        var listbox = document.getElementById(listboxID);
        var selectedAttacks = listbox.selectedItems;
        var strings = container.getStrings();
        var n = 0;
        for (var i = 0; i < selectedAttacks.length; i++){
            strings[selectedAttacks[i].value] = null;
        }
        while (n < strings.length){
            if (strings[n] === null){
                strings.splice(n, 1);
            }
            else{
                n++; //only incrememnt if attacks[n]!==null. Otherwise we'll 
                     // strings which are adjacent.
            }
        }
        container.save();
        this.makeUI(container.getStrings(), window, listboxID);
    }
    ,
    exportAttacks: function(){
        var exportDoc = document.implementation.createDocument("", "", null);
        var root = exportDoc.createElement('exportedattacks');
        var xmlAttacks = exportDoc.createElement('attacks');
        getAttackStringContainer();
        var attacks = attackStringContainer.getStrings();
        for each (var attack in attacks){
            var xmlAttack = exportDoc.createElement('attack');
            var xmlString = exportDoc.createElement('attackString');
            var xmlSig = exportDoc.createElement('signature');
//             var txtString = exportDoc.createTextNode('<![CDATA[' + encodeXML(attack.string) + ']]>');
            var txtSig = exportDoc.createTextNode(attack.sig);
            var txtString = exportDoc.createCDATASection(encodeXML(attack.string));
            xmlString.appendChild(txtString);
            xmlSig.appendChild(txtSig);
            xmlAttack.appendChild(xmlString);
            xmlAttack.appendChild(xmlSig);
            xmlAttacks.appendChild(xmlAttack);
        }
        root.appendChild(xmlAttacks);
        exportDoc.appendChild(root);
        var serializer = new XMLSerializer();
        var xml = serializer.serializeToString(exportDoc);
        dump(xml);dump('\n');

        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
        picker.init(window, "Select File To Export To", nsIFilePicker.modeSave);
        picker.appendFilter("XML Files", '*.xml');
        picker.appendFilter("All Files", '*');
        picker.defaultExtension = '.xml';
        
        var resultOfPicker = picker.show();
        if (resultOfPicker == nsIFilePicker.returnCancel){
            return false;
        }
        var exportFile = picker.file;

        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                .createInstance(Components.interfaces.nsIFileOutputStream);

        foStream.init(exportFile, 0x02 | 0x08 | 0x20, 0666, 0); // write, create, truncate
        foStream.write(xml, xml.length);
        foStream.close();
        return true;

    }
    ,
    importAttacks: function(){
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var picker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        picker.init(window, "Select File To Import From", nsIFilePicker.modeOpen);
        picker.appendFilter("XML Files", '*.xml');
        picker.appendFilter("All Files", '*');
        var resultOfPicker = picker.show();
        if (resultOfPicker == nsIFilePicker.returnCancel){
            return false;
        }
        var importFile = picker.file;
        var attackStringContainer = getAttackStringContainer();
        importAttacksFromXMLFile(importFile);
        this.makeUI(attackStringContainer.getStrings(), window);
        return true;
    }
    ,
    moveAttackStringUp: function(){
        this.moveItemUp(getAttackStringContainer(), 'existingXSSstrings');   
    }
    ,
    moveErrorStringUp: function(){
        this.moveItemUp(getErrorStringContainer(), 'existingSQLIerrStrings');   
    }
    ,
    moveItemUp: function(container, listboxID){
        var listbox = document.getElementById(listboxID);
        var selectedIndex = listbox.selectedIndex;
        var selectedItemValue = listbox.selectedItem.value
        var selectedItemLabel = listbox.selectedItem.label;
        var newValue = listbox.selectedItem.previousSibling.value;
        if (listbox.selectedItems.length != 1){
            alert("sorry, only one item can be moved at a time");
            return false;
        }

        container.swap(listbox.selectedItem.value, 
            listbox.selectedItem.previousSibling.value);
        container.save();
        
        listbox.ensureIndexIsVisible(selectedIndex  - 1);
        
        listbox.selectedItem.previousSibling.value = selectedItemValue
        
        listbox.removeItemAt(selectedIndex)
        listbox.insertItemAt(selectedIndex-1, selectedItemLabel, newValue)
        
        listbox.selectedIndex = selectedIndex - 1;
        return true;

    }
    ,
    moveAttackStringDown: function(){
        this.moveItemDown(getAttackStringContainer(), 'existingXSSstrings');   
    }
    ,
    moveErrorStringDown: function(){
        this.moveItemDown(getErrorStringContainer(), 'existingSQLIerrStrings');
    }
    ,
    moveItemDown: function(container, listboxID){
        
        var listbox = document.getElementById(listboxID);
        var selectedIndex = listbox.selectedIndex;
        var selectedItemValue = listbox.selectedItem.value
        var selectedItemLabel = listbox.selectedItem.label;
        var newValue = listbox.selectedItem.nextSibling.value;
        if (listbox.selectedItems.length != 1){
            alert("sorry, only one item can be moved at a time");
            return false;
        }

        container.swap(listbox.selectedItem.value, 
            listbox.selectedItem.nextSibling.value);
        container.save();
        
        listbox.ensureIndexIsVisible(selectedIndex  + 1);
        
        listbox.selectedItem.nextSibling.value = selectedItemValue
        
        listbox.removeItemAt(selectedIndex)
        listbox.insertItemAt(selectedIndex+1, selectedItemLabel, newValue)
        
        listbox.selectedIndex = selectedIndex + 1;
        return true;

    }
};

