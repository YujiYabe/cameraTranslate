// Copyright 2017 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// Command detect uses the Vision API's label detection capabilities to find a label based on an image's content.
package main

import (
	// "flag"
	"fmt"
	"io"
	"os"
	"strings"
)

func callDetectAPI(imagePath string) (string, string) {
	// flag.Usage = func() {
	// 	// imagePath := filepath.Base(os.Args[0])
	// 	fmt.Fprintf(os.Stderr, "Usage: %s <path-to-image>\n", imagePath)
	// 	fmt.Fprintf(os.Stderr, "Pass either a path to a local file, or a URI.\n")
	// 	fmt.Fprintf(os.Stderr, "Prefix a path with gs:// to refer to a file on GCS.\n")
	// }
	// flag.Parse()

	// args := flag.Args()
	// if len(args) == 0 {
	// 	flag.Usage()
	// 	os.Exit(1)
	// }

	path := imagePath
	// path := flag.Arg(0)
	// match := flag.Arg(1)

	samples := []struct {
		name  string
		local func(io.Writer, string) (string, string, error)
		uri   func(io.Writer, string) error
	}{
		{"detectText", detectText, detectTextURI},
		// {"detectDocumentText", detectDocumentText, detectDocumentTextURI},
	}

	for _, sample := range samples {
		// if !strings.Contains(sample.name, match) {
		// 	continue
		// }
		// fmt.Println("---", sample.name)
		var err error

		if strings.Contains(path, "://") {
			err = sample.uri(os.Stdout, path)
		} else {
			detectLang, detectText, err := sample.local(os.Stdout, path)

			if err == nil {
				return detectLang, detectText
			}
		}
		if err != nil {
			fmt.Println("Error:", err)
		}
	}
	return "", ""
}
