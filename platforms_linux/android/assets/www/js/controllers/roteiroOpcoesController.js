var roteiroOpcoesController=function($scope,$http,$stateParams){$scope.roteiroId=$stateParams.roteiroId,$scope.roteiro=$localData.find($http,"roteiros","sequencia",$scope.roteiroId),$scope.$helpers=$helpers};