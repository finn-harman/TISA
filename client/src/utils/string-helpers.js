import { sha256compression } from './hash.js'
var int = require('int')

function dec2hex(str){ // .toString(16) only works up to 2^53
    var dec = str.toString().split(''), sum = [], hex = [], i, s
    while(dec.length){
        s = 1 * dec.shift()
        for(i = 0; s || i < sum.length; i++){
            s += (sum[i] || 0) * 10
            sum[i] = s % 16
            s = (s - sum[i]) / 16
        }
    }
    while(sum.length){
        hex.push(sum.pop().toString(16))
    }
    return hex.join('')
}

function string2bin(str) {
  var output = ""

  for (var i = 0; i < str.length; i++) {
      var bin = (str[i].charCodeAt(0).toString(2)).padStart(8,"0")
      output += bin
  }
  output = output.padStart(128, "0")
  return output;
}

export function convertAndPad(name, postCode, nationalInsurance, email) {
    var personalDetails = name + postCode + nationalInsurance + email
    personalDetails = personalDetails.replace(/\s/g, '')
    personalDetails = personalDetails.toLowerCase()

    // console.log(personalDetails)

    var output = ""

    for (var i = 0; i < personalDetails.length; i++) {
        var bin = (personalDetails[i].charCodeAt(0).toString(2)).padStart(8,"0")
        output += bin
    }

    output = output.padStart(512, "0");

    const personalDetailsBinarySplit = output.match(/.{1,128}/g);

    // console.log(personalDetailsBinarySplit)
    const hash1 = sha256compression(personalDetailsBinarySplit)

    // console.log("testing...")
    // const out0 = "263561599766550617289250058199814760685"
    // const out1 = "65303172752238645975888084098459749904"
    // console.log("out0: " + out0)
    // console.log("out1: " + out1)
    //
    // const hex0 = dec2hex(out0)
    // const hex1 = dec2hex(out1)
    // console.log("hex0: " + hex0)
    // console.log("hex1: " + hex1)
    // console.log("final: " + hex0 + hex1)

    var zero = string2bin("0")
    var five = string2bin("5")
    // console.log(zero)
    // console.log(five)
    output = ""
    output = output.padStart(512, "0")
    // console.log(output)
    // console.log(sha256compression(output))
  }
