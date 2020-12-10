/*
* 地図表示のサンプルプログラム
* Copyright (c) 2013 Cybozu
* 
* Licensed under the MIT License
*/
(function(){

"use strict";

// レコード表示時イベントで住所フィールドの値を利用して地図を表示する
kintone.events.on('app.record.detail.show', function(event){

var timeout = 10 * 1000; // ms
var interval = 100; // ms

var check = document.getElementsByName('map_latlng');

if(check.length == 0){

// enable google maps to call document.write after onload event.
var nativeWrite = document.write;
document.write = function(html) {
var m = html.match(/script.+src="([^"]+)"/);
if (m) {
load(m[1]);
} else {
nativeWrite(html);
}
};

// Google Map の API ライブラリをロードします
load('https://maps-api-ssl.google.com/maps/api/js?v=3&sensor=false');

waitLoaded();

}

// Google Map がロードされるまで待ちます
function waitLoaded() {
setTimeout(function () {
timeout -= interval;
if ((typeof google !== 'undefined')
&& (typeof google.maps !== 'undefined')
&& (typeof google.maps.version !== 'undefined')) {
setLocation_address(); // 住所をもとに地図を表示
} else if (timeout > 0) {
waitLoaded();
} else {
// abort
}
}, interval);
}

// 住所情報を元に、地図を「住所」フィールドの下に表示します
function setLocation_address() {

var locationEl_address = kintone.app.record.getFieldElement('Address');
if (locationEl_address.length == 0) { return; }

var check = document.getElementsByName('map_address');

//「map_address」という要素が存在しないことを確認
if(check.length !== 0){ return; }

// 地図を表示する div 要素を作成します
var mapEl_address = document.createElement('div');
mapEl_address.setAttribute('id', 'map_address');
mapEl_address.setAttribute('name', 'map_address');

// 「住所」フィールドの要素の下に mapEl_address で設定した要素を追加します
var elMap = kintone.app.record.getSpaceElement('Map');
elMap.appendChild(mapEl_address);

// Google Geocoder を定義します
var gc = new google.maps.Geocoder();

// 「住所」フィールドから値を取得します
var rec = kintone.app.record.get();
var addressValue = rec.record.Address.value;

// Geocoding API を実行します
gc.geocode({
address: addressValue,
language: 'ja',
country: 'JP'
}, function(results, status) {
if (status == google.maps.GeocoderStatus.OK) {

// 地図要素のサイズを指定します
mapEl_address.setAttribute('style', 'width: 300px; height: 250px');

var point = results[0].geometry.location;
var address = results[0].formatted_address;

// 地図の表示の設定(中心の位置、ズームサイズ等)を設定します
var opts = {
zoom: 15,
center: point,
mapTypeId: google.maps.MapTypeId.ROADMAP,
scaleControl: true
};

var map_address = new google.maps.Map(document.getElementById('map_address'), opts);

// マーカーを設定します
var marker = new google.maps.Marker({
position: point,
map: map_address,
title: address
});

}
});

}
});

// ヘッダに要素を追加します
function load(src) {
var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = src;
head.appendChild(script);
}

})();
