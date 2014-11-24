semPedidoListController = function($scope, $http, $stateParams) {
    $scope.semPedidos = $localData.findAll($http, "sem_pedidos");
    $scope.roteiros = {};
    $scope.helpers = $helpers;
    $scope.deleteItem = function(semPedido) {
        if (!confirm("Deseja mesmo excluir este registro?")) {
            return 0;
        }
        var roteiro = $scope.roteiros[semPedido.__roteiro];
        roteiro.status_pedidos = STATUS_NOT_SENT;
        roteiro.errors = "";
        $localData.update($http, "roteiros", "sequencia", roteiro);
        $localData.delete($http, "sem_pedidos", "__id", semPedido.__id);
        $scope.semPedidos = $localData.findAll($http, "sem_pedidos");
    };
    var roteiro;
    for (var i in $scope.semPedidos) {
        roteiro = $scope.semPedidos[i].__roteiro;
        $scope.roteiros[roteiro] = $localData.find($http, "roteiros", "sequencia", roteiro);
    }
};