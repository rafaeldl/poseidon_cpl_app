
var roteiroOpcoesController = function($scope, $http, $stateParams) {
    $scope.roteiroId = $stateParams['roteiroId'];
    $scope.roteiro = $localData.find($http, 'roteiros', 'sequencia', $scope.roteiroId);
    $scope.condPag = $localData.find($http, 'condicao-pagamento', 'E4_CODIGO', $scope.roteiro.zfrec);
    $scope.forReceb = $localData.find($http, 'forma-recebimento', 'ZJ2_COD', $scope.roteiro.condpag);
    $scope.$helpers = $helpers;
};