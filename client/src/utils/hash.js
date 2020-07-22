import SHA256Compress from 'sha256-compression-algorithm';

export function sha256compression(input) {
  var Buffer = require('buffer/').Buffer
  var buf = new Buffer(input, 'hex');
  var output = SHA256Compress(buf).toString('hex');
  return output;
}
