# ASCII Art Compressor

A native Javascript ASCII Art compressor. Specifically designed for a maximum of 100 x 100 sized art, and supports all 256 standard ASCII codes. 

## Use
Ensure that you have Node installed on your machine, as well as Yarn if you would like to run the unit tests.

After cloning the repo, run `Yarn` to install Mocha, a library used for unit testing.

Here are the following useful commands. Note that when entering an output file name, if the file doesn't exist, then it will automatically be created.

To **encode** a file,

```
node asciiCompressor.js encode ASCII_ART_FILE.txt OUTPUT_FILE_NAME.txt

// Or shorthand, use 'e' instead

node asciiCompressor.js e ASCII_ART_FILE.txt OUTPUT_FILE_NAME.txt
```

To **decode** a file,

```
node asciiCompressor.js decode ENCODED_FILE_NAME.txt OUTPUT_FILE_NAME.txt

// Or shorthand, use 'd' instead

node asciiCompressor.js d ENCODED_FILE_NAME.txt OUTPUT_FILE_NAME.txt
```

To **analyze** how well a file would be compressed using this algorithm,

```
node asciiCompressor.js analyze ASCII_ART_FILE.txt

// Or shorthand, use 'a' instead

node asciiCompressor.js a ASCII_ART_FILE.txt
```

To run the **unit** and **end to end** tests,

```
./node_modules/mocha/bin/mocha ./
```

## Algorithm Reasoning

My initial thought was to use Huffman Encoding. However, Huffman Encoding involves in addition to the encoded data, passing along a data structure that saves the coded characters, such as a trie. This likely wouldn't be the most efficient on the smaller scale of a 100 x 100 map. Instead, I noticed that these maps tend to have long strings of repeated characters. For example, most lines starts with a string a blank spaces. Thus, I decided on some form of Run Length Encoding. 

## Run Length Encoding

I decided to implement a rudimentary version of a [Run Length Encoding algorithm](https://en.wikipedia.org/wiki/Run-length_encoding). Basically, instead of representing a string of the same character, such as `aaaaa`, we represent it as it's count, and the character, so `aaaaa` becomes `5a`. We effectively turn each consequence sequence of the same character into two bytes. Likewise, `abbcccdddd` becomes `1a2b3c4d`.

However, implementation wise, things get tricky since we must support all 256 ASCII characters - which include numbers. In this case, without an additional delimiter, it becomes impossible to differentiate which character is the character count, and which one is the character itself. For example, if the text is `1111122233`, that would get encoded to `513223`, which is ambigious as to what the original string was. We could include a delimiter, such as a space or comma, but this would require extra logic parsing the encoded text since space is also a valid character. 

Instead, given our assumption that the maximum length of a row is 100 characters, we can instead make each number guaranteed two characters. So `45` stays `45`, but `4` becomes `04`. That way, each encoded becomes three bytes, two for the character count and one for the character itself. But what about the case where a character takes the whole row? i.e. if the character count is 100? In this case, we can encode the row as simply the character, and thats it. E.g., if a row was all `a`'s, we'll encode the line as `a`, and when decoding, we can simply check the length. I decided on this approach since it seemed like this case appeared enough times that it could serve as an appropriate custom optimization.

## Results and Analysis

As with most lossless compression algorithms, RLE works well for certain data sets and not so well for others. As expected from RLE, this algorithm works well for relatively larger ASCII art maps, and ones that have lots of character repetition. In some cases, RLE is actually *worse* than the base file itself. Here are the results of some of the example files (which can be found in the folder `asciiArt` at the top level:

Test File | Rows | Original Size | Compressed Size | Percent Change
:---:|:---:|:---:|:---:|:---:
depot.txt | 29 | 1898 | 2341 | + 23%
nightshot.txt | 37 | 2656 | 2913 | + 9%
angry.txt | 87 | 3741 | 3245 | - 13%
rose.txt | 46 | 1971 | 1512 | - 23%
cat.txt | 87 | 5284 | 3074 | - 41%
data.txt | 85 | 5496 | 3114 | - 43%