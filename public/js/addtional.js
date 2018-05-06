"use strict";


function unescapeHTML(str) {
	var div = document.createElement("div");
	div.innerHTML = str.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		// .replace(/ /g, "&nbsp;")
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
		$("#preview").show();
		$("#buttonScanFile").show();
		fr.readAsDataURL(file);
	}
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

