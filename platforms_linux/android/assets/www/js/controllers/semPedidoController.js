semPedidoController=function($scope,$http,$stateParams){if($scope.inEdition=$stateParams.semPedidoId,$scope.roteiro=$stateParams.roteiroId,$scope.sem_pedido={},$scope.eventos=$localData.findAll($http,"eventos",!1),$scope.save=function(){if($scope.saving)return 0;$scope.saving=!0;var obs=document.getElementById("input-obs"),evento=document.getElementById("input-evento"),roteiro=$localData.find($http,"roteiros","sequencia",$scope.roteiro);if(!obs.value||!evento.value)return alert("Preencha todos os campos para salvar"),$scope.saving=!1,0;var list=$localData.findAll($http,"sem_pedidos");$scope.sem_pedido.ad5_evento=evento.value,$scope.sem_pedido.ad5_obs=obs.value,$scope.sem_pedido.__roteiro=roteiro.sequencia,$scope.sem_pedido.ad5_vend=roteiro.vendedor,$scope.sem_pedido.ad5_codcli=roteiro.cliente,$scope.sem_pedido.ad5_loja=roteiro.lojacli,list.push($scope.sem_pedido);var salvaSemPedido=function(semPedido){"0"!=$scope.inEdition?$localData.update($http,"sem_pedidos","__id",semPedido):(semPedido.__id=(new Date).getTime(),$localData.saveAll(list,"sem_pedidos"))};roteiro.status_sem_pedidos=STATUS_NOT_SENT,$localData.update($http,"roteiros","sequencia",roteiro),syncronize=!0,navigator&&navigator.geolocation?($scope.saving=0,navigator.geolocation.getCurrentPosition(function(position){$scope.sem_pedido.ad5_zlatit=position.coords.latitude.toFixedDown(9),$scope.sem_pedido.ad5_longit=position.coords.longitude.toFixedDown(9),salvaSemPedido($scope.sem_pedido),window.location="#/app/roteiros"},function(){salvaSemPedido($scope.sem_pedido),window.location="#/app/roteiros"},{enableHighAccuracy:!0,timeout:5e3,maximumAge:6e5})):(salvaSemPedido($scope.sem_pedido),window.location="#/app/roteiros")},"0"!=$scope.inEdition){$scope.sem_pedido=$localData.find($http,"sem_pedidos","__id",$scope.inEdition);var evento=document.getElementById("input-evento");setTimeout(function(){evento.value=$scope.sem_pedido.ad5_evento},500)}};