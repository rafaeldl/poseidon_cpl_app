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
    },

    dateToProtheusDate: function(date){
        var result = '';
        result += date.getFullYear();
        result += (date.getMonth()+1);
        result += date.getDate();
        return result;        
    },

    dateToProtheusTime: function(date){
        var result = '';
        result += date.getHours();
        result += ':';
        result += date.getMinutes();
        return result;        
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