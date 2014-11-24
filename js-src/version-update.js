
(function(){

	var lastVersionVerify = localStorage['last-version-verify'],
    now = new Date().getTime();
    doVersionVerify = true;

	if (lastVersionVerify){
		// 259200000 = 3 days
		doVersionVerify = (parseInt(lastVersionVerify) + 2592e5) < now;
	}

	if (doVersionVerify){
		var r = new XMLHttpRequest(); 
		r.open("GET", "http://www.somadl.com.br/services/poseidon_cpl_app_version.php", true);
		r.onreadystatechange = function () {
			if (r.readyState != 4 || r.status != 200) return; 
			if (parseFloat(r.responseText) > parseFloat(APP_VERSION)){
				localStorage['last-version-verify'] = new Date().getTime();
				if (confirm('Existe uma versão mais atual do aplicativo. Deseja baixar?')){					
					navigator.app.loadUrl("http://www.somadl.com.br/poseidon_cpl.apk", {openExternal : true});
				}		
			}
		};
		r.send();
	}
	
})();


