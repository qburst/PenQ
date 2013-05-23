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

function onOk() {
    var stringTxtBox = document.getElementById('errorstringtxtbox');
    var errorStrContainer = window.arguments[0];
    var prefController = window.arguments[1];
    var prefWindow = window.arguments[2];
    
    
    if (!stringTxtBox.value.length)
    {
        alert("Please enter an error string");
        stringTxtBox.select();
        return false;
    }
    var wasStringAdded = errorStrContainer.addString(stringTxtBox.value, null);
    
    dump('was this string (' + stringTxtBox.value + ') added? ' + 
            wasStringAdded + '\n');
    
    if (wasStringAdded){
        prefController.makeUI(errorStrContainer.getStrings(), prefWindow, 
                'existingSQLIerrStrings');
        return true;
    }
    else{
        alert("couldn't add your error string");
        return false;
    }
    
    
}

function onCancel(){
    
    return true;
}