package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"

	"cloud.google.com/go/translate"
	vision "cloud.google.com/go/vision/apiv1"
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
	outPutLog(r)
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
} // -----------------------------------------------------------------

// -----------------------------------------------------------------
func indexHandler(w http.ResponseWriter, r *http.Request) {
	outPutLog(r)
	var templatefile = template.Must(template.ParseFiles("index.html"))
	templatefile.Execute(w, "index.html")
} // -----------------------------------------------------------------

// -----------------------------------------------------------------
func translateHandler(httpResponseWriter http.ResponseWriter, httpRequest *http.Request) {
	outPutLog(httpRequest)
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
	outPutLog(httpRequest)

	var file multipart.File
	var e error

	file, _, e = httpRequest.FormFile("selectImage")
	if e != nil {
		return
	}
	image, err := vision.NewImageFromReader(file)
	if err != nil {
		return
	}

	detectLang, detectText, err := detectText(os.Stdout, image)
	if err != nil {
		detectLang = ""
		detectText = ""
	}

	returnValue := map[string]string{"detectLang": detectLang, "detectString": detectText}

	jsonBytes, err := json.Marshal(returnValue)

	if err != nil {
		fmt.Println("JSON Marshal error:", err)
		return
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

func outPutLog(s interface{}) {
	logfile, err := os.OpenFile("./log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		panic("cannnot open test.log:" + err.Error())
	}
	defer logfile.Close()

	log.SetOutput(io.MultiWriter(logfile, os.Stdout))

	log.SetFlags(log.Ldate | log.Ltime)
	// log.Println(s)
} // -----------------------------------------------------------------
