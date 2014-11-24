var clientesController = function($scope, $http) {
    $scope.clientes = $localData.findAll($http, "clientes", false);
};