const fs = require('fs')
      cheerio = require('cheerio')
      axios = require('axios')
const path = require('path');
const express = require('express')
app = express();
var mkdirp = require("mkdirp");


app.use("/public",express.static(path.join(__dirname, 'public')));

//middleware bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//Main File for keyword
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/index.html'))
 })
 app.get('/index', function(req, res){
    res.sendFile(path.join(__dirname+'/index.html'))
 })

//output file
app.post('/',urlencodedParser, function (req, res) {
    var SEARCH_TERM = req.body.word;
     console.log(SEARCH_TERM);
    res.sendFile(path.join(__dirname+'/tpage.html'))

    //folder creating
mkdirp('./images/'+SEARCH_TERM, function (err) {
    if (err) console.error(err)
    else console.log('Create Folder with your word : ' + SEARCH_TERM)
});

//web scraping script here

//get website by step to step
function websiteImage(){
    return axios.get(`https://unsplash.com/search/photos/${SEARCH_TERM}`).then(res => res.data)
}

//get image url
function getImages(data){
    return new Promise((resolve,reject) => {
        if(data){
            const $ = cheerio.load(data)
            const links = $('a[title="Download photo"]').map((index , image)=> {
                //image url into terminal 
                console.log($(image).attr('href'))
                return $(image).attr('href')
            })
            resolve(links)
        }
    })

}

//download images
function downloadImages(images){
    images.map( (index, image) => {
        axios({
            method:'get',
            responseType : 'stream',
            url : image
        }).then((item) =>{
            item.data.pipe(fs.createWriteStream(`./images/${SEARCH_TERM}/${SEARCH_TERM}${index}.jpg`))
        })
    })
}

//run final all the function step by step
websiteImage().then(getImages).then(downloadImages)

});
//finish post method

//take port to run script
app.listen(5000,function(err){
    if(err) throw err;
    console.log("port 5000 started!!!");
});



