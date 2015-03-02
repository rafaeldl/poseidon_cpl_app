
window.verifyVersion =  function(){

	if (localStorage['old-version'] == APP_VERSION){
		alert('Existe uma versão mais recente do aplicativo. Favor atualizar');
	}

	var lastVersionVerify = localStorage['last-version-verify'],
        now = new Date().getTime(),
        doVersionVerify = true;

	if (lastVersionVerify){
		// 3600000 = 1 hour
		doVersionVerify = (parseInt(lastVersionVerify) + 3600000) < now;
	}

	if (doVersionVerify){
		var r = new XMLHttpRequest();
		r.open("GET", "http://www.somadl.com.br/services/poseidon_cpl_app_version.php", true);
		r.onreadystatechange = function () {
			if (r.readyState != 4 || r.status != 200) return;
			if (parseFloat(r.responseText) > parseFloat(APP_VERSION)){
				localStorage['last-version-verify'] = new Date().getTime();
				localStorage['old-version'] = APP_VERSION;
				verifyVersion();
			}else{
				delete localStorage['old-version'];
			}
		};
		r.send();
	}
	
};


