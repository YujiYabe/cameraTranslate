new Vue({
  el: '#app',
  data: {
    sourceLanguageSymbole: '',
    sourceTranslatePhrase: '',
    targetLanguageSymbole: '',
    targetTranslatePhrase: '',
    isShowPreview: false,
    isShowButtonScanFile: false,
    isShowZoneScanedText: false,
    isShowZoneDoneTranslate: false,
    langSet: {
      'ja': { 'translate': 'jp', 'speech': 'ja-JP' },
      'en': { 'translate': 'en', 'speech': 'en-US' },
      'es': { 'translate': 'es', 'speech': 'es-ES' },
      'fr': { 'translate': 'fr', 'speech': 'fr-FR' },
      'zh': { 'translate': 'zh', 'speech': 'zh-CN' },
      'ru': { 'translate': 'ru', 'speech': 'ru-RU' },
      'ko': { 'translate': 'ko', 'speech': 'ko-KO' },
      'ar': { 'translate': 'ar', 'speech': 'ar-AR' },
    }
  },

  mounted() {
    //デフォルト変換先言語の設定
    this.setTargetLanguageSymbole(this.getLocalstorageTargetLanguageSymbole() || "ja");
    this.displayWaitImage(false);
  },
  methods: {

    //=========================================================================-
    canvasDraw: function (event) {
      const file = document.getElementById('imageSelect').files[0];

      // //画像ファイルかチェック
      if (file["type"] != "image/jpeg" && file["type"] != "image/png" && file["type"] != "image/gif") {
        alert("画像ファイルを選択してください");
        document.getElementById('imageSelect').value = ''; //選択したファイルをクリア

      } else {
        const fr = new FileReader();
        fr.onload = function () {
          //選択した画像を一旦imgタグに表示
          document.getElementById('preview').src = fr.result;

          //imgタグに表示した画像をimageオブジェクトとして取得
          const image = new Image();
          image.src = document.getElementById('preview').src;

          const id = setInterval(function () {

            if (image.width > 0) {
              //縦横比を維持した縮小サイズを取得
              const w = 800;
              const ratio = w / image.width;
              const h = image.height * ratio;

              //canvasに描画
              const canvas = document.getElementById('canvas');
              const ctx = canvas.getContext('2d');
              document.getElementById('canvas').setAttribute('width', w);
              document.getElementById('canvas').setAttribute('height', h);

              ctx.drawImage(image, 0, 0, w, h);
              clearInterval(id);
            }
          }, 10);

        };
        this.setIsShowPreview(true);
        this.setIsShowButtonScanFile(true);

        fr.readAsDataURL(file);
      }

    },

    //=========================================================================-
    imageUpload: function (event) {
      this.displayWaitImage(true);

      const maxSize = 2000000;
      let formData = new FormData(document.getElementById("imageForm"));

      //画像処理してformDataに追加
      if (Object.keys(document.getElementById('canvas')).length) {

        //canvasに描画したデータを取得
        const canvasImage = document.getElementById('canvas');

        //オリジナル容量(画質落としてない場合の容量)を取得
        const originalBinary = canvasImage.toDataURL("image/jpeg"); //画質落とさずバイナリ化
        const originalBlob = this.base64ToBlob(originalBinary); //オリジナル容量blobデータを取得

        //オリジナル容量blobデータをアップロード用blobに設定
        const uploadBlob = originalBlob;

        //オリジナル容量が2MB以上かチェック
        if (maxSize <= originalBlob["size"]) {

          const capacityRatio = maxSize / originalBlob["size"]; //2MB以下に落とす
          const processingBinary = canvasImage.toDataURL("image/jpeg", capacityRatio); //画質落としてバイナリ化
          uploadBlob = base64ToBlob(processingBinary); //画質落としたblobデータをアップロード用blobに設定
        }

        //アップロード用blobをformDataに追加
        formData.append("selectImage", uploadBlob);
      }

      axios.post('scan', formData)
        .then(function (res) {
          this.setSourceLanguageSymbole(res.data.detectLang);
          this.setSourceTranslatePhrase(res.data.detectString);

          this.setIsShowZoneScanedText(true);
          this.displayWaitImage(false);

        }.bind(this)).catch(function (err) {
          console.log(err);
          this.displayWaitImage(false);

        }.bind(this));

    },



    //=========================================================================-
    translateText: function (event) {
      this.displayWaitImage(true);

      const langSet = this.getLangSet();

      const sourceTranslatePhrase = document.getElementById('sourceTranslatePhrase').innerText;
      const targetLanguageSymbole = this.getTargetLanguageSymbole();
      const sourceLanguageSymbole = this.getSourceLanguageSymbole();

      if (langSet[sourceLanguageSymbole]['translate'] == targetLanguageSymbole) {
        // 翻訳先が同じ言語であればスキップ
        this.setIsShowZoneDoneTranslate(true);

        const unescapestr = this.unescapeHTML(targetTranslate);

        this.setTargetTranslatePhrase(unescapestr);
        this.displayWaitImage(false);
        return;

      } else {
        let post_data = new URLSearchParams();
        post_data.append('sourceTranslatePhrase', sourceTranslatePhrase);
        post_data.append('targetLanguageSymbole', targetLanguageSymbole);

        axios.post('translate', post_data)
          .then(function (res) {
            this.setIsShowZoneDoneTranslate(true);

            const unescapestr = this.escapeHTML(res.data);

            this.setTargetTranslatePhrase(unescapestr);
            this.displayWaitImage(false);

          }.bind(this)).catch(function (err) {
            this.displayWaitImage(false);
            console.log(err);
          }.bind(this));

      }
    },

    //=========================================================================-
    speechText: function (event) {
      this.displayWaitImage(true);

      speechSynthesis.cancel();

      const langSet = this.getLangSet();
      const targetLanguageSymbole = this.getTargetLanguageSymbole();

      const synthes = new SpeechSynthesisUtterance();
      synthes.voiceURI = 'native';
      synthes.volume = 1;
      synthes.rate = 0.9;
      synthes.pitch = 0;
      synthes.text = this.getTargetTranslatePhrase();
      synthes.lang = langSet[targetLanguageSymbole]['speech'];

      speechSynthesis.speak(synthes);
      this.displayWaitImage(false);

    },


    //=========================================================================-
    pushSelectedLanguage: function (langName, event) {
      this.setTargetLanguageSymbole(langName);
      this.setLocalstorageTargetLanguageSymbole(langName);
    },

    //=========================================================================-
    unescapeHTML: function (str, event) {
      const returnstr = str
        .replace(/&/g, "&amp;")
        .replace(/'/g, "&#x27;")
        .replace(/`/g, "&#x60;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\r/g, "&#13;")
        .replace(/\n/g, "&#10;")

        ; //-----------------------
      return returnstr;
    },

    //=========================================================================-
    escapeHTML: function (str, event) {
      const returnstr = str
        .replace(/&amp;/g, "&")
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&#x60;/g, "`")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#13;/g, "\r")
        .replace(/&#10;/g, "\n")
        ; //-----------------------
      return returnstr;
    },

    // 引数のBase64の文字列をBlob形式にする
    //=========================================================================-
    base64ToBlob: function (base64, event) {
      const base64Data = base64.split(',')[1], // Data URLからBase64のデータ部分のみを取得
        data = window.atob(base64Data), // base64形式の文字列をデコード
        buff = new ArrayBuffer(data.length),
        arr = new Uint8Array(buff);
      let blob;

      // blobの生成
      for (i = 0, dataLen = data.length; i < dataLen; i++) {
        arr[i] = data.charCodeAt(i);
      }
      blob = new Blob([arr], { type: 'image/jpeg' });
      return blob;

    },


    //=========================================================================-
    displayWaitImage: function (isWait, event) {
      if (isWait) {
        document.getElementById('waitImageZone').style.display = 'block';
        document.getElementById('applicationZone').style.display = 'none';
      } else {
        document.getElementById('waitImageZone').style.display = 'none';
        document.getElementById('applicationZone').style.display = 'block';
      }
    },

    methodClassAplly(select) {
      const one = select;
      const two = this.getTargetLanguageSymbole();
      const applyColor = one === two ? "blue lighten-3  " : "grey lighten-3";
      return applyColor;
    },


    // getter___________________-
    getLangSet: function () { return this.langSet; },

    getSourceLanguageSymbole: function () { return this.sourceLanguageSymbole; },
    getSourceTranslatePhrase: function () { return this.sourceTranslatePhrase; },
    getTargetLanguageSymbole: function () { return this.targetLanguageSymbole; },
    getTargetTranslatePhrase: function () { return this.targetTranslatePhrase; },
    getLocalstorageTargetLanguageSymbole: function () { return localStorage.selectedLanguage; },

    // setter___________________-
    setIsShowPreview: function (context) { this.isShowPreview = context; },
    setIsShowButtonScanFile: function (context) { this.isShowButtonScanFile = context; },
    setIsShowZoneScanedText: function (context) { this.isShowZoneScanedText = context; },
    setIsShowZoneDoneTranslate: function (context) { this.isShowZoneDoneTranslate = context; },

    setSourceLanguageSymbole: function (context) { this.sourceLanguageSymbole = context; },
    setSourceTranslatePhrase: function (context) { this.sourceTranslatePhrase = context; },
    setTargetLanguageSymbole: function (context) { this.targetLanguageSymbole = context; },
    setTargetTranslatePhrase: function (context) { this.targetTranslatePhrase = context; },
    setLocalstorageTargetLanguageSymbole: function (context) { localStorage.selectedLanguage = context; },

  }
})





