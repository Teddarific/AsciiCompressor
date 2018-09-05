const fs = require('fs');
const path = require('path');

const MAX_WIDTH = 100;

main();

// Main system
function main(){
  switch ( process.argv[2] ){
    case 'encode':
    case 'e':
      encodeFile(process.argv[3], process.argv[4]);
      break;
    case 'decode':
    case 'd':
      decodeFile(process.argv[3], process.argv[4]);
      break;
    case 'analyze':
    case 'a':
      analyzeCompression(process.argv[3]);
      break;
    default:
      console.log("Invalid command. See README for help.");
      break;
  }
}

// Given data, encode it with RLE
function encode(data) {
  let rows = data.split('\n');
  let allResults = [];
  rows.forEach((row) => {
    let rowChars = row.split('');
    let lastSeen = row[0];
    let currCount = 0;
    let result = '';

    rowChars.forEach((c) => {
      if ( c === lastSeen ){
        currCount += 1;
      } else {
        currCount = currCount.toString().length == 1 ? '0' + currCount : currCount.toString();
        result += `${currCount}${lastSeen}`;
        lastSeen = c;
        currCount = 1;
      }
    });

    // Check for edge case if row is only one character
    if ( currCount === MAX_WIDTH){
      result = `${lastSeen}`;
    } else if ( currCount > 0 ){
      currCount = currCount.toString().length == 1 ? '0' + currCount : currCount.toString();
      result += `${currCount}${lastSeen}`;
    }
    allResults.push(result);
  });

  return allResults.join('\n');
}

// Encode a given file
function encodeFile(fileName, outputFileName){
  const cb = (data) => {
    const encodedData = encode(data);
    if ( outputFileName ){
      const outputFilePath = path.join(__dirname, outputFileName);
      writeFile(outputFilePath, encodedData);
    }
    return data;
  }
  return readFile(fileName, cb)
}

// Decodes encoded data from RLE
function decode(data) {
  let rows = data.split('\n');
  let allResults = [];
  rows.forEach((row) => {
    let result = ''
    // All chars in row are the same
    if ( row.length === 1 ){
      result = new Array(MAX_WIDTH + 1).join( row[0] );
    } else {
      for ( let i = 0; i < row.length - 2; i += 3 ){
        const length = parseInt(row.slice(i, i + 2));
        const c = row.slice(i + 2, i + 3);
        result += new Array(length + 1).join( c );
      }
    }
    allResults.push(result);
  });
  return allResults.join('\n');
}

// Decode a given file
function decodeFile(fileName, outputFileName){
  const cb = (data) => {
    const decodedData = decode(data);
    if ( outputFileName ){
      const outputFilePath = path.join(__dirname, outputFileName);
      writeFile(outputFilePath, decodedData);
    }
    return data;
  }
  return readFile(fileName, cb)
}

/************************/
/*** HELPER FUNCTIONS ***/
/************************/
function readFile(fileName, callback){
  const filePath = path.join(__dirname, fileName);
  fs.readFile(filePath, {encoding: 'ascii'}, (err,data) => {
      if (!err) {
          return callback(data);
      } else {
          console.log(err);
      }
  });
}

function writeFile(fileName, data){
  const filePath = path.join(__dirname, fileName);
  fs.writeFile(fileName, data, function(err) {
    if(err) {
      return console.log(err);
    }
  });
}

function analyzeCompression(fileName){
  if ( !fileName ){
    console.log(`Cannot find file ${fileName}`);
  }
  const cb = (data) => {
    console.log(`Rows: ${data.split('\n').length}`)
    console.log(`Original: ${data.length}`)
    const encodedData = encode(data);
    console.log(`Compressed: ${encodedData.length}`);
    const percentReduction = (encodedData.length - data.length) / data.length;
    console.log(`Percent reduction: ${percentReduction}%`);
  };
  readFile(fileName, cb);
}

module.exports = { encode, decode, readFile };
