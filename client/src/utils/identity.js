var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

let Identity = new Schema({
    name: {
      type: String
    },
    postCode: {
      type: String
    },
    nationalInsurance: {
      type: String
    },
    email: {
      type: String
    },
    totalISA: {
      type: Number
    },
    blacklisted: {
      type: Boolean
    },
    hash: {
      type: String
    },
    address: {
      type: String,
      default: "0"
    }
});

module.exports = mongoose.model('Identity', Identity);
