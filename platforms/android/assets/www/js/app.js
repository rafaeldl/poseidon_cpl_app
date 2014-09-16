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
    consulta: API_URL+'/default_query/list.json'
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
          url: "/sem-pedido/:roteiroId",
          views: {
              'menuContent' :{
                  templateUrl: "templates/sem-pedido.html",
                  controller: 'SemPedidoCtrl'
              }
          }
      })

      .state('app.pedido', {
          url: "/pedido/:roteiroId",
          views: {
              'menuContent' :{
                  templateUrl: "templates/pedido.html",
                  controller: 'PedidoCtrl'
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

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/roteiros');
});

$helpers =
{
    toReal: function(num)
    {
        num = Math.round(num * 100)/100;
        var value = (""+num).split('.');
        var num = value[0];
        var cents = "00";
        if (value[1])
        {
            cents = value[1];
            cents = cents.length == 1 ? "0"+cents : cents;
        }
        return "R$ " + num + "," + cents;
    },

    dateToPtBr: function(date, time)
    {
        var day = date.getDate();
        var month = date.getMonth()+1;
        var year = date.getFullYear();
        day = (""+day).length == 1 ? ("0"+day) : day;
        month = (""+month).length == 1 ? ("0"+month) : month;
        var hours = "";
        if (time)
        {
            hours += " às " + this.dateToPtBrTime(date);
        }
        return day+"/"+month+"/"+year+hours;
    },

    dateToPtBrTime: function(date)
    {
        var hour = date.getHours();
        var minutes = date.getMinutes();
        hour = (""+hour).length == 1 ? ("0"+hour) : hour;
        minutes = (""+minutes).length == 1 ? ("0"+minutes) : minutes;
        return hour+":"+minutes;
    }
};

$localData =
{

    defaultQuery: function($http, key, callback)
    {
        this.findAll($http, 'consulta-'+key, false, callback, 'default_query='+key+'&page=all');
    },

    findAll: function($http, key, forceUpdate, callback, params, storageName)
    {
        if (!storageName)
        {
           storageName = key;
        }
        var list = localStorage[storageName] ?
               JSON.parse(localStorage[storageName]) : [];

        /*
         * Recupera dados do servidor
         */
        if (forceUpdate || (!list.length))
        {
            var apiUrl = (params && params.indexOf('default_query') != -1) ?
               API_URLS['consulta'] : API_URLS[key];
            if (apiUrl)
            {
                var email = localStorage['user_email'];
                var token = localStorage['user_token'];
                $http.get(apiUrl+"?user_email="+email+
                    "&user_token="+token+(params ? ('&'+params) : ''))
                    .then(function(response) {
                        $localData.saveAll(response.data, storageName);
                        var date = new Date().getTime();
                        localStorage['sync_'+storageName] = date+"";
                        response.syncDate = date;
                        if (callback)
                        {
                            callback(response);
                        }
                    });
            }
            return [];
        }

        /*
         * retorna dados
         */
        if (callback)
        {
            callback({
                data: list,
                syncDate: parseInt(localStorage['sync_'+storageName])
            });
        }
        else
        {
            return list;
        }
    },

    findBy: function($http, key, criteria)
    {
        var result = [];
        var list = this.findAll($http, key, false);
        for (var i in list)
        {
            var include = true;
            for (var j in criteria)
            {
                if (list[i][j] != criteria[j])
                {
                    include = false;
                    break;
                }
            }
            if (include)
            {
                result.push(list[i]);
            }
        }
        return result;
    },

    saveAll: function(arr, key)
    {
        var string = JSON.stringify(arr);
        localStorage[key] = string;
    },

    delete: function($http, key, idName, idVal)
    {
        var list = this.findAll($http, key, false);
        var toDelete = 0;
        for (var i in list)
        {
            var item = list[i];
            if (item[idName] == idVal)
            {
                toDelete = i;
                break;
            }
        }

        if (toDelete)
        {
            list.splice(toDelete, 1);
            this.saveAll(list, key);
        }
    },

    find: function($http, key, idName, id)
    {
        var list = this.findAll($http, key, false);
        for (var i in list)
        {
            var item = list[i];
            if (item[idName] == id)
            {
                return item;
            }
        }
        return null;
    },

    update: function($http, key, idName, data)
    {
        var list = this.findAll($http, key, false);
        for (var i in list)
        {
            var item = list[i];
            if (item[idName] == data[idName])
            {
                list[i] = data;
            }
        }
        this.saveAll(list, key);
    },

    serialize: function(modelName, object)
    {
        var result = [];
        for (var i in object)
        {
            if (((i.length > 2) && (i.substring(0, 2) == '__')) ||
                (i == "errors"))
            {
                continue;
            }
            var attr = i;
            var val = object[i];
            if (typeof val == 'object')
            {
                var count = 0;
                for (var arrI in val)
                {
                    count++;
                    for (var j in val[arrI])
                    {
                        var content = object[i][arrI][j];
                        result.push( modelName + "["+(i+"_attributes") + "][" + count + "][" + j + "]=" + content );
                    }
                }

            }
            else
            {
                result.push(modelName+"["+i+"]="+val);
            }
        }
        return result.join('&');
    }
};


function enviaSemPedido($http, roteiro, evento, obs, success, error)
{
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    $http.post(API_URL+'/sem_pedidos.json', "sem_pedido[ad5_vend]="+roteiro.vendedor+
        "&sem_pedido[ad5_codcli]="+roteiro.cliente+"&sem_pedido[ad5_loja]="+roteiro.lojacli+
        "&sem_pedido[ad5_evento]="+evento.value+"&sem_pedido[ad5_obs]="+obs.value+"&new_sem_pedido_0"+
        "&user_email="+localStorage['user_email']+"&user_token="+localStorage['user_token'])
        .success(success)
        .error(error);
}

Number.prototype.toFixedDown = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};