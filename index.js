const puppeteer = require('puppeteer');
const cron = require("node-cron");
const express = require("express");
const cheerio = require('cheerio')
var Engine = require('tingodb')();
var db = new Engine.Db(__dirname + '/db', {});
var Server = require('mongodb').Server;
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/myproject';



app = express();
function ExtractDataFromHTML(dataString){
    let results = [];
    const $ = cheerio.load(dataString);
    let colums = [
        "RAP", 
        "GRP", 
        "Sen", 
        "Callout", 	
        "Begin", 
        "End", 
        "FA", 
        "Name", 	
        "COT", 
        "Speaker", 
        "Result", 
        "Report", 
        "Pos", 
        "History"
    ];

    var datarows = $("#myReportTable tr");
    datarows.each((item, val) => {
        let tds = $(val).find('td');
        var row = {};
        for(var i =0; i< colums.length; i++)
            row[colums[i]] = $(tds[i]).text().trim();
        results.push(row);
    });
    //console.log(results);
    return results;

}



function updateDate(dataToSave, base, report){

    ////var mongoclient = new MongoClient(new Server("localhost", 27017), {native_parser: true});

   ///// var MongoClient = require('mongodb').MongoClient
  /////, Server = require('mongodb').Server;

  var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
    var url = 'mongodb://localhost:27017/scrapper';
    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        var db = db.db("scrapper");
        var collection  = db.collection("items");
    
        dataToSave.forEach(element => {
            collection.findOne(element, function(err, item){
                console.log("item11111", item);
                if(!item){
                    element.date = new Date();
                    element.base = base;
                    element.report = report;
                    collection.insert(element, function(err, result) {
                        console.log("EROROORROROROROROROORROROROROOROR", err);
                    });
                }
            })
        });
    });


/*
    var mongoClient = new MongoClient(new Server('localhost', 27017),  {native_parser: true});
    mongoClient.open(function(err, mongoClient) {
        var db1 = mongoClient.db("scrapper");
        console.log("herererererererererererer");
        mongoClient.close();
    });


    console.log("im herer");
    // Open the connection to the server
    mongoclient.open(function(err, mongoclient) {
        console.log("errpr", err);
        var db = mongoclient.db("scrapper");
        var collection = db.collection('items')
        dataToSave.forEach(element => {
            collection.find(element, function(err, item){
                console.log(err);
                console.log(item);
                if(!item){
                    element.date = newDate();
                    element.base = base;
                    element.report = Report;
                    collection.insert(element, function(err, result) {
                        console.log(err);
                    });
                }
            })
        });
    });

    */
}
cron.schedule("* * * * *", function() {
    getData('CLT', 'Aggresive' ,  function(data){
        console.log("getting data");
        dataToSave = ExtractDataFromHTML(data);
        ///console.log(dataToSave);
        
        updateDate(dataToSave, 'CLT', 'Aggresive');
    });
});

let browser = null;
let page = null;


async function getData(base, report ,callback){
    ////console.log(callback);
    if(!browser || !page)
        await doLogin();
    await page.select('#ddlCrewBase', base)
    await page.select('#reportSelection', report)
    await page.click('#ViewReport');

    selector = "#myReportTable"
    await page.waitForFunction(selector => !!document.querySelector(selector), {timeout: 3000000}, selector);
    let text = await page.evaluate(() => document.querySelector('#myReportTable').outerHTML)
    callback(text);
}

async function doLogin(){

    browser = await puppeteer.launch({headless: true, timeout: 0});
    page = await browser.newPage();
    await page.goto('https://faroms.aa.com/FAReserves/Reports/CalloutReports');
    
    await page.type('#userLoginId', '172688');
    await page.type('#userPassword', 'Hankerton8');
    await page.evaluate('submitForm();')
    await page.waitForNavigation();
    let selector = '#ViewReport';
    await page.waitForFunction(selector => !!document.querySelector(selector), {timeout: 0}, selector);
    return;
}

app.post('/load-data/:base', function(req, res){
    var ctl = req.params.base;

//     $salt = "SASdsde333asdfsdSADppzx";
// $xsession = ["userid" => $jetnet_userid, "password" => $password];
// $xsession = json_encode($xsession);
// $xsession = base64_encode($xsession);
// $xsession = substr($salt, 0, 12).$xsession.substr($salt, 14, 7);

});

app.listen(3000);