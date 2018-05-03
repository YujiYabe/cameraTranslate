"use strict";

"use strict";


// ページロード後処理
$(function () {
	pullSelectedLanguage();

});



function translateText() {

	var langPair = {};
	langPair.ja = 'jp';
	langPair.en = 'en';
	langPair.es = 'es';
	langPair.fr = 'fr';

	var target_url = 'translate';
	var targetTranslate = $('#targetTranslate').text();
	var targetLanguage = $('#targetLanguage').text();
	var sourceLanguage = $('#sourceLanguage').text();

	if (langPair[sourceLanguage] == targetLanguage) {
		$('#DoneTranslateZone').show();
		var unescapestr = unescapeHTML(targetTranslate);
		$('#doneTranslate').text(unescapestr);
		return;
	} else {
		var post_data = {
			'targetTranslate': targetTranslate,
			'targetLanguage': targetLanguage,
		};
		$.ajax({
			type: 'POST',
			url: target_url,
			data: post_data,
		})
			.then(
				// 1つめは通信成功時のコールバック
				function (data) {

					$('#DoneTranslateZone').show();
					var unescapestr = unescapeHTML(data);
					$('#doneTranslate').text(unescapestr);
				},

				// 2つめは通信失敗時のコールバック
				function () {
					console.log("読み込み失敗");
				}
			);
	}

} // =======================================

function speechText() {

	speechSynthesis.cancel();

	var langPair = {};
	langPair.ja = 'ja-JP';
	langPair.en = 'en-US';
	langPair.es = 'es-ES';
	langPair.fr = 'fr-FR';
	var targetLanguage = $('#targetLanguage').text();

	// console.log(targetLanguage);
	var synthes = new SpeechSynthesisUtterance();
	synthes.voiceURI = 'native';
	synthes.volume = 1;
	synthes.rate = 0.9;
	synthes.pitch = 0;
	synthes.text = $('#doneTranslate').text();
	synthes.lang = langPair[targetLanguage];

	speechSynthesis.speak(synthes);

} // =======================================

function unescapeHTML(str) {
	var div = document.createElement("div");
	div.innerHTML = str.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/ /g, "&nbsp;")
		.replace(/\r/g, "&#13;")
		.replace(/\n/g, "&#10;");
	return div.textContent || div.innerText;
}

function canvasDraw() {
	var file = $("#imageSelect").prop("files")[0];

	//画像ファイルかチェック
	if (file["type"] != "image/jpeg" && file["type"] != "image/png" && file["type"] != "image/gif") {
		alert("画像ファイルを選択してください");
		$("#imageSelect").val(''); //選択したファイルをクリア

	} else {
		var fr = new FileReader();

		fr.onload = function () {
			//選択した画像を一旦imgタグに表示
			$("#preview").attr('src', fr.result);

			//imgタグに表示した画像をimageオブジェクトとして取得
			var image = new Image();
			image.src = $("#preview").attr('src');

			var id = setInterval(function () {

				if (image.width > 0) {

					//縦横比を維持した縮小サイズを取得
					var w = 800;
					var ratio = w / image.width;
					var h = image.height * ratio;

					// console.log(image.height);
					// console.log(ratio);
					// console.log(h);

					//canvasに描画
					var canvas = $("#canvas");
					var ctx = canvas[0].getContext('2d');
					$("#canvas").attr("width", w);
					$("#canvas").attr("height", h);
					ctx.drawImage(image, 0, 0, w, h);

					clearInterval(id);　//idをclearIntervalで指定している
				}
			}, 10);


		};
		$("#canvas").show();
		$("#buttonScanFile").show();
		fr.readAsDataURL(file);
	}
} // =======================================


function imageUpload() {
	var form = $("#imageForm").get(0);
	var formData = new FormData(form);

	//画像処理してformDataに追加
	if ($("#canvas").length) {
		//canvasに描画したデータを取得
		var canvasImage = $("#canvas").get(0);

		//オリジナル容量(画質落としてない場合の容量)を取得
		var originalBinary = canvasImage.toDataURL("image/jpeg"); //画質落とさずバイナリ化
		var originalBlob = base64ToBlob(originalBinary); //オリジナル容量blobデータを取得
		console.log(originalBlob["size"]);

		//オリジナル容量blobデータをアップロード用blobに設定
		var uploadBlob = originalBlob;

		//オリジナル容量が2MB以上かチェック
		if (2000000 <= originalBlob["size"]) {
			//2MB以下に落とす
			var capacityRatio = 2000000 / originalBlob["size"];
			var processingBinary = canvasImage.toDataURL("image/jpeg", capacityRatio); //画質落としてバイナリ化
			uploadBlob = base64ToBlob(processingBinary); //画質落としたblobデータをアップロード用blobに設定
			console.log(capacityRatio);
			console.log(uploadBlob["size"]);
		}

		//アップロード用blobをformDataに追加
		formData.append("selectImage", uploadBlob);
	}

	var target_url = 'scan';
	$.ajax({
		type: 'POST',
		url: target_url,
		data: formData,
		cache: false,
		contentType: false,
		processData: false,
		dataType: "html"
	})
		.then(
			// 1つめは通信成功時のコールバック
			function (data) {

				var json_return_value = JSON.parse(data);

				if( json_return_value['detectString'] != "" ){
					$('#ScanedTextZone').show();
					$('#sourceLanguage').text(json_return_value['detectLang']);
					$('#targetTranslate').text(json_return_value['detectString']);
				}else{
					alert("can't detect text, please try other image.");
				}
			},
			// 2つめは通信失敗時のコールバック
			function () {
				console.log("読み込み失敗");
			});
	;
} // =======================================

// 引数のBase64の文字列をBlob形式にする
function base64ToBlob(base64) {
	var base64Data = base64.split(',')[1], // Data URLからBase64のデータ部分のみを取得
		data = window.atob(base64Data), // base64形式の文字列をデコード
		buff = new ArrayBuffer(data.length),
		arr = new Uint8Array(buff),
		blob,
		i,
		dataLen;
	// blobの生成
	for (i = 0, dataLen = data.length; i < dataLen; i++) {
		arr[i] = data.charCodeAt(i);
	}
	blob = new Blob([arr], { type: 'image/jpeg' });
	return blob;
} // =======================================

function pullSelectedLanguage() {
	var selectedLanguage = localStorage.SelectedLanguage;

	if (selectedLanguage != null) {
		$('#targetLanguage').text([selectedLanguage]);

		$('#' + selectedLanguage).css("background-color", "lightgray");

	} else {
		$('#targetLanguage').text(["es"]);
		$('#es').css("background-color", "lightgray");

	}

} // =======================================

function pushSelectedLanguage(Obj) {
	var selectLang = $(Obj).attr("lang");
	localStorage.SelectedLanguage = selectLang;

	$('#targetLanguage').text(selectLang);
	$(".languageBox").css("background-color", "white");
	$(Obj).css("background-color", "lightgray");

} // =======================================
