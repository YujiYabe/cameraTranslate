// https://github.com/sekiyaeiji/vue2x-demo/blob/master/README.md

new Vue({
	el: '#app',
	data: {
		targetLanguage: '',
	},
	mounted() {
		//デフォルト変換先言語の設定
		var selectedLanguage = localStorage.selectedLanguage;
		if (selectedLanguage != null) {
			this.targetLanguage =  localStorage.selectedLanguage;
		} else {
			this.targetLanguage =  "es";
		}
	

	},
	methods: {

		speechText: function (event) {
			speechSynthesis.cancel();

			var langPair = {};
			langPair.ja = 'ja-JP';
			langPair.en = 'en-US';
			langPair.es = 'es-ES';
			langPair.fr = 'fr-FR';
			// var targetLanguage = $('#targetLanguage').text();
			var targetLanguage = this.targetLanguage;
		
			// console.log(targetLanguage);
			var synthes = new SpeechSynthesisUtterance();
			synthes.voiceURI = 'native';
			synthes.volume = 1;
			synthes.rate = 0.9;
			synthes.pitch = 0;
			synthes.text = $('#doneTranslate').text();
			synthes.lang = langPair[targetLanguage];
		
			speechSynthesis.speak(synthes);
		


		},


		pushSelectedLanguage: function (langName, event) {

			var selectLang = langName;
			this.targetLanguage = selectLang;

			localStorage.selectedLanguage = selectLang;
			
		},

		translateText: function (event) {
			var langPair = {};
			langPair.ja = 'jp';
			langPair.en = 'en';
			langPair.es = 'es';
			langPair.fr = 'fr';

			var target_url = 'translate';
			var targetTranslate = $('#targetTranslate').text();
			var targetLanguage = this.targetLanguage;
			var sourceLanguage = $('#sourceLanguage').text();

			// console.log(this.targetLanguage);
			
			if (langPair[sourceLanguage] == targetLanguage) {
				$('#DoneTranslateZone').show();
				var unescapestr = unescapeHTML(targetTranslate);
				$('#doneTranslate').text(unescapestr);
				return;
			} else {
				console.log(targetTranslate);
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
		},


		imageUpload: function (event) {
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

						if (json_return_value['detectString'] != "") {
							$('#ScanedTextZone').show();
							$('#sourceLanguage').text(json_return_value['detectLang']);

							$('#targetTranslate').text(json_return_value['detectString']);
						} else {
							alert("can't detect text, please try other image.");
						}
					},
					// 2つめは通信失敗時のコールバック
					function () {
						console.log("読み込み失敗");
					});
			;


		},
	}
})


var example2 = new Vue({
	el: '#example-2',
	data: {
		name: 'Vue.js'
	},
	// `methods` オブジェクトの下にメソッドを定義する
	methods: {
		greet: function (event) {
			// メソッド内の `this` は、 Vue インスタンスを参照します
			alert('Hello ' + this.name + '!')
			// `event` は、ネイティブ DOM イベントです
			if (event) {
				alert(event.target.tagName)
			}
		}
	}
})






new Vue({
	el: '.js-component01',
	data: {
		text: 'テキストテキストテキスト'
	}
});
// ==================================
new Vue({
	el: '.js-component02',
	data: {
		text: ''
	}
});

// ==================================
new Vue({
	el: '.js-component03',
	data: {
		input: '',
		text: ''
	},
	methods: {
		output: function () {
			this.text = this.input;
		}
	}
});

// ==================================
new Vue({
	el: '.js-component04',
	data: {
		input: '',
		html: ''
	},
	methods: {
		output: function () {
			this.html = '<span style="color: #fc0;">' + this.input + '</span>';
		}
	}
});



// ==================================
new Vue({
	el: '.js-component06',
	data: {
		text: ''
	},
	filters: {
		toUpperCase: function (value) {
			if (!value) return ''
			value = value.toString()
			return value.toUpperCase()
		}
	}
});

// ==================================
new Vue({
	el: '.js-component05',
	data: {
		number: ''
	}
});


// ==================================
new Vue({
	el: '.js-component07',
	data: {
		number: ''
	},
	computed: {
		calc3Times: function () {
			return this.number * 3;
		}
	}
});


// ==================================
new Vue({
	el: '.js-component08',
	data: {
		origin: '100'
	},
	computed: {
		withTax: {
			get: function () {
				return parseInt(this.origin * 1.08)
			},
			set: function (value) {
				this.origin = Math.ceil(value / 1.08);
			}
		}
	}
});


// ==================================
new Vue({
	el: '.js-component09',
	data: {
		isShow: true,
		isHide: false
	},
	methods: {
		toggleClass: function () {
			this.isShow = !this.isShow;
			this.isHide = !this.isHide;
		}
	}
});


// ==================================
new Vue({
	el: '.js-component10',
	data: {
		isChecked: true
	},
	created: function () {
		// this.flag = true;
	}
});


// ==================================
new Vue({
	el: '.js-component11',
	data: {
		data: [
			'hoge',
			'huga',
			'piyo',
			'punyo'
		]
	},
	created: function () {
		this.flag = false;
	}
});


// ==================================
Vue.component('component12', {
	props: ['data'],
	template: '#js-template-component12'
});

new Vue({
	el: '.js-component12',
	data: {
		data: []
	}
});


// ==================================



// ==================================



// ==================================



// ==================================



// ==================================



// ==================================



// ==================================



