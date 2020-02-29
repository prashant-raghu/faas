package main

import (
	"encoding/json"
	"fmt"
	"hash/fnv"
	"io/ioutil"
	"net/http"

	"github.com/bradfitz/gomemcache/memcache"
)

type getC struct {
	user_id string
	fName   string
}

//Helpers
func hash(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}

func hello(w http.ResponseWriter, req *http.Request) {

	fmt.Fprintf(w, "Cache Service for faas!\n")
}

func setCache(w http.ResponseWriter, req *http.Request) {
	if req.Method == "POST" {
		mc := memcache.New("127.0.0.1:11211")
		res := ""
		body, err := ioutil.ReadAll(req.Body)
		if err != nil {
			http.Error(w, "Error reading request body",
				http.StatusInternalServerError)
		}
		//Ready Body
		in := []byte(string(body))
		var obj map[string]interface{}
		if err := json.Unmarshal(in, &obj); err != nil {
			panic(err)
		}
		//obj is body
		user_id := obj["user_id"]
		fName := obj["fName"]
		fRes := obj["fRes"]
		str := fmt.Sprintf("%v---%v", user_id, fName)
		mc.Set(&memcache.Item{Key: string(hash(str)), Value: []byte(string(fmt.Sprintf("%v", fRes)))})
		if err != nil {
			res = "Failed"
		} else {
			res = "Success"
		}
		out, _ := json.Marshal(obj)
		println(string(out))
		fmt.Fprintf(w, res)
	} else {
		fmt.Fprintln(w, "Cache Service for faas!")
	}

}

func getCache(w http.ResponseWriter, req *http.Request) {
	if req.Method == "POST" {
		mc := memcache.New("127.0.0.1:11211")
		res := ""
		body, err := ioutil.ReadAll(req.Body)
		if err != nil {
			http.Error(w, "Error reading request body",
				http.StatusInternalServerError)
		}
		//Ready Body
		in := []byte(string(body))
		var obj map[string]interface{}
		if err := json.Unmarshal(in, &obj); err != nil {
			panic(err)
		}
		//obj is body
		user_id := obj["user_id"]
		fName := obj["fName"]
		str := fmt.Sprintf("%v---%v", user_id, fName)
		it, err := mc.Get(string(hash(str)))
		if err != nil {
			res = "Failed"
		} else {
			res = string(it.Value)
			fmt.Println(string(it.Value))

		}
		// out, _ := json.Marshal(obj)
		// println(string(out))
		fmt.Fprintf(w, res)
	} else {
		fmt.Fprintln(w, "Cache Service for faas!")
	}
}

func headers(w http.ResponseWriter, req *http.Request) {

	for name, headers := range req.Header {
		for _, h := range headers {
			fmt.Fprintf(w, "%v: %v\n", name, h)
		}
	}
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", hello)
	mux.HandleFunc("/getCache", getCache)
	mux.HandleFunc("/setCache", setCache)
	mux.HandleFunc("/headers", headers)
	fmt.Println("Cache Service Listening on port 8090!")
	http.ListenAndServe(":8090", mux)
}
