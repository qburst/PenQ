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
 * preferenceStringContainer.js
 * requires JSON.
 */
 

/**
 * the PreferenceStringContainer object is a base class for any kind of object 
 * which has deal with an array of strings held in preferences. 
 * (e.g. AttackStringContainer, ResultStringContainer).
 */
function PreferenceStringContainer() {
    this.strings = Array();
    this.prefBranch = null;
    this.prefService = Components.classes['@mozilla.org/preferences-service;1'].
            getService(Components.interfaces.nsIPrefService);
}
dump('creating... preferenceStringContainer object\n');
PreferenceStringContainer.prototype = {
    /**
     * init is responsible for reading and loading a preference into 
     */
    init: function() {
        
    }
    ,
    getStrings: function(force){
        if (force === true){
            this.init();
        }
        return this.strings;
    }
    ,
    addString: function(string, signature) {
        dump('PreferenceStringContainer::addString: ' + string+ ' ' + signature + '\n');
        if (!string) {
            return false;
        }
        
        var preference = new Object();
        preference.string = string;
        preference.sig = signature;
        if (this.strings.every(checkUnique, preference)){
            this.strings.push(preference);
            this.save();
            return true;
        }
        else {
            return false;
        }
    }
    ,
    /**
     * save is responsible for taking this.strings and saving it into 
     * preferences.
     */
    save: function() {    
    }
    ,
    swap: function (index1, index2){
        if (typeof(this.strings[index1]) === "undefined" || 
            this.strings[index1] === null || 
            typeof(this.strings[index2]) === "undefined" || 
            this.strings[index2] === null)
        {
            return false;
        }
        
        [this.strings[index2], this.strings[index1]] = 
                [this.strings[index1], this.strings[index2]]
            
        this.save();
        
        return true;
}
};

/**
 * used by addString to ensure that a given (in this.string) is not in the 
 * container
 */
function checkUnique(element, index, array){
    dump("checkunique: " + (this.string) + " " + (element.string) + " \n");
    dump("checkunique: " + (this.string != element.string) + " \n");
    return this.string != element.string;
}
