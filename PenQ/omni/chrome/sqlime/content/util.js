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

/**
 * util.js
 * Utility Functions.
 */

const EXTENSION_NAME = 'xssme@security.compass';

/**
 * This takes a string of a piece of encoded XML and decodes it.
 * Specifically, this checks checks for encoded nested ]]> code.
 * Note: No XML parsing or checking is done.
 * @param xmlString
 * @returns a decoded string of a piece of XML (same piece)
 */
function decodeXML(xmlString) {
    
    var regex = ']]]]><![CDATA[';
    var replaced = ']]>';
    
    return xmlString.replace(regex, replaced, 'gm');
    
}

/**
 * This takes a string of a piece of XML and decodes it.
 * Specifically, this checks checks for nested ']]>' code.
 * Note: No XML parsing or checking is done.
 * @param xmlString
 * @returns an encoded string of a piece of XML (same piece)
 */
function encodeXML(xmlString) {
    
    var regex = ']]>';
    var replaced = ']]]]><![CDATA[';
    
    return xmlString.replace(regex, replaced, 'gm');
    
}

/**
 * Takes a string and returns the string with each character encoded in html
 * entities (e.g. &#65; for A).
 */
function encodeString(str){
    var rv = "";
    for each(var letter in str){
        rv += '&#' + letter.charCodeAt() +  ';';
    }
    return rv;
}

/**
 * This imports attacks from an XML file
 */
function importAttackFromXMLString(fileContents, container) {
    
    var domParser = new DOMParser();
    dump('PreferencesController::importAttacks imported data (post decoding): \n---\n' + fileContents + '\n---\n');
            
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
    var attackStringContainer = (container === undefined) ? getAttackStringContainer() : container;
    
    for (var i = 0; i < attacksTag.childNodes.length; i++){
        
//             alert("'" + (attackTag.firstChild.firstChild.nodeName  == '#text')+"'");
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
                        sigTag.textContent);
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
}

function importAttacksFromXMLFile(importFile, container) {
    var fileContents = FileIO.read(importFile);
    return importAttackFromXMLString(fileContents, container);
}

function getMonthName(monthNumber) {
    var months = new Array();
    months[0]  = "January";
    months[1]  = "February";
    months[2]  = "March";
    months[3]  = "April";
    months[4]  = "May";
    months[5]  = "June";
    months[6]  = "July";
    months[7]  = "August";
    months[8]  = "September";
    months[9]  = "October";
    months[10] = "November";
    months[11] = "December";
    return months[monthNumber];
}

/**
 * This function checks the success whether the work tab's content document
 * match the original tab's content document (in ways that we care about).
 * @returns true if same otherwise false.
 */
function compareContentDocuments(origTabContentDocument, workTabContentDocument) {
    var rv = true; 
    if (workTabContentDocument.forms) {
        if (origTabContentDocument.forms.length ===
            workTabContentDocument.forms.length)
        {
            for (var i = 0; i < origTabContentDocument.forms.length && rv; i++) {
                if (workTabContentDocument.forms[i]){
                    if (workTabContentDocument.forms[i].elements){
                        for (var n = 0; n < origTabContentDocument.forms[i].elements.length && rv; n++){
                            if (workTabContentDocument.forms[i].elements[i]) {
                                if (origTabContentDocument.forms[i].elements[i].type !=
                                workTabContentDocument.forms[i].elements[i].type) {
                                    rv = false;
                                }
                            }
                        }
                    }
                    else {
                        rv = false;
                    }
                }
                else {
                    rv = false;
                }
            }
        }
        else {
            rv = false;
        }
    }
    else {
        rv = false;
    }
    return rv
}

function getHTMLFormElementNameOrLabel(element) {
    return element.name?element.name:element.id;
}
