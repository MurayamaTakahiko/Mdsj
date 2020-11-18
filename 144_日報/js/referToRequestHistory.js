jQuery.noConflict();
(function($) {
    "use strict";
    
    const EVENTS = [
        "app.record.create.show",
        "app.record.edit.show"
    ];
    
    const SOURCE_REFER_TO_REQUEST_HISTORY = ''
    +   '<div clastt="emxas-button">'
    +       '<button id="emxas-button-refer-to-request-history" class="emxas-custom-button">申請・申告履歴へ登録</button>'
    +   '</div>';
    
    const SOURCE_REFER_TO_DEAL = ''
    +   '<div clastt="emxas-button">'
    +       '<button id="emxas-button-refer-to-deal" class="emxas-custom-button">対応・調査へ登録</button>'
    +   '</div>';
    
    kintone.events.on(EVENTS, function(e) {
        $(kintone.app.record.getSpaceElement("spaceReferToRequestHistory")).html(SOURCE_REFER_TO_REQUEST_HISTORY);
        $(kintone.app.record.getSpaceElement("spaceReferToDeal")).html(SOURCE_REFER_TO_DEAL);
        return e;
    });
    
    $(document).off('click', '#emxas-button-refer-to-request-history');
    $(document).on('click', '#emxas-button-refer-to-request-history', function(e) {
        // 新規タブで開く
        window.open("https://" + location.host + '/k/' + emxasConf.getConfig('APP_REQUEST_HISTORY') + '/');
    });
    
    $(document).off('click', '#emxas-button-refer-to-deal');
    $(document).on('click', '#emxas-button-refer-to-deal', function(e) {
        // 新規タブで開く
        window.open("https://" + location.host + '/k/' + emxasConf.getConfig('APP_DEAL') + '/');
    });
    
})(jQuery);
