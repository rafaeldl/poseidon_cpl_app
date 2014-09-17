clienteDetalheController = function($scope, $http, $stateParams) {

    $scope.loading = true;
    $localData.genericQuery($http, 'SA1', true, function(data){
            $scope.loading = false;
            data = data.data[0];
            if (data)
            {
                $scope.cliente = data;
            }
            else
            {
                alert('Não foi possível obter as informações do cliente');
            }
        },
        function(){
            $scope.loading = false;
            alert('Não foi possível obter as informações do cliente');
        },
       'filter=A1_LOJA:'+$stateParams['lojaId']+
       ',A1_COD:'+$stateParams['clienteId']);
};