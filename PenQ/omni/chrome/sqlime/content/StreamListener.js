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
 * StreamListener
 */
function StreamListener(attackRunner, resultsManager) {
    this.attackRunner = attackRunner;
    this.resultsManager = resultsManager;
    this.done = false;
    this.data = "";
}

StreamListener.prototype = {
    // nsIStreamListener
    onStartRequest: function (aRequest, aContext) {
        //do nothing...
    }
    ,
    onDataAvailable: function (aRequest, aContext, aStream, aSourceOffset, aLength) {
        var scriptableInputStream = 
        Components.classes["@mozilla.org/scriptableinputstream;1"]
            .createInstance(Components.interfaces.nsIScriptableInputStream);
        scriptableInputStream.init(aStream);
        
        this.data += scriptableInputStream.read(aLength);
    }
    ,
    onStopRequest: function (aRequest, aContext, aStatus) {
        if (this.done === false) {
            this.done = true;
            
            dump('\n---- Here is the raw source of the result:----\n')
            dump(this.data);
            dump('\n--- end of raw source ---');
            
            this.resultsManager.evaluateSource(this);
        }
    }
    ,
    // nsIChannelEventSink
    onChannelRedirect: function (aOldChannel, aNewChannel, aFlags) {
    },
    // nsIInterfaceRequestor
    getInterface: function (aIID) {
        try {
            return this.QueryInterface(aIID);
        } catch (e) {
            throw Components.results.NS_NOINTERFACE;
        }
    }
    ,
    // nsIProgressEventSink (not implementing will cause annoying exceptions)
    onProgress : function (aRequest, aContext, aProgress, aProgressMax) {
    }
    ,
    onStatus : function (aRequest, aContext, aStatus, aStatusArg) {
    }
    ,
    // nsIHttpEventSink (not implementing will cause annoying exceptions)
    onRedirect : function (aOldChannel, aNewChannel) {
    }
    ,
    // we are faking an XPCOM interface, so we need to implement QI
    QueryInterface : function(aIID) {
        if (aIID.equals(Components.interfaces.nsISupports) ||
            aIID.equals(Components.interfaces.nsIInterfaceRequestor) ||
            aIID.equals(Components.interfaces.nsIChannelEventSink) || 
            aIID.equals(Components.interfaces.nsIProgressEventSink) ||
            aIID.equals(Components.interfaces.nsIHttpEventSink) ||
            aIID.equals(Components.interfaces.nsIStreamListener))
        {
            return this;
        }
    
        throw Components.results.NS_NOINTERFACE;
    }
};
