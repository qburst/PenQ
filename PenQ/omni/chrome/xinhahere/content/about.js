  
  function init() {
	sizeToContent();
	
		editor = window.opener.xinha_editors['myTextArea'];
		var plugins = document.getElementById("plugins");
		if (editor) {
			var html = "";
			var j = 0;
			
			for (var i in editor.plugins) {
		    	var info = editor.plugins[i];
		    	if (typeof info != 'object' || !info.name || typeof info.name !='string') continue;
				
				var item = document.createElement('row');
				
				var child = document.createElement('label');
				child.setAttribute('value',info.name + " v" + info.version);
				item.appendChild(child);
				
				child = document.createElement('label');
				child.setAttribute('value',info.developer);
				child.setAttribute('class', 'text-link');
				child.setAttribute('href', info.developer_url);
				//child.setAttribute('onclick','pluginclick(this);');
				item.appendChild(child);
				
				child = document.createElement('label');
				child.setAttribute('value',info.sponsor);
				child.setAttribute('class', 'text-link');
				child.setAttribute('href', info.sponsor_url);
				//child.setAttribute('onclick','pluginclick(this);');
				item.appendChild(child);
				
				child = document.createElement('label');
				child.setAttribute('value',info.license);
				item.appendChild(child);
				
				document.getElementById('pluginrows').appendChild(item)
		   		++j;
			}
			if (j == 0) {
				plugins.value = "No plugins have been loaded";
			} else {
				plugins.value = "The following plugins have been loaded:"+ html;
				sizeToContent();
			}
		
	}
  }