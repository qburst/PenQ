if(!com.echammas.cryptofox.lib) com.echammas.cryptofox.lib={};
com.echammas.cryptofox.lib = {
///
MCarr : new Array(
"*","|",".-","-...","-.-.","-..",".","..-.","--.","....","..",".---","-.-",".-..","--","-.","---",".--.","--.-",".-.","...","-","..-","...-",".--","-..-","-.--","--..","-----",".----","..---","...--","....-",".....","-....","--...","---..","----."),
ABC012arr : "*|ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
///
DoMorseDecrypt:function(x)
{
	mess="";
	apos=0;
	bpos=0;
	while(bpos<x.length)
	{
		bpos=x.indexOf(" ",apos);
		if(bpos<0){bpos=x.length};
		dits=x.substring(apos,bpos);apos=bpos+1;letter="";
		for(j=0; j< this.MCarr.length; j++){  
			if(dits==this.MCarr[j]){
 	 			letter=this.ABC012arr.charAt(j)
 	 		}  
 	 	};
		if(letter==""){letter="*"};
		mess+=letter;
	};
return mess;
},

DoMorseEncrypt:function(x)
{
	mess="";
	for(i=0; i<x.length; i++)
	{
		letter=x.charAt(i).toUpperCase();
		for(j=0; j< this.MCarr.length; j++){  
			if(letter==this.ABC012arr.charAt(j)){
				mess+=this.MCarr[j]}  
		};
		mess+=" ";
	};
mess=mess.substring(0,mess.length-1);
return mess;
},
///
DoReverse: function(x){y="";for(i=0;i<x.length;i++){y+=x.charAt(x.length-1-i);};return y},
///
caesar:function(text, k) {
  if (!(k >= 0 && k < 26)) {
    var error = 'Key should be between 0 and 25';
    return error;
  }
  var secret = text.toLowerCase();
  var encoded = '';
  var alphabet = 'abcdefghijklmnopqrstuvwxyz';
  for (var j = 0; j < secret.length; j++) {
    var index = alphabet.indexOf(secret.charAt(j));
    if (index >= 0) {
      encoded += alphabet.charAt((index + k) % 26);
    } else {
      encoded += secret.charAt(j);
    }
  }
  return encoded;
},

DoCaeserEncrypt:function(text, k) {
  var key = parseInt(k);
  return this.caesar(text, key);	
},

DoCaeserDecrypt:function(text, k) {
  var key = parseInt(k);
  return this.caesar(text, (26 - key));	
},
///
A2H:function(x)
{
	hex="0123456789ABCDEF";
	almostAscii=' !"#$%&'+"'"+'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ['+'\\'+']^_`abcdefghijklmnopqrstuvwxyz{|}';
	r="";
	for(i=0;i<x.length;i++)
	{
		letter=x.charAt(i);
		pos=almostAscii.indexOf(letter)+32;
		h16=Math.floor(pos/16);
		h1=pos%16;
		r+=hex.charAt(h16)+hex.charAt(h1);
	};
	return r;
},

H2A:function(x)
{
	hex="0123456789abcdef";
	almostAscii=' !"#$%&'+"'"+'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ['+'\\'+']^_`abcdefghijklmnopqrstuvwxyz{|}';
	r="";
	for(i=0;i<x.length;i++)
	{
		let1=x.charAt(2*i);
		let2=x.charAt(2*i+1);
		val=hex.indexOf(let1)*16+hex.indexOf(let2);
		r+=almostAscii.charAt(val-32);
	};
	return r;
},
///
getHexNum:function(num)
{
	ar1 = new Array('0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15');
	ar2 = new Array('0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F');
	if(num > 15)
	{
		return num;
	}
	else
	{
		red = ar2[num];
		return red;
	}
},

d2h:function(arg)
{
	res2 = 999;
	args = arg;
	while(args>15)
	{
		arg1 = parseInt(args/16);
		arg2 = args%16;
		arg2 = this.getHexNum(arg2);
		args = arg1;

		if(res2 == 999){
			res2=arg2.toString();
		}
		else{
			res2=arg2.toString()+res2.toString();
		}
	}
	if(args<16 && res2 != 999){
		def = this.getHexNum(args);
		res2 = def+res2.toString();
	}
	else if(res2 == 999){
		if(args < 16){
			res2 = this.getHexNum(args);
		}
		else{
			res2= 1;
		}
	}
	return res2;
},

h2d:function(h){return parseInt(h,16);},
///
d2b:function(d)
{
  var num = parseInt(d);
	return num.toString(2);
},
///
d2o:function(d)
{
  var num = parseInt(d);
	return num.toString(8);
},
///
h2b:function(hd)
{
	var len=hd.length;
	var tot=0;
	var i,j;
	for(i=0,j=len-1;i<len;i++,j--)
	{	
		ch=hd.charAt(i);
		if(ch=="a" || ch=="A"){	
			tot=tot+10;
		}
		else if(ch=="b" || ch=="B"){
			tot=tot+11;
		}
		else if(ch=="c" || ch=="C"){
			tot=tot+12;
		}
		else if(ch=="d" || ch=="D"){
			tot=tot+13;
		}
		else if(ch=="e" || ch=="E"){
			tot=tot+14;
		}
		else if(ch=="f" || ch=="F"){
			tot=tot+15;
		}
		else{
			tot=tot+parseInt(hd.charAt(i))*Math.pow(16,j);
		}
	}
	var dec=new Number(tot);
	return dec.toString(2);
},
///
h2o:function(hd)
{
	var len=hd.length;
	var tot=0;
	var i,j;
	for(i=0,j=len-1;i<len;i++,j--)
	{	
		ch=hd.charAt(i);
		if(ch=="a" || ch=="A"){	
			tot=tot+10;
		}
		else if(ch=="b" || ch=="B"){
			tot=tot+11;
		}
		else if(ch=="c" || ch=="C"){
			tot=tot+12;
		}
		else if(ch=="d" || ch=="D"){
			tot=tot+13;
		}
		else if(ch=="e" || ch=="E"){
			tot=tot+14;
		}
		else if(ch=="f" || ch=="F"){
			tot=tot+15;
		}
		else{
			tot=tot+parseInt(hd.charAt(i))*Math.pow(16,j);
		}
	}
	var dec=new Number(tot);
	return dec.toString(8);
},
///
b2o:function(bn)
{
	var len=bn.length;
	var tot=0;
	var i,j;
	for(i=0,j=len-1;i<len;i++,j--)
	{	
		tot=tot+parseInt(bn.charAt(i))*Math.pow(2,j);
	}
	var dec=new Number(tot);
	return dec.toString(8);
},

b2d:function(bn)
{
	var len=bn.length;
	var tot=0;
	var i,j;
	for(i=0,j=len-1;i<len;i++,j--)
	{	
		tot=tot+parseInt(bn.charAt(i))*Math.pow(2,j);
	}
	var dec=new Number(tot);
	return dec;
},

b2h:function(bn)
{
	var len=bn.length;
	var tot=0;
	var i,j;
	for(i=0,j=len-1;i<len;i++,j--)
	{	
		tot=tot+parseInt(bn.charAt(i))*Math.pow(2,j);
	}
	var dec=new Number(tot);
	return dec.toString(16);
},
///
o2b:function(oc)
{
	var len=oc.length;
	var tot=0;
	var i,j;
	for(i=0,j=len-1;i<len;i++,j--)
	{	
		tot=tot+parseInt(oc.charAt(i))*Math.pow(8,j);
	}
	var dec=new Number(tot);
	return dec.toString(2);
},

o2d:function(oc)
{
	var len=oc.length;
	var tot=0;
	var i,j;
	for(i=0,j=len-1;i<len;i++,j--)
	{	
		tot=tot+parseInt(oc.charAt(i))*Math.pow(8,j);
	}
	var dec=new Number(tot);
	return dec;
},

o2h:function(oc)
{
	var len=oc.length;
	var tot=0;
	var i,j;
	for(i=0,j=len-1;i<len;i++,j--)
	{	
		tot=tot+parseInt(oc.charAt(i))*Math.pow(8,j);
	}
	var dec=new Number(tot);
	return dec.toString(16);
},
///
b2a:function(bn)
{
	var hex_val = this.b2h(bn);
	return this.H2A(hex_val);
},

a2b:function(a)
{
	var hex_val = this.A2H(a);
	return this.h2b(hex_val);
},
///
url_encode:function(str) {
	var result = "";
	for (i = 0; i < str.length; i++) {
		if (str.charAt(i) == " ") result += "+";
		else result += str.charAt(i);
	}
	return escape(result);
},

url_decode:function(str) {
 	var result = str.replace(/\+/g, " ");
	return unescape(result);
},
///
rot13:function(a)
{
  if (!this.rot13map){
    this.rot13map = this.rot13init();
  }
  var s = "";
  var i;
  var entity = "";
  for (i = 0; i < a.length; i++)
  {
    var b = a.charAt(i);
    if (entity){
      entity += b;
      if (b == ';'){
        if (entity == "&lt;"){
          s += "<";
        }
        else if (entity == "&gt;"){
          s += ">";
        }
        else if (entity == "&amp;"){
          s += "&";
        }
        else{
          var matches = entity.match(this.rot13numericEntityRE);
          if (matches[1]){
            s+= String.fromCharCode(matches[1]);
          }
        }
        entity = "";
      }
    }
    else if (b == '&'){
      entity = "&";
    }
    else{
      s += (b >= 'A' && b <= 'Z' || b >= 'a' && b <= 'z' ? this.rot13map[b] : b);
    }
  }
  return s;
},

rot13map :  null,
rot13numericEntityRE : /&#(.*);/,

rot13init : function()
{
  var map = new Array();
  var s   = "abcdefghijklmnopqrstuvwxyz";
  var i;
  for (i = 0; i < s.length; i++)
  {
    map[s.charAt(i)] = s.charAt((i + 13) % 26);
  }
  for (i = 0; i < s.length; i++)
  {
    map[s.charAt(i).toUpperCase()] = s.charAt((i + 13) % 26).toUpperCase();
  }
  return map;
},
///
xor_str:function(to_enc,xor_key)
{
	var the_res="";
	for(i=0;i<to_enc.length;++i)
	{
		the_res+=String.fromCharCode(xor_key^to_enc.charCodeAt(i));
	}
	return the_res;
},
///
encode_entities:function (s){
  var result = '';
  for (var i = 0; i < s.length; i++){
    var c = s.charAt(i);
    result += {'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;'}[c] || c;
  }
  return result;
}

}//End
