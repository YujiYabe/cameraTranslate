// Copyright 2015 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// Sample helloworld is a basic App Engine flexible app.
package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/translate"
	"golang.org/x/net/context"
	"golang.org/x/text/language"
) // -----------------------------------------------------------------

// -----------------------------------------------------------------
func main() {
	http.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("public/"))))

	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/scan", scanHandler)
	http.HandleFunc("/translate", translateHandler)

	http.HandleFunc("/errorPage", errorPageHandler)

	log.Print("Listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))

} // -----------------------------------------------------------------

// -----------------------------------------------------------------
func handle(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
} // -----------------------------------------------------------------

// -----------------------------------------------------------------
func indexHandler(w http.ResponseWriter, r *http.Request) {
	var templatefile = template.Must(template.ParseFiles("index.html"))
	templatefile.Execute(w, "index.html")
} // -----------------------------------------------------------------

// -----------------------------------------------------------------
func translateHandler(httpResponseWriter http.ResponseWriter, httpRequest *http.Request) {
	ctx := context.Background()
	httpRequest.ParseForm()
	targetTranslate := httpRequest.Form["sourceTranslatePhrase"][0]
	transLanguage := httpRequest.Form["targetLanguageSymbole"][0]
	// fmt.Println("=================")
	// fmt.Println(httpRequest)
	// fmt.Println(targetTranslate)
	// fmt.Println(transLanguage)
	// fmt.Println("=================")

	// Creates a client.
	client, err := translate.NewClient(ctx)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}

	text := targetTranslate

	target, err := language.Parse(transLanguage)
	if err != nil {
		log.Fatalf("Failed to parse target language: %v", err)
	}

	// Translates the text into Russian.
	translations, err := client.Translate(ctx, []string{text}, target, nil)
	if err != nil {
		log.Fatalf("Failed to translate text: %v", err)
	}

	fmt.Fprint(httpResponseWriter, translations[0].Text)

} // -----------------------------------------------------------------

// -----------------------------------------------------------------
func scanHandler(httpResponseWriter http.ResponseWriter, httpRequest *http.Request) {

	//MultipartReaderを用いて受け取ったファイルを読み込み
	reader, err := httpRequest.MultipartReader()

	var filePath string
	//エラーが発生したら抜ける
	if err != nil {
		http.Error(httpResponseWriter, err.Error(), http.StatusInternalServerError)
		return
	}

	//forで複数ファイルがある場合に、すべてのファイルが終わるまで読み込む
	for {
		part, err := reader.NextPart()
		if err == io.EOF {
			break
		}

		//ファイル名がない場合はスキップする
		if part.FileName() == "" {
			continue
		}

		const layout = "2006-01-02_15-04-05.000_"
		// s := ""
		t1 := time.Now()
		t2 := t1.Format(layout)

		filePath = "tempfile/" + t2 + part.FileName() + ".jpg"

		// fmt.Println(filePath)
		uploadedFile, err := os.Create(filePath)

		if err != nil {
			http.Error(httpResponseWriter, err.Error(), http.StatusInternalServerError)
			uploadedFile.Close()
			redirectToErrorPage(httpResponseWriter, httpRequest)
			return
		}

		//作ったファイルに読み込んだファイルの内容 を丸ごとコピー
		_, err = io.Copy(uploadedFile, part)
		if err != nil {
			http.Error(httpResponseWriter, err.Error(), http.StatusInternalServerError)
			uploadedFile.Close()
			redirectToErrorPage(httpResponseWriter, httpRequest)
			return
		}

		uploadedFile.Close()
	}

	detectLang, detectString := callDetectAPI(filePath)

	returnValue := map[string]string{"detectLang": detectLang, "detectString": detectString}

	jsonBytes, err := json.Marshal(returnValue)

	// if err != nil {
	// 	fmt.Println("JSON Marshal error:", err)
	// 	return
	// }

	if err := os.Remove(filePath); err != nil {
		fmt.Println(err)
	}

	fmt.Fprintf(httpResponseWriter, string(jsonBytes))

} // -----------------------------------------------------------------

//「/errorPage」用のハンドラ
func errorPageHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "%s", "<p>Internal Server Error</p>")
} // -----------------------------------------------------------------

// errorが起こった時にエラーページに遷移する
func redirectToErrorPage(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/errorPage", http.StatusFound)
} // -----------------------------------------------------------------
