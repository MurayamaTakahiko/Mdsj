jQuery.noConflict();
(function($) {
    "use strict";
   
    var createEditEvents = [
        "app.record.create.show",
        "app.record.edit.show"
    ];
   
    kintone.events.on(createEditEvents, function(e) {
        var customerName = '';
        var param = getUrlParams();
        if(param['customername']){
            customerName = param['customername'];
            new kintone.Promise(function(resolve, reject){
                resolve(e);
            }).then(function(res){
                var objRecord = kintone.app.record.get();
                objRecord['record']['顧客名']['value'] = customerName;
                kintone.app.record.set(objRecord);
            });
        }
        
        return e;
    });
    
    var getUrlParams = function(){
        var params = {}; 
        var param = location.search.substring(1).split("&");
        for (var ix = 0; ix < param.length; ix++) {
            var keySearch = param[ix].search(/=/);
            var key = '';
            if(keySearch !== -1) {
                key = param[ix].slice(0, keySearch);
            }
            var val = param[ix].slice(param[ix].indexOf("=", 0) + 1);
            if(key !== "") {
                params[key] = decodeURI(val);
            }
        } 
        return params;
    };
})(jQuery);
