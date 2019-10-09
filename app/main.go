package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"mime/multipart"
	"net/http"
	"os"

	"cloud.google.com/go/translate"
	vision "cloud.google.com/go/vision/apiv1"
	"golang.org/x/text/language"
	"google.golang.org/appengine"
	"google.golang.org/appengine/log"
)

func main() {
	http.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("public/"))))

	// routing
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/scan", scanHandler)
	http.HandleFunc("/translate", translateHandler)

	// static file
	http.HandleFunc("/errorPage", errorPageHandler)
	http.HandleFunc("/sw.js", swHandler)
	http.HandleFunc("/manifest.json", manifestHandler)

	appengine.Main()
}

func indexHandler(httpResponseWriter http.ResponseWriter, httpRequest *http.Request) {
	var templatefile = template.Must(template.ParseFiles("index.html"))
	templatefile.Execute(httpResponseWriter, "index.html")
}

func manifestHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "manifest.json")
}

func swHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "sw.js")
}

func scanHandler(httpResponseWriter http.ResponseWriter, httpRequest *http.Request) {
	ctx := appengine.NewContext(httpRequest)

	var file multipart.File
	var e error

	file, _, e = httpRequest.FormFile("selectImage")
	if e != nil {
		log.Errorf(ctx, "Error: %v", e)
		return
	}

	image, err := vision.NewImageFromReader(file)
	if err != nil {
		log.Errorf(ctx, "Error: %v", e)
		return
	}

	detectLang, detectText, err := detectText(os.Stdout, image, httpRequest)
	if err != nil {
		log.Errorf(ctx, "Error: %v", e)
		detectLang = ""
		detectText = ""
	}

	returnValue := map[string]string{"detectLang": detectLang, "detectString": detectText}

	jsonBytes, err := json.Marshal(returnValue)

	if err != nil {
		log.Errorf(ctx, "Error: %v", e)
		return
	}
	fmt.Fprintf(httpResponseWriter, string(jsonBytes))

}

func translateHandler(httpResponseWriter http.ResponseWriter, httpRequest *http.Request) {
	ctx := appengine.NewContext(httpRequest)

	httpRequest.ParseForm()
	targetTranslate := httpRequest.Form["sourceTranslatePhrase"][0]
	transLanguage := httpRequest.Form["targetLanguageSymbole"][0]

	// Creates a client.
	client, e := translate.NewClient(ctx)
	if e != nil {
		log.Errorf(ctx, "Failed to create client: : %v", e)
	}

	text := targetTranslate

	target, e := language.Parse(transLanguage)
	if e != nil {
		log.Errorf(ctx, "Failed to parse target language:: %v", e)
	}

	translations, e := client.Translate(ctx, []string{text}, target, nil)
	if e != nil {
		log.Errorf(ctx, "Failed to translate text: : %v", e)
	}

	fmt.Fprint(httpResponseWriter, translations[0].Text)

}

//「/errorPage」用のハンドラ
func errorPageHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "%s", "<p>Internal Server Error</p>")
}
