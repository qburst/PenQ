HackBar.Strings = {
	
	hackBarUsefullStrings : {
	    pi: "3,14159265",
	    phi: "1.618033988749895",
	    piBig: "3,14159265358979323846264338327950288419716939937510",
	    lorem: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
	    fibonacci: "0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, ...",
	    alert: "alert(String.fromCharCode(88, 83, 83))"
	  },
	
	addslashes : function () {
		var txt = hackBar.getSelectedText();
		txt = txt.replace(/\\/g, '\\\\');
		txt = txt.replace(/\'/g, "\\'");
		txt = txt.replace(/\"/g, '\\"');
		hackBar.setSelectedText(txt);
	}, 
	
	stripslashes : function () {
		var txt = hackBar.getSelectedText();
		txt = txt.replace(/\\'/g, '\'');
		txt = txt.replace(/\\"/g, '"');
		txt = txt.replace(/\\\\/g, '\\');
		hackBar.setSelectedText(txt);
	}, 
	
	stripspaces : function () {
		var txt = hackBar.getSelectedText();
		txt = txt.replace(/ /g, '');
		hackBar.setSelectedText(txt);
	}, 
	
	getUsefullString : function (key) {
		hackBar.setSelectedText(this.hackBarUsefullStrings[key]);
	}, 
	
	// Used by Overflow menu option.
	// Returns a 'A's string to test overflows and application limits
	generateOverflowString : function (stringLength) {
		var result = "";
		while (stringLength < 1) {
			stringLength = prompt("Length of the string to use in the overflow:", "1337");
			stringLength = Math.min(4096, parseInt(stringLength, 10));
		}
		
		for (var i = 0; i < stringLength; i++) {
			result += "A";
		}
		hackBar.setSelectedText(result);
	}, 
	
	// Reverse a string 
	reverseString : function () {
		var originalString = hackBar.getSelectedText();
		var splitext = originalString.split("");
		var revertext = splitext.reverse();
		var reversed = revertext.join("");
		hackBar.setSelectedText(reversed);
	}
}
 