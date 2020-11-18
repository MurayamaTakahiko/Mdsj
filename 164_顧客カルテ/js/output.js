jQuery.noConflict();
(function($) {
   "use strict";
   
    var OUTPUT_FIELDS = [
        "顧客名",
        "Address",
        "登録番号_税理士法人番号",
        "ドロップダウン_法人個人区分",
        "ドロップダウン_青白区分",
        "資本金",
        "ドロップダウン_決算月",
        "契約開始日",
		"管轄税務署名",
		"関与状況_税務代理",
		"関与状況_税理書類作成",
		"関与状況_税務相談"
    ];
    
    //出力対象レコード
    var outputRecords;
    //税理士法人情報 保持
    var taxCorpInfo;

    //一覧表示イベント
    kintone.events.on("app.record.index.show", function(e) {

        //ﾊﾟﾗﾒｰﾀ管理で指定したviewID」以外の時は何もしない。
        var isOutView = false;
        var outViewIds = emxasConf.getConfig('VIEW_OUTPUT').split(",");
        for(var i=0; i<outViewIds.length; i++){
            if(e.viewId == outViewIds[i]){
                isOutView = true;
            }
        }
        if(!isOutView) return e;

        //AUTHORIZED_USERSは常に設定されている前提
        //帳票出力権限の無いユーザーの場合、何もしない。
        var authorizedUsers = emxasConf.getConfig('AUTHORIZED_USERS');
        if(authorizedUsers.split(",").indexOf(kintone.getLoginUser()["code"]) === -1){
            return;
        }
        
        //ヘッダのボタンが生成されていたら何もしない。
        if($('.emxas-head-area-button').length > 0) return e;
        
        //「納税者名簿出力ボタン」追加
        var ele = kintone.app.getHeaderSpaceElement();
        $(ele).append(
            '<button class="emxas-head-area-button">納税者名簿出力</button>'
        );
        
        $('html body').append(createPopupContents());

    });
   
    //「納税者名簿出力ボタン」クリックイベント
    $(document).on('click', '.emxas-head-area-button', function(e){

        //現在のレコードを取得
        var param ={
            "app": kintone.app.getId(),
            "query": ' 契約ステータス in (\"契約中\") order by 管轄税務署名 asc, 顧客コード asc',
            "fields": OUTPUT_FIELDS
        }
        return getRecords(param).then(function(resp){
            //出力対象レコードの保持
            outputRecords = resp.records;

            //現在のレコードを取得
            var param ={
                "app": emxasConf.getConfig('APP_TAX_CORPORATION'),
                "query": ' order by $id asc'
                // "fields": OUTPUT_FIELDS
            }
            // return getRecords(param).then(function(resp){
            return getRecords(param);
        }).then(function(resp){
            setTaxCorpInfo(resp.records);
            //ポップアップの表示
            $('html body').css('overflow', 'hidden');
            $('.emxas-popup-area').show();
            // outputReport(records);
        }).catch(function(err){
            alert('レコード出力処理でエラーが発生しました。');
            console.log(err);
        });
    });
   
    //モーダルダイアログ「×」ボタンクリックイベント
    $(document).on('click', '.emxas-popup-head-button-close', function(e){
        closePopup();
    });

    //モーダルダイアログ背景部分
    $(document).on('click', function(e){
        if($(e.target).prop('class') === 'emxas-popup-overlay'){
            closePopup();
        }
    });
   
    //モーダルダイアログ「出力」ボタンクリックイベント
    $(document).on('click', '.emxas-popup-contents-button-output', function(e){
        var headData = {};
        var popupFields = $(".emxas-popup-contents-field-area").find("input");
        for(var i=0; i<popupFields.length; i++){
            // console.log($("." + $(popupFields).get(i).id).html());
            var key = $("." + $(popupFields).get(i).id).html();
            headData[key] = {
                "value": $(popupFields).get(i).value
            }
        }
        
        console.log(headData);
        outputReport(headData, outputRecords);
    });

    //帳票出力処理メイン
    function outputReport(headData, records){

        //出力対象件数 0 件の場合、アラートを表示し終了
        if(records.length === 0){
            alert("出力対象のデータが存在しません。");
            return;
        }

        //出力対象件数多い場合のアラート
        var alertAmount = emxasConf.getConfig("ALERT_AMOUNT");
        var alertContent = "";
        if(records.length >= alertAmount){
            alertContent = "\n※出力対象件数が多い為、時間がかかる恐れがあります。";
        }
        var res = confirm("出力処理を実行します。出力対象件数：" + records.length + " 件" + alertContent);
        if(res){
            emxas.lambda.invoke(headData, records);
        }
    }

    //kintoneレコード取得API呼び出し
    function getRecords(param){

        return kintoneUtility.rest.getAllRecordsByQuery(param).then(function(resp){
            return resp;
        }).catch(function(err){
            return kintone.Promise.reject(err);
        });
    }
   
    /**
     * Lambda呼び出し
     */
    function invokeLambda(headData, records){
        
        AWS.config.update({
            accessKeyId: emxasConf.getConfig("ACCESS_KEY_ID"),
            secretAccessKey: emxasConf.getConfig("SECRET_ACCESS_KEY"),
            region: "ap-northeast-1"
        });
        
        var lambda = new AWS.Lambda();
        var param = {
            FunctionName: 'createTaxPayerList',
            Payload: JSON.stringify({
                "headData": JSON.stringify(headData),
                "records": JSON.stringify(records)
            })
        }

        //Spinner表示
        emxas.spinner.show();
        
        return new kintone.Promise(function(resolve, reject){
            lambda.invoke(param, function(err, data){
                //Spinner非表示
                emxas.spinner.hide();
                
                //base64で返却されたデータをExcel形式にdecode
                var resp = JSON.parse(data.Payload);
                if(resp['errorMessage'] || resp['error']){
                    var errMsg = "";
                    if(resp['errorMessage']){
                        errMsg += resp['errorMessage'];
                    }
                    if(resp['error']){
                        if(errMsg){
                            errMsg += "\n";
                        }
                        errMsg += resp['error'];
                    }
                    reject(errMsg);
                }else{
                    createFile(resp.createdFile);
                    resolve();
                }
            });
        }).catch(function(error){
            //Spinner非表示
            emxas.spinner.hide();
            alert('帳票生成処理でエラーが発生しました。\n' + error);
            console.log(error);
        });
    }
    
    function createFile(data){
            
        //ファイル名生成
        var fileName = emxasConf.getConfig("FILE_NAME") + ".xlsx"
        //MIME_TYPE
        var mime_ctype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        //ファイル名生成
        var blob = toBlob(data, mime_ctype);
        
        if (window.navigator.msSaveBlob) {
            // IEやEdgeの場合、Blob URL Schemeへと変換しなくともダウンロードできる
            window.navigator.msSaveOrOpenBlob(blob, fileName); 
        } else {
            var url = window.URL || window.webkitURL;
            
            //BlobURLの取得
            var blobUrl = url.createObjectURL(blob);
            
            //リンクを作成し、そこにBlobオブジェクトを設定する
            var alink = document.createElement("a");
            alink.innerHTML = 'ダウンロード';
            alink.download = fileName;
            alink.href = blobUrl;
            
            //マウスイベントを設定
            var e = document.createEvent("MouseEvents");
            e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            
            //aタグのクリックイベントをDispatch起動
            alink.dispatchEvent(e);
            emxas.spinner.hide();
        }
    }

    /**
     * base64 ⇒ blobの変換
     */ 
    function toBlob(base64, mime_ctype) {
        var bin = atob(base64.replace(/^.*,/, ''));
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
        }
        // Blobを作成
        try {
            var blob = new Blob([buffer.buffer], {
                type: mime_ctype,
            });
        } catch (e) {
            return false;
        }
        return blob;
    }
    
    window.emxas = window.emxas || {};
    window.emxas.lambda = window.emxas.lambda || {};
    window.emxas.lambda.invoke = invokeLambda;
    
})(jQuery);
