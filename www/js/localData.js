$localData = {
    genericQuery: function($http, key, forceUpdate, callback, onerror, extraParams) {
        extraParams = extraParams || "";
        this.findAll($http, "generic-" + key, forceUpdate, callback, extraParams, onerror);
    },
    defaultQuery: function($http, key, callback, extraParams) {
        extraParams = extraParams ? "&" + extraParams : "";
        this.findAll($http, "consulta-" + key, false, callback, "default_query=" + key + "&page=all" + extraParams);
    },
    findAll: function($http, key, forceUpdate, callback, params, storageName, onerror) {
        if (!storageName) {
            storageName = key;
        }
        var list = localStorage[storageName] ? JSON.parse(localStorage[storageName]) : [];
        if (forceUpdate || !list.length) {
            var apiUrl;
            if (params) {
                if (key.indexOf("generic-") == 0) {
                    apiUrl = API_URLS["generico"] + key.replace("generic-", "") + ".json";
                } else if (params.indexOf("default_query") != -1) {
                    apiUrl = API_URLS["consulta"];
                } else {
                    apiUrl = API_URLS[key];
                }
            } else {
                apiUrl = API_URLS[key];
            }
            var email = localStorage["user_email"];
            var token = localStorage["user_token"];
            var request = $http.get(apiUrl + "?user_email=" + email + "&user_token=" + token + (params ? "&" + params : "")).then(function(response) {
                $localData.saveAll(response.data, storageName);
                var date = new Date().getTime();
                localStorage["sync_" + storageName] = date + "";
                response.syncDate = date;
                if (callback) {
                    callback(response);
                }
            });
            request.error = onerror || this.onerror;
            return [];
        }
        if (callback) {
            callback({
                data: list,
                syncDate: parseInt(localStorage["sync_" + storageName])
            });
        } else {
            return list;
        }
    },
    onerror: function(data) {
        console.log(data);
    },
    findBy: function($http, key, criteria) {
        var result = [];
        var list = this.findAll($http, key, false);
        for (var i in list) {
            var include = true;
            for (var j in criteria) {
                if (list[i][j] != criteria[j]) {
                    include = false;
                    break;
                }
            }
            if (include) {
                result.push(list[i]);
            }
        }
        return result;
    },
    saveAll: function(arr, key) {
        var string = JSON.stringify(arr);
        localStorage[key] = string;
    },
    "delete": function($http, key, idName, idVal) {
        var list = this.findAll($http, key, false);
        var toDelete = 0;
        for (var i in list) {
            var item = list[i];
            if (item[idName] == idVal) {
                toDelete = i;
                break;
            }
        }
        if (toDelete) {
            list.splice(toDelete, 1);
            this.saveAll(list, key);
        }
    },
    find: function($http, key, idName, id) {
        var list = this.findAll($http, key, false);
        for (var i in list) {
            var item = list[i];
            if (item[idName] == id) {
                return item;
            }
        }
        return null;
    },
    update: function($http, key, idName, data) {
        var list = this.findAll($http, key, false);
        for (var i in list) {
            var item = list[i];
            if (item[idName] == data[idName]) {
                list[i] = data;
            }
        }
        this.saveAll(list, key);
    },
    serialize: function(modelName, object) {
        var result = [];
        for (var i in object) {
            if (i.length > 2 && i.substring(0, 2) == "__" || i == "errors") {
                continue;
            }
            var attr = i;
            var val = object[i];
            if (typeof val == "object") {
                var count = 0;
                for (var arrI in val) {
                    count++;
                    for (var j in val[arrI]) {
                        var content = object[i][arrI][j];
                        result.push(modelName + "[" + (i + "_attributes") + "][" + count + "][" + j + "]=" + content);
                    }
                }
            } else {
                result.push(modelName + "[" + i + "]=" + val);
            }
        }
        return result.join("&");
    }
};