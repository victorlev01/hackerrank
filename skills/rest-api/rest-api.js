'use strict';
/*
I selected NodeJs as my language of choice, task is to total goals scored by the winner of football match
we have competition name and year as input parameters.
*/
const fs = require('fs');


process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', function(inputStdin) {
    inputString += inputStdin;
});

process.stdin.on('end', function() {
    inputString = inputString.split('\n');

    main();
});

function readLine() {
    return inputString[currentLine++];
}


const https = require('https');
/*
 * Complete the 'getWinnerTotalGoals' function below.
 *
 * The function is expected to return an INTEGER.
 * The function accepts following parameters:
 *  1. STRING competition
 *  2. INTEGER year
 */

async function executeRequest(url){
    let bodyResponse = null;
    return new Promise((resolve,reject) => {
       const request = https.get(url,function(response){
        const chunks = [];
        response.on('data',function(d){
            chunks.push(d);
        })
        response.on('end',function(e){
            let body = Buffer.concat(chunks);
            body = JSON.parse(body);
           bodyResponse = body;
            resolve(body);
        })
    });
      request.end();
    }) 
}

function getWinnerCount(winner, data){
    
    let goals = 0;
    
        console.log('data '+ data);
    data.forEach(((match) =>{
         const {team1, team2, team1goals, team2goals} = match;
        if(team1 === winner){
         goals+= +team1goals;   
        }
     else  if(team2 === winner){
      goals+= +team2goals;
    }
    }))
    
    
    return goals;
}

async function getWinnerTotalGoals(competition, year) {
    let data = null;
    const competitionString = encodeURI(competition);
    const requestUri = `https://jsonmock.hackerrank.com/api/football_competitions?name=${competitionString}&year=${year}`;
     const competitions = await executeRequest(requestUri);
    const {name, country, winner, runnerup} = competitions.data[0];
    const competitionYear = competitions.year;
    const alreadyPlayed = [];
    let matches = [];
    let winnerGoals = 0;
    
    {
        let page = 1;
        let total_pages = null;
        do{
            const matchesUrl = `https://jsonmock.hackerrank.com/api/football_matches?competition=${competitionString}&year=${year}&team1=${winner}&page=${page}`;
          //  console.log(matchesUrl);
            const matchesResult = await executeRequest(matchesUrl);
            //   console.log(matchesResult.data);
            total_pages = matchesResult.total_pages;
            page++;
           matches = matches.concat(matchesResult.data);
            
            // winnerGoals+=getWinnerCount(winner, matchesResult);
        }
        while(page < total_pages);
    }
     {
        let page = 1;
        let total_pages = null;
        do{
           const matchesUri = `https://jsonmock.hackerrank.com/api/football_matches?competition=${competitionString}&year=${year}&team2=${runnerup}&page=${page}`;
          //  console.log(matchesUri);
            const matchesResult = await executeRequest(matchesUri);
              console.log(matchesResult.data);
            total_pages = matchesResult.total_pages;
            page++;
            matches = matches.concat(matchesResult.data);
            // winnerGoals+=getWinnerCount(winner, matchesResult);
            //  console.log(`runner page = ${page} total = ${total_pages}`);
        }
        while(page < total_pages);
    }
        // let page = 1;
        // const matchesRunnerUp = await executeRequest(`https://jsonmock.hackerrank.com/api/football_matches?competition=${competitionString}&year=${year}&team2=${runnerup}&page=${page}`);
        console.log(matches.length);
    winnerGoals = getWinnerCount(winner, matches);
    return winnerGoals;
}
async function main() {
    const ws = fs.createWriteStream(process.env.OUTPUT_PATH);

    const competition = readLine();

    const year = parseInt(readLine().trim(), 10);

    const result = await getWinnerTotalGoals(competition, year);

    ws.write(result + '\n');

    ws.end();
}
