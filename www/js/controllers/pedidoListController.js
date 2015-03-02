var pedidoListController = function($scope, $http, $stateParams) {
    $scope.pedidos = $localData.findAll($http, 'pedidos');
    $scope.roteiros = {};    
    $scope.helpers = $helpers;    
    $scope.deleteItem = function(pedido)
    {
        if (!confirm('Deseja mesmo excluir este pedido?'))
        {
            return 0;
        }        
        var roteiro = $scope.roteiros[pedido.__roteiro];
        roteiro.status_pedidos = STATUS_NOT_SENT;
        roteiro.errors = '';
        $localData.update($http, 'roteiros', 'sequencia', roteiro);
        $localData.delete($http, 'pedidos', '__id', pedido.__id);
        $scope.pedidos = $localData.findAll($http, 'pedidos');        
    };
    var roteiro;
    for (var i in $scope.pedidos)
    {
        roteiro = $scope.pedidos[i].__roteiro;
        $scope.roteiros[roteiro] = $localData.find($http, 'roteiros', 'sequencia', roteiro);        
    }
};