(function() {
    var i, server, servers = [ "http://portal.cplkibon.com.br", "http://201.34.141.156", "http://192.168.1.7", "http://187.58.224.81" ];
    API_URL = "";
    for (i in servers) {
        server = servers[i];
        $helpers.ping(server, function(isOnline, server) {
            if (!API_URL && isOnline) {
                API_URL = server;
                API_URLS = {
                    produtos: API_URL + "/pedidos/produtos.json",
                    roteiros: API_URL + "/roteiros.json",
                    consulta: API_URL + "/default_query/list.json",
                    generico: API_URL + "/generic/"
                };
            }
        });
    }
})();