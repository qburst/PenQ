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
 * This function checks whether the context menu needs to be dispalyed and then
 * makes sure that that is the state of the context menu
 */

function checkContextMenu() {
    var prefService = Components.classes['@mozilla.org/preferences-service;1'].
            getService(Components.interfaces.nsIPrefService);
    var branch = prefService.getBranch('extensions.sqlime.');
    var showContextMenu = true; //default
    dump('::checkContextMenu branch.prefHasUserValue(\'showcontextmenu\') == ');
    dump(branch.prefHasUserValue('showcontextmenu'));
    dump('\n');
    if (branch.prefHasUserValue('showcontextmenu')) {
        showContextMenu = branch.getBoolPref('showcontextmenu');
    }

    var contextMenu = document.getElementById('sqlimecontextmenu');
    dump('::checkContextMenu contextMenu == ' + contextMenu + '\n');
    dump('::checkContextMenu showcontextmenu == ');
    dump(showContextMenu +'\n');
    contextMenu.setAttribute('collapsed', !showContextMenu);
}
    
function XssOverlay() {}

XssOverlay.prototype = {
    contextMenuObserver: null
    ,
    onLoad: function() {
        
        var prefService = Components.classes['@mozilla.org/preferences-service;1'].
                getService(Components.interfaces.nsIPrefService);
        
        var branch = prefService.getBranch('');
    
        var observableBranch = branch.
                QueryInterface(Components.interfaces.nsIPrefBranch2);
        
        this.contextMenuObserver = new Xss_PrefObserver(checkContextMenu);
        
        checkContextMenu();
        
        dump('mainwindow::onLoad contextMenuObserver ==' + this.contextMenuObserver +'\n');
        
        
        observableBranch.addObserver('extensions.sqlime.showcontextmenu', this.contextMenuObserver, false);
    }
    ,
    onUnload: function() {
        var prefService = Components.classes['@mozilla.org/preferences-service;1'].
        getService(Components.interfaces.nsIPrefService);
        
        var branch = prefService.getBranch('');
        
        var observableBranch = branch.
                QueryInterface(Components.interfaces.nsIPrefBranch2);
        
        observableBranch.removeObserver('extensions.sqlime.showcontextmenu', this.contextMenuObserver)
    }
};

var xssOverlay = new XssOverlay();

window.addEventListener('load', xssOverlay.onLoad, false);
window.addEventListener('unload', xssOverlay.onUnload, false);
