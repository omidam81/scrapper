const puppeteer = require('puppeteer');
const cron = require("node-cron");
const express = require("express");
const cheerio = require('cheerio')
var Engine = require('tingodb')();
var db = new Engine.Db(__dirname + '/db', {});


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
    console.log(results);
    return results;

}



function updateDate(dataToSave){
    var collection = db.collection("items");
        collection.insert(dataToSave, {w:1}, function(err, result) {
            console.log(err);
        });


}
cron.schedule("* * * * *", function() {
    getData(function(data){
        console.log("getting data");
        dataToSave = ExtractDataFromHTML(data);
        ///console.log(dataToSave);
        updateDate(dataToSave);
    });
});

let browser = null;
let page = null;


async function getData(callback){
    ////console.log(callback);
    if(!browser || !page)
        await doLogin();
    await page.select('#ddlCrewBase', 'CLT')
    await page.select('#reportSelection', 'Aggresive')
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

app.listen(29000);