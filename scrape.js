const request = require('request');
const cheerio = require('cheerio');
const axios = require('axios');

request('https://corona.ministryinfo.gov.lb/', (error, response, html) => {
    if (!error && response.statusCode == 200) {
        var countryCaseMap = new Map();
        var countryNames = [];
        var rawCountryNames = [];
        var cases = [];
        var dataScript = '';
        var lastCountry
        const $ = cheerio.load(html);

        dataScript = $('script:not([src])')[8
        ].children[0].data;

        //Country names
        rawCountryNames = dataScript.split('cat_str.push');
        lastCountry = rawCountryNames[rawCountryNames.length - 1]?.split(";")[0];
        rawCountryNames.splice(0, 1);
        rawCountryNames.splice(rawCountryNames.length - 1, 1);
        rawCountryNames.push(lastCountry);


        //Cases
        cases = JSON.parse(dataScript.match(/data: (\[.*?\])/)[1])

        for (var i = 0; i < rawCountryNames.length; i++) {

            var countryName = rawCountryNames[i]?.trim();
            countryName = countryName?.replace(/[()]|[;]|[']/g, '');
            countryNames.push(countryName);
            countryCaseMap.set(countryNames[i], cases[i]);
        }

        console.log(countryCaseMap);

        axios
            .post("http://127.0.0.1:8000/api/cases", Object.fromEntries(countryCaseMap))
            .then((res) => {
                console.log(`statusCode: ${res.statusCode}`);
                console.log(res);
            })
            .catch((error) => {
                console.error(error);
            })
    }
});