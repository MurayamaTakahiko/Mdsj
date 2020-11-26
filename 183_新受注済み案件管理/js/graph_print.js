
(function() {
    /************************************************************************/
    /*今回はjqueryを利用するのでアプリの設定で以下のURLを追加してください   */
    /*URL：https://js.cybozu.com/jquery/1.11.2/jquery.min.js                */
    /************************************************************************/
    "use strict";

    function escapeHtml(str) {
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/'/g, '&#39;');
        str = str.replace(/'/g, '&#39;');
        return str;
    }

    // 印刷対象となるHTMLを作成します。
    function createHtml() {

        // 現在カスタムビューでグラフが表示されているIFRAMEを取得する。
        var iframeDetail = $('#custom_area').first().find('IFRAME:first')[0];

        var htmlDetail = '<div><iframe ';
        // 要素数分ループ
        for (var i = 0; i < iframeDetail.attributes.length; i++) {
            htmlDetail += escapeHtml(iframeDetail.attributes[i].name) + '="';
            htmlDetail += escapeHtml(iframeDetail.attributes[i].value) + '" ';
        }

        htmlDetail += '></iframe></div>';

        return htmlDetail;
    }

    // 一覧画面を開いた時に実行します。
    function indexShow(event) {

        // すでに印刷ボタンが存在する場合とカスタムエリアが存在しない場合は処理を終了します。
        if (document.getElementById('my_print_button') !== null ||
            document.getElementById('custom_area') === null) {
            return;
        }

        /** 標準のグラフをIFRAMEに表示します。                  **/
        /** 印刷範囲をグラフ表示したIFRAME部分に設定します。    **/

        // グラフ印刷用のIFRAMEを作成します。
        var iframe = document.createElement('IFRAME');
        var doc = null;
        // 作成したIFRAMEにスタイルの属性を追加します。
        $(iframe).attr('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;');
        // 現在のカスタムビューの後にiframeを追加します。
        $('#custom_area').after(iframe);

        // 印刷対象となるHTMLを作成します。
        var htmlDetail = createHtml();
        doc = iframe.contentWindow.document;
        // グラフ印刷用のIFRAMEにグラフを追加します。
        doc.write(htmlDetail);
        doc.close();

        // 印刷用のボタンを作成します。
        var myPrintButton = document.createElement('button');
        myPrintButton.id = 'my_print_button';
        myPrintButton.innerHTML = 'グラフ印刷';

        // 印刷ボタンのクリックイベントを作成します。
        myPrintButton.onclick = function() {

            // 印刷ボタンクリック時に印刷用のiframeにフォーカスを設定します。
            iframe.contentWindow.focus();

            // フォーカスが設定されたら、対象を印刷します。
            // 対象のグラフのみが選択された状態で印刷プレビューが表示されます。
            iframe.contentWindow.print();
        };
        // 一覧のヘッダ部にボタンを追加します。
        kintone.app.getHeaderMenuSpaceElement().appendChild(myPrintButton);
    }

    // レコード一覧画面の表示時のイベント「app.record.index.show」を利用します。
    kintone.events.on('app.record.index.show', indexShow);
})();
