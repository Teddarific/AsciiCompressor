const assert = require('assert');
const fs = require('fs');
const { encode, decode } = require('./asciiCompressor');

// to run tests,
// ./node_modules/mocha/bin/mocha ./

// Encoding tests
describe('Encoding', function(){
  it('should return blank with empty string', function(){
    assert.equal('', encode(''));
  });

  it('should encode a single space', function(){
    assert.equal('01 ', encode(' '));
  });

  it('should encode a basic alphabettic strings', function(){
    assert.equal('03a02b01c', encode('aaabbc'));
    assert.equal('01a01b01d01f03s04f', encode('abdfsssffff'));
  });

  it('should encode basic strings with spaces', function(){
    assert.equal('02a01 02b03 03c', encode('aa bb   ccc'));
  });

  it('should encode more complex strings', function(){
    assert.equal('02402#03 01.05,03 01^02 ', encode('44##   .,,,,,   ^  '))
  });

  it('should encode multi-line strings', function(){
    assert.equal('044\n01a03b', encode('4444\nabbb'));
  })

  it('should encode hanging spaces', function(){
    assert.equal('04a03 \n03 \n03 04b', encode('aaaa   \n   \n   bbbb'))
  });

  it('should encode max line', function(){
    assert.equal('a', encode(new Array(101).join('a')));
  });
});

// Decoding tests
describe('Decoding', function() {
  it('should return blank with empty string', function(){
    assert.equal('', decode(''));
  });

  it('should decode a single space', function(){
    assert.equal(' ', decode('01 '));
  });

  it('should decode a basic alphabettic strings', function(){
    assert.equal('aaabbc', decode('03a02b01c'));
    assert.equal('abdfsssffff', decode('01a01b01d01f03s04f'));
  });

  it('should decode basic strings with spaces', function(){
    assert.equal('aa bb   ccc', decode('02a01 02b03 03c'));
  });

  it('should decode more complex strings', function(){
    assert.equal('44##   .,,,,,   ^  ', decode('02402#03 01.05,03 01^02 '))
  });

  it('should decode multi-line strings', function(){
    assert.equal('4444\nabbb', decode('044\n01a03b'));
  })

  it('should decode hanging spaces', function(){
    assert.equal('aaaa   \n   \n   bbbb', decode('04a03 \n03 \n03 04b'))
  });

  it('should decode max line', function(){
    assert.equal(new Array(101).join('a'), decode('a'));
  });
});

// E2E tests
describe('e2e encoding and decoding', function(){

  const asciiTests = [
    './asciiArt/angry.txt',
    './asciiArt/data.txt',
    './asciiArt/cat.txt',
    './asciiArt/depot.txt',
    './asciiArt/rose.txt',
    './asciiArt/nightshot.txt',
  ];

  asciiTests.forEach(function(test){
    it(`should encode and decode ${test}`, function(done){
      fs.readFile(test, {encoding: 'ascii'}, (err,data) => {
          if (!err) {
              assert(data, decode(encode(data)));
              done();
          } else {
              console.log(err);
          }
      });
    });
  });
});
