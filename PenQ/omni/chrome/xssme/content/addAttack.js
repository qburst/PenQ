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

function onOk() {
    var stringTxtBox = document.getElementById('attackstringtxtbox');
    var sigTxtBox = document.getElementById('sigtxtbox');
    var attackStrContainer = window.arguments[0];
    var prefController = window.arguments[1];
    var prefWindow = window.arguments[2];
    
    
    if (!stringTxtBox.value.length)
    {
        alert("Please enter an attack string");
        stringTxtBox.select();
        return false;
    }
    if (!sigTxtBox.value.length){
        alert("Please enter a signature to identify you by.");
        sigTxtBox.select();
        return false;
    }
    
    if (attackStrContainer.addString(stringTxtBox.value, sigTxtBox.value)){
        prefController.makeUI(attackStrContainer.getStrings(), prefWindow, 
                'existingSQLIstrings');
        return true;
    }
    else{
        alert("couldn't add your attack string");
        return false;
    }
    
    
}

function onCancel(){
    
    return true;
}