// Copyright 2017 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

//go:generate go run generated/gen.go

// DO NOT EDIT THIS FILE.
// It is generated from the source in generated/sample-template.go

package main

// [START imports]
import (
	// "fmt"
	"io"
	"os"

	// "strings"
	"net/http"

	// "golang.org/x/net/context"
	"google.golang.org/appengine"
	pb "google.golang.org/genproto/googleapis/cloud/vision/v1"

	vision "cloud.google.com/go/vision/apiv1"
)

// [END imports]

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
		return "", "", err
	}

	annotations, err := client.DetectTexts(ctx, image, nil, 10)
	if err != nil {
		return "", "", err
	}

	var detectLang, detectText string
	if len(annotations) == 0 {
		// fmt.Fprintln(w, "No text found.")
		return "", "", nil
	}
	detectLang = annotations[0].Locale
	detectText = annotations[0].Description
	return detectLang, detectText, nil
}

// [START vision_detect_document]

// detectDocumentText gets the full document text from the Vision API for an image at the given file path.
// func detectDocumentText(w io.Writer, file string) error {
// 	ctx := context.Background()

// 	client, err := vision.NewImageAnnotatorClient(ctx)
// 	if err != nil {
// 		return err
// 	}

// 	f, err := os.Open(file)
// 	if err != nil {
// 		return err
// 	}
// 	defer f.Close()

// 	image, err := vision.NewImageFromReader(f)
// 	if err != nil {
// 		return err
// 	}
// 	annotation, err := client.DetectDocumentText(ctx, image, nil)
// 	if err != nil {
// 		return err
// 	}

// 	if annotation == nil {
// 		fmt.Fprintln(w, "No text found.")
// 	} else {
// 		fmt.Fprintln(w, "Document Text:")
// 		fmt.Fprintf(w, "%q\n", annotation.Text)

// 		fmt.Fprintln(w, "Pages:")
// 		for _, page := range annotation.Pages {
// 			fmt.Fprintf(w, "\tConfidence: %f, Width: %d, Height: %d\n", page.Confidence, page.Width, page.Height)
// 			fmt.Fprintln(w, "\tBlocks:")
// 			for _, block := range page.Blocks {
// 				fmt.Fprintf(w, "\t\tConfidence: %f, Block type: %v\n", block.Confidence, block.BlockType)
// 				fmt.Fprintln(w, "\t\tParagraphs:")
// 				for _, paragraph := range block.Paragraphs {
// 					fmt.Fprintf(w, "\t\t\tConfidence: %f", paragraph.Confidence)
// 					fmt.Fprintln(w, "\t\t\tWords:")
// 					for _, word := range paragraph.Words {
// 						symbols := make([]string, len(word.Symbols))
// 						for i, s := range word.Symbols {
// 							symbols[i] = s.Text
// 						}
// 						wordText := strings.Join(symbols, "")
// 						fmt.Fprintf(w, "\t\t\t\tConfidence: %f, Symbols: %s\n", word.Confidence, wordText)
// 					}
// 				}
// 			}
// 		}
// 	}

// 	return nil
// }

// // [END vision_detect_document]

// func init() {
// 	// Refer to these functions so that goimports is happy before boilerplate is inserted.
// 	_ = context.Background()
// 	_ = vision.ImageAnnotatorClient{}
// 	_ = os.Open
// }

// // detectText gets text from the Vision API for an image at the given file path.
// func detectTextURI(w io.Writer, file string) error {
// 	ctx := context.Background()

// 	client, err := vision.NewImageAnnotatorClient(ctx)
// 	if err != nil {
// 		return err
// 	}

// 	image := vision.NewImageFromURI(file)
// 	annotations, err := client.DetectTexts(ctx, image, nil, 10)
// 	if err != nil {
// 		return err
// 	}

// 	if len(annotations) == 0 {
// 		fmt.Fprintln(w, "No text found.")
// 	} else {
// 		fmt.Fprintln(w, "Text:")
// 		for _, annotation := range annotations {
// 			fmt.Fprintf(w, "%q\n", annotation.Description)
// 		}
// 	}

// 	return nil
// }

// // [START vision_detect_document_uri]

// // detectDocumentText gets the full document text from the Vision API for an image at the given file path.
// func detectDocumentTextURI(w io.Writer, file string) error {
// 	ctx := context.Background()

// 	client, err := vision.NewImageAnnotatorClient(ctx)
// 	if err != nil {
// 		return err
// 	}

// 	image := vision.NewImageFromURI(file)
// 	annotation, err := client.DetectDocumentText(ctx, image, nil)
// 	if err != nil {
// 		return err
// 	}

// 	if annotation == nil {
// 		fmt.Fprintln(w, "No text found.")
// 	} else {
// 		fmt.Fprintln(w, "Document Text:")
// 		fmt.Fprintf(w, "%q\n", annotation.Text)

// 		fmt.Fprintln(w, "Pages:")
// 		for _, page := range annotation.Pages {
// 			fmt.Fprintf(w, "\tConfidence: %f, Width: %d, Height: %d\n", page.Confidence, page.Width, page.Height)
// 			fmt.Fprintln(w, "\tBlocks:")
// 			for _, block := range page.Blocks {
// 				fmt.Fprintf(w, "\t\tConfidence: %f, Block type: %v\n", block.Confidence, block.BlockType)
// 				fmt.Fprintln(w, "\t\tParagraphs:")
// 				for _, paragraph := range block.Paragraphs {
// 					fmt.Fprintf(w, "\t\t\tConfidence: %f", paragraph.Confidence)
// 					fmt.Fprintln(w, "\t\t\tWords:")
// 					for _, word := range paragraph.Words {
// 						symbols := make([]string, len(word.Symbols))
// 						for i, s := range word.Symbols {
// 							symbols[i] = s.Text
// 						}
// 						wordText := strings.Join(symbols, "")
// 						fmt.Fprintf(w, "\t\t\t\tConfidence: %f, Symbols: %s\n", word.Confidence, wordText)
// 					}
// 				}
// 			}
// 		}
// 	}

// 	return nil
// }

// [END vision_detect_document_uri]
