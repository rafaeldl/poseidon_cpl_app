clienteDetalheController = function($scope, $http, $stateParams) {
    $scope.loading = true;
    $localData.genericQuery($http, "SA1", true, function(data) {
        $scope.loading = false;
        data = data.data[0];
        if (data) {
            $scope.cliente = data;
            $scope.roteiro = $localData.findBy($http, "roteiros", {
                cliente: data.A1_COD,
                lojacli: data.A1_LOJA
            });
            if ($scope.roteiro) {
                $scope.condPag = $localData.find($http, "condicao-pagamento", "E4_CODIGO", $scope.roteiro.zfrec);
                $scope.forReceb = $localData.find($http, "forma-recebimento", "ZJ2_COD", $scope.roteiro.condpag);
            }
        } else {
            alert("Não foi possível obter as informações do cliente");
        }
    }, function() {
        $scope.loading = false;
        alert("Não foi possível obter as informações do cliente");
    }, "filter=A1_LOJA:" + $stateParams["lojaId"] + ",A1_COD:" + $stateParams["clienteId"]);
};