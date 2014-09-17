// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

/*
 * Globals
 */
//API_URL = 'http://portal.cplkibon.com.br/';
//ROTEIROS_URL = 'http://localhost/dl_proxy.php?page=roteiros';
API_URL = 'http://portal.cplkibon.com.br';
API_URLS = {
    produtos: API_URL+'/pedidos/produtos.json',
    roteiros: API_URL+'/roteiros.json',
    consulta: API_URL+'/default_query/list.json',
    generico: API_URL+'/generic/'
};
PRODUTOS_URL = 'http://localhost/dl_proxy.php?page=produtos';
STATUS_NOT_SENT = 1;
STATUS_SENT = 2;
STATUS_SENT_ERROR = 3;

angular.module('starter', ['ionic', 'starter.controllers'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.headers.common = {Accept: "application/json, text/plain, */*"};
    $httpProvider.defaults.headers.post = {"Content-Type": "application/json;charset=utf-8"};

  $stateProvider
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

      .state('app.roteiros', {
          url: "/roteiros",
          views: {
              'menuContent' :{
                  templateUrl: "templates/roteiros.html",
                  controller: 'RoteirosCtrl'
              }
          }
      })

      .state('app.roteiroOpcoes', {
          url: "/roteiro-opcoes/:roteiroId",
          views: {
              'menuContent' :{
                  templateUrl: "templates/roteiro-opcoes.html",
                  controller: 'RoteiroOpcoesCtrl'
              }
          }
      })

      .state('app.semPedido', {
          url: "/sem-pedido/:roteiroId/:semPedidoId",
          views: {
              'menuContent' :{
                  templateUrl: "templates/sem-pedido.html",
                  controller: 'SemPedidoCtrl'
              }
          }
      })

      .state('app.pedido', {
          url: "/pedido/:roteiroId/:pedidoId",
          views: {
              'menuContent' :{
                  templateUrl: "templates/pedido.html",
                  controller: 'PedidoCtrl'
              }
          }
      })

      .state('app.pedido_list', {
          url: "/pedido-list",
          views: {
              'menuContent' :{
                  templateUrl: "templates/pedido-list.html",
                  controller: 'PedidoListCtrl'
              }
          }
      })

      .state('app.sem_pedido_list', {
          url: "/sem-pedido-list",
          views: {
              'menuContent' :{
                  templateUrl: "templates/sem-pedido-list.html",
                  controller: 'SemPedidoListCtrl'
              }
          }
      })

    .state('app.sincronias', {
          url: "/sincronias",
          views: {
              'menuContent' :{
                  templateUrl: "templates/sincronias.html",
                  controller: 'SincroniasCtrl'
              }
          }
    })

    .state('app.produtos', {
          url: "/produtos/:roteiroId",
          views: {
              'menuContent' :{
                  templateUrl: "templates/produtos.html",
                  controller: 'ProdutosCtrl'
              }
          }
    })

     .state('app.login', {
          url: "/login",
          views: {
              'menuContent' :{
                  templateUrl: "templates/login.html",
                  controller: 'LoginCtrl'
              }
          }
     })

     .state('app.clientes', {
          url: "/clientes",
          views: {
              'menuContent' :{
                  templateUrl: "templates/clientes.html",
                  controller: 'ClientesCtrl'
              }
          }
     })

     .state('app.cliente_detalhe', {
          url: "/cliente-detalhe/:clienteId/:lojaId",
          views: {
              'menuContent' :{
                  templateUrl: "templates/cliente-detalhe.html",
                  controller: 'ClienteDetalheCtrl'
              }
          }
     })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/roteiros');
});

