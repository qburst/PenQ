/*
Copyright 2007 Security Compass

This file is part of SQL Inject Me.

SQL Inject Me is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

SQL Inject Me is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with SQL Inject Me.  If not, see <http://www.gnu.org/licenses/>.

If you have any questions regarding SQL Inject Me please contact
tools@securitycompass.com
*/

/* prefereneces.js 
 * @requires JSON
 * @requires AttackStringContainer
 * @requires util.js
 */

function PreferencesController() {
    this.init();
}

PreferencesController.prototype = {
    init: function(){
        
        var attacks = getAttackStringContainer().getStrings();
        var errorStrings = getErrorStringContainer().getStrings();
        
        if (attacks.length) {
            this.makeUI(attacks, null, 'existingSQLIstrings');
        }
        else {
            var label = document.getElementById('noattackslbl');
            label.style.visibility = 'visible';
        }
        
        if (errorStrings.length){
            this.makeUI(errorStrings, null, 'existingSQLIerrStrings');   
        }
        else {
            var label = document.getElementById('noerrorslbl');
            label.style.visibility = 'visible';
        }
    }
    ,
    makeUI: function(attacks, aWindow, listboxID){
        var theWindow
        if (typeof(aWindow) === 'undefined' || aWindow === null || !aWindow){
            theWindow = window;
        }
        else {
            theWindow = aWindow;
        }
        
        var listbox = theWindow.document.getElementById(listboxID);
        
        while(listbox.itemCount > 0){
            listbox.removeItemAt(0);
        }
        
        for(var i = 0; i < attacks.length; i++){
                listbox.insertItemAt(i, attacks[i].string, i);
        }
    }
    ,
    removeError: function(){
        this.removeItem(getErrorStringContainer(), 'existingSQLIerrStrings');    
    }
    ,
    removeAttack: function(){
        this.removeItem(getAttackStringContainer(), 'existingSQLIstrings');
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
            var txtString = exportDoc.createCDATASection(
                    encodeXML(attack.string));
            var txtSig = exportDoc.createTextNode(attack.sig);
            xmlString.appendChild(txtString);
            xmlSig.appendChild(txtSig);
            xmlAttack.appendChild(xmlString);
            xmlAttack.appendChild(xmlSig);
            xmlAttacks.appendChild(xmlAttack);
        }
        root.appendChild(xmlAttacks);
        var xmlErrStrings = exportDoc.createElement('results');
        var errorStrings = getErrorStringContainer().getStrings();
        for each (var errStr in errorStrings){
            var xmlError = exportDoc.createElement('resultString');
            var txtString = exportDoc.
                    createCDATASection(encodeXML(errStr.string));
            xmlError.appendChild(txtString);
            xmlErrStrings.appendChild(xmlError);
        }
        root.appendChild(xmlErrStrings);
        exportDoc.appendChild(root);
        var serializer = new XMLSerializer();
        var xml = serializer.serializeToString(exportDoc);
        dump(xml);dump('\n');

        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
        picker.init(window, "Select File To Export To", nsIFilePicker.modeSave);
        picker.appendFilter('XML Files', '*.xml');
        picker.appendFilter('All Files', '*');
        picker.defaultExtension - '.xml';
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
        picker.appendFilter('XML Files', '*.xml');
        picker.appendFilter('All Files', '*');
        var resultOfPicker = picker.show();
        if (resultOfPicker == nsIFilePicker.returnCancel){
            return false;
        }
        var importFile = picker.file;
        
        var fileContents = FileIO.read(importFile);
        var domParser = new DOMParser();
        var dom = domParser.parseFromString(fileContents, "text/xml");

        if(dom.documentElement.nodeName == "parsererror"){
            alert("error while parsing document, ensure that the document is complete and uncorrupted.");
            return false;
        }
        
        var attacksTags = dom.getElementsByTagName("attacks");
        if (attacksTags.length != 1){
            alert("couldn't find attacks tag. Error while processing document.");
            return false;
        }
        
        var attacksTag = attacksTags[0];
        var attackTags = new Array();
        var attackStringContainer = getAttackStringContainer();
        
        for (var i = 0; i < attacksTag.childNodes.length; i++){
            dump("::importAttacks()... (" + attacksTag + "== attacksTag) attacksTag[" + i + "] == " + attacksTag.childNodes[i] + "\n");
            if ("attack" === attacksTag.childNodes[i].nodeName){
                attackTags.push(attacksTag.childNodes[i]);
            }
        }
        if (attackTags.length){
            for each(var attackTag in attackTags){
                var stringTag = null;
                var sigTag = null;
                for each(var tag in attackTag.childNodes){
                    dump("::importAttacks()... (looking for attackString and sig) " + tag.nodeName +  "\n");
                    if (tag.nodeName === "attackString"){
                        dump("got attackString\n");
                        stringTag = tag;
                    }
                    else if (tag.nodeName === "signature"){
                        dump("got sigString\n");
                        sigTag = tag;   
                    }
                }
                if (stringTag === null || sigTag === null){
                    alert("Couldn't import attack. Couldn't find stringAttack or signature tags. Error while processing the document. ");
                    this.makeUI(attackStringContainer.getStrings(), window); // just in case.
                    return false;
                }
                else{
                    if (stringTag.childNodes.length !== 0)
                    {
                        
                        attackStringContainer.addString(
                            decodeXML(stringTag.textContent),
                            sigTag.firstChild.nodeValue);
                    }
                    else {
                        alert("Couldn't import attack. attackString is empty. Error while processing the document. ");
                        this.makeUI(attackStringContainer.getStrings(), window); // just in case.
                        return false;
                    }
                }
            }
        }
        else {
            alert("Couldn't find any attacks. No Attacks imported.");
            return false;            
        }
        
        var errStrings = dom.getElementsByTagName('results');
        if (errStrings.length === 1) {
            var errStrings = errStrings[0];
            var errTags = new Array();
            for each(var errTag in errStrings.childNodes){
                if (errTag.nodeName == 'resultString') {
                    errTags.push(errTag);
                }
            }
            
            if (errTags.length) {
                var errStringContainer = getErrorStringContainer();
                for each(var errTag in errTags) {
                    dump('preference.js::importAttacks errTag.textContent == ' + errTag.textContent + '\n');
                    errStringContainer.addString(decodeXML(errTag.textContent), null);
                }
            }
        }
        this.makeUI(getAttackStringContainer().getStrings(), window, 'existingSQLIstrings');
        this.makeUI(getErrorStringContainer().getStrings(), window, 'existingSQLIerrStrings');
        return true;
    }
    ,
    moveAttackStringUp: function(){
        this.moveItemUp(getAttackStringContainer(), 'existingSQLIstrings');   
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
        if (listbox.selectedItem.previousSibling == null) { 
            return false; 
        } 
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
        this.moveItemDown(getAttackStringContainer(), 'existingSQLIstrings');   
    }
    ,
    moveErrorStringDown: function(){
        this.moveItemDown(getErrorStringContainer(), 'existingSQLIerrStrings');
    }
    ,
    moveItemDown: function(container, listboxID){
        var listbox = document.getElementById(listboxID);
        var selectedIndex = listbox.selectedIndex;
        var selectedItem = listbox.selectedItem; 
 
        if (selectedIndex + 1 >= listbox.getRowCount()) { 
            return true; 
        }         
         
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
        
        if (selectedIndex + 2 >= listbox.getRowCount()) { 
             
            listbox.selectedItem = listbox.getItemAtIndex(listbox.getRowCount() -1) 
            this.moveItemUp(container, listboxID) 
            listbox.selectedIndex = listbox.getRowCount() -1 
             
             
        } 
        else { 
            listbox.removeItemAt(selectedIndex)
            listbox.insertItemAt(selectedIndex+1, selectedItemLabel, newValue) 
            listbox.selectedIndex = ++selectedIndex ; 
        } 
         
        listbox.ensureIndexIsVisible(selectedIndex ); 
         
        return true;
    }
};

