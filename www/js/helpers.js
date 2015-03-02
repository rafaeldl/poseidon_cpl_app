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
        var day = this.strZero(date.getDate(), 2);
        var month = this.strZero(date.getMonth()+1, 2);
        var year = date.getFullYear();                
        var hours = "";
        if (time)
        {
            hours += " às " + this.dateToPtBrTime(date);
        }
        return day+"/"+month+"/"+year+hours;
    },

    dateToPtBrTime: function(date)
    {
        var hour = this.strZero(date.getHours(), 2);
        var minutes = this.strZero(date.getMinutes(), 2);
        return hour+":"+minutes;
    },

    dateToProtheusDate: function(date){
        var result = '';
        result += date.getFullYear();
        result += this.strZero((date.getMonth()+1), 2);
        result += this.strZero(date.getDate(), 2);
        return result;        
    },

    strZero: function(number, size){
        number = number + '';
        while (number.length < size){
            number = '0'+number;
        }
        return number;
    },

    dateToProtheusTime: function(date){
        var result = '';
        result += this.strZero(date.getHours(), 2);
        result += ':';
        result += this.strZero(date.getMinutes(), 2);
        return result;        
    },

    /*
     * Ping on server, callback injects true if it responds
     */
    ping: function(ip, callback) {
        var img = new Image();        
        img.onload = function(){
            callback(true, this.src);
        };
        img.onerror = function(){
            callback(true, this.src);
        };
        setTimeout(function(){
            callback(false);
        }, 18000);
        img.src = ip;
    },

    /*
     * Generates hash for object
     */
    generateHash: function(obj){
        var i,
            key,
            str;
        str = '' + (new Date().getTime());
        for (i in obj){
            str += obj[i];
        }
        return md5(str);
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