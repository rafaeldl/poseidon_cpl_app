function enviaSemPedido($http,roteiro,evento,obs,success,error){$http.defaults.headers.post["Content-Type"]="application/x-www-form-urlencoded",$http.post(API_URL+"/sem_pedidos.json","sem_pedido[ad5_vend]="+roteiro.vendedor+"&sem_pedido[ad5_codcli]="+roteiro.cliente+"&sem_pedido[ad5_loja]="+roteiro.lojacli+"&sem_pedido[ad5_evento]="+evento.value+"&sem_pedido[ad5_obs]="+obs.value+"&new_sem_pedido_0&user_email="+localStorage.user_email+"&user_token="+localStorage.user_token).success(success).error(error)}$helpers={toReal:function(num){num=Math.round(100*num)/100;var value=(""+num).split("."),num=value[0],cents="00";return value[1]&&(cents=value[1],cents=1==cents.length?"0"+cents:cents),"R$ "+num+","+cents},dateToPtBr:function(date,time){var day=date.getDate(),month=date.getMonth()+1,year=date.getFullYear();day=1==(""+day).length?"0"+day:day,month=1==(""+month).length?"0"+month:month;var hours="";return time&&(hours+=" às "+this.dateToPtBrTime(date)),day+"/"+month+"/"+year+hours},dateToPtBrTime:function(date){var hour=date.getHours(),minutes=date.getMinutes();return hour=1==(""+hour).length?"0"+hour:hour,minutes=1==(""+minutes).length?"0"+minutes:minutes,hour+":"+minutes},dateToProtheusDate:function(date){var result="";return result+=date.getFullYear(),result+=date.getMonth()+1,result+=date.getDate()},dateToProtheusTime:function(date){var result="";return result+=date.getHours(),result+=":",result+=date.getMinutes()}},Number.prototype.toFixedDown=function(digits){var re=new RegExp("(\\d+\\.\\d{"+digits+"})(\\d)"),m=this.toString().match(re);return m?parseFloat(m[1]):this.valueOf()};