semPedidoController = function($scope, $http, $stateParams) {
    $scope.inEdition = $stateParams["semPedidoId"];
    $scope.roteiro = $stateParams["roteiroId"];
    $scope.sem_pedido = {};
    $scope.eventos = $localData.findAll($http, "eventos", false);
    $scope.save = function() {
        if ($scope.saving) {
            return 0;
        }
        $scope.saving = true;
        var obs = document.getElementById("input-obs"), evento = document.getElementById("input-evento"), roteiro = $localData.find($http, "roteiros", "sequencia", $scope.roteiro), now = new Date();
        if (!obs.value || !evento.value) {
            alert("Preencha todos os campos para salvar");
            $scope.saving = false;
            return 0;
        }
        var list = $localData.findAll($http, "sem_pedidos");
        $scope.sem_pedido.ad5_evento = evento.value;
        $scope.sem_pedido.ad5_obs = obs.value;
        $scope.sem_pedido.__roteiro = roteiro.sequencia;
        $scope.sem_pedido.ad5_vend = roteiro.vendedor;
        $scope.sem_pedido.ad5_codcli = roteiro.cliente;
        $scope.sem_pedido.ad5_loja = roteiro.lojacli;
        $scope.sem_pedido.ad5_data = $helpers.dateToProtheusDate(now);
        $scope.sem_pedido.ad5_hora = $helpers.dateToProtheusTime(now);
        list.push($scope.sem_pedido);
        var salvaSemPedido = function(semPedido) {
            if ($scope.inEdition != "0") {
                $localData.update($http, "sem_pedidos", "__id", semPedido);
            } else {
                semPedido.__id = new Date().getTime();
                $localData.saveAll(list, "sem_pedidos");
            }
        };
        roteiro["status_sem_pedidos"] = STATUS_NOT_SENT;
        $localData.update($http, "roteiros", "sequencia", roteiro);
        syncronize = true;
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                $scope.sem_pedido.ad5_zlatit = position.coords.latitude.toFixedDown(9);
                $scope.sem_pedido.ad5_longit = position.coords.longitude.toFixedDown(9);
                salvaSemPedido($scope.sem_pedido);
                $scope.saving = false;
                window.location = "#/app/roteiros";
            }, function(error) {
                salvaSemPedido($scope.sem_pedido);
                $scope.saving = false;
                window.location = "#/app/roteiros";
            }, {
                enableHighAccuracy: true,
                timeout: 5e3,
                maximumAge: 6e5
            });
        } else {
            salvaSemPedido($scope.sem_pedido);
            window.location = "#/app/roteiros";
        }
    };
    if ($scope.inEdition != "0") {
        $scope.sem_pedido = $localData.find($http, "sem_pedidos", "__id", $scope.inEdition);
        var evento = document.getElementById("input-evento");
        setTimeout(function() {
            evento.value = $scope.sem_pedido.ad5_evento;
        }, 500);
    }
};