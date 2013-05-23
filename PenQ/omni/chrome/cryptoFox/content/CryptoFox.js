if(!com) var com={};
if(!com.echammas) com.echammas={};
if(!com.echammas.cryptofox) com.echammas.cryptofox={};

com.echammas.cryptofox = {
  convert: function(){
    var plainText = document.getElementById("plainText").value;
		var option = document.getElementById("optionList").value;		
		switch (option)
		{
		case "MD5 Encrypt":
			document.getElementById("plainText").value = com.echammas.cryptofox.md5.hex_md5(plainText);
  		break;
		case "Morse Code Encrypt":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.DoMorseEncrypt(plainText);
  		break;
		case "Morse Code Decrypt":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.DoMorseDecrypt(plainText);
  		break;
  		case "Reverse":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.DoReverse(plainText);
  		break;
  		case "Ceaser Encrypt":
  			var shift = prompt("Enter the shifting key:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.DoCaeserEncrypt(plainText,shift);
  		break;
  		case "Ceaser Decrypt":
  			var shift = prompt("Enter the shifting key:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.DoCaeserDecrypt(plainText,shift);
  		break;
  		case "ASCII to Hexadecimal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.A2H(plainText);
  		break;
  		case "Hexadecimal to ASCII":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.H2A(plainText);
  		break;
  		case "Decimal to Hexadecimal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.d2h(plainText);
  		break;
  		case "Hexadecimal to Decimal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.h2d(plainText);
  		break;
  		case "Decimal to Binary":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.d2b(plainText);
  		break;
  		case "Decimal to Octal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.d2o(plainText);
  		break;	
  		case "Hexadecimal to Binary":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.h2b(plainText);
  		break;
  		case "Hexadecimal to Octal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.h2o(plainText);
  		break;
  		case "Binary to Octal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.b2o(plainText);
  		break;		
  		case "Binary to Hexadecimal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.b2h(plainText);
  		break;
  		case "Binary to Decimal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.b2d(plainText);
  		break;
  		case "Octal to Binary":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.o2b(plainText);
  		break;
  		case "Octal to Decimal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.o2d(plainText);
  		break;
  		case "Octal to Hexadecimal":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.o2h(plainText);
  		break;
  		case "Binary to ASCII":
  			document.getElementById("plainText").value =  com.echammas.cryptofox.lib.b2a(plainText);
  		break;
  		case "ASCII to Binary":
  			document.getElementById("plainText").value =  com.echammas.cryptofox.lib.a2b(plainText);
  		break;		
  		case "Base 64 Encode":
  			document.getElementById("plainText").value = com.echammas.cryptofox.base64.encode64(plainText);
  		break;	
  		case "Base 64 Decode":
  			document.getElementById("plainText").value = com.echammas.cryptofox.base64.decode64(plainText);
  		break;
  		case "Generate CRC32 Checksum":
  			document.getElementById("plainText").value = com.echammas.cryptofox.crc32.crc32(plainText);
  		break;
  		case "SHA1 Encrypt":
  			document.getElementById("plainText").value = com.echammas.cryptofox.sha1.SHA1(plainText);
  		break;
 		 	case "SHA256 Encrypt":
  			document.getElementById("plainText").value = com.echammas.cryptofox.sha256.SHA256(plainText);
  		break;							
  		case "URL Encode":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.url_encode(plainText);
  		break;	
  		case "URL Decode":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.url_decode(plainText);
  		break;	
  		case "ROT-13":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.rot13(plainText);
  		break;
  		case "AES 256-bit Encrypt":
  			var pwd = prompt("Enter the password:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.aes.AESEncryptCtr(plainText,pwd,"256");
  		break;
  		case "AES 192-bit Encrypt":
  			var pwd = prompt("Enter the password:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.aes.AESEncryptCtr(plainText,pwd,"192");
  		break;
  		case "AES 128-bit Encrypt":
  			var pwd = prompt("Enter the password:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.aes.AESEncryptCtr(plainText,pwd,"128");
  		break;
  		case "AES 256-bit Decrypt":
  			var pwd = prompt("Enter the password:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.aes.AESDecryptCtr(plainText,pwd,"256");
  		break;
  		case "AES 192-bit Decrypt":
  			var pwd = prompt("Enter the password:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.aes.AESDecryptCtr(plainText,pwd,"192");
  		break;
  		case "AES 128-bit Decrypt":
  			var pwd = prompt("Enter the password:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.aes.AESDecryptCtr(plainText,pwd,"128");
  		break;
  		case "DES Encrypt":
  			var key = prompt("Enter the key:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.des.des(key,plainText,1,0);
  		break;
  		case "XOR Encrypt":
  			var key = prompt("Enter the key:", "");
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.xor_str(plainText,key);
  		break;
  		case "HTML Entities Encode":
  			document.getElementById("plainText").value = com.echammas.cryptofox.lib.encode_entities(plainText);
  		break;
 		 	case "MD5 Dictionary attack":
  			var path = prompt("Enter the full word dictionary file path:", "");
  			com.echammas.cryptofox.md5Crack.MD5DictionaryAttack(plainText,path);
  		break;			
			default:
		}
  },
  CryptoSelector: function(){
	var gSelectionListener = {
  		notifySelectionChanged: function(doc, sel, reason) {
      				document.getElementById("plainText").value = sel.toString();
      				
  		}
  	} 
  	window.content.getSelection().QueryInterface(Components.interfaces.nsISelectionPrivate).addSelectionListener(gSelectionListener);
  }
  
}
