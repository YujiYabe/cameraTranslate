package main

import (
	// "fmt"
	"fmt"
	"io"
	"os"

	// "strings"
	"net/http"

	// "golang.org/x/net/context"
	"google.golang.org/appengine"
	pb "google.golang.org/genproto/googleapis/cloud/vision/v1"

	vision "cloud.google.com/go/vision/apiv1"
) // [END imports]

func init() {
	// Refer to these functions so that goimports is happy before boilerplate is inserted.
	// _ = context.Background()
	// _ = appengine.NewContext()
	_ = vision.ImageAnnotatorClient{}
	_ = os.Open
}

// detectText gets text from the Vision API for an image at the given file path.
// func detectText(w io.Writer, filePath string) (string, string, error) {
// DetectTexts(ctx context.Context, img *pb.Image, ictx *pb.ImageContext, maxResults int, opts ...gax.CallOption)
func detectText(w io.Writer, image *pb.Image, httpRequest *http.Request) (string, string, error) {
	// ctx := context.Background()
	ctx := appengine.NewContext(httpRequest)

	client, err := vision.NewImageAnnotatorClient(ctx)
	if err != nil {
		fmt.Println(err)
		return "", "", err
	}

	annotations, err := client.DetectTexts(ctx, image, nil, 10)
	if err != nil {
		return "", "", err
	}

	var detectLang, detectText string
	if len(annotations) == 0 {
		return "", "", nil
	}

	detectLang = annotations[0].Locale
	detectText = annotations[0].Description

	return detectLang, detectText, nil
}
