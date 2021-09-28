const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NaturopathSchema = new Schema({
    name: String,
    image: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]

});

module.exports = mongoose.model('Naturopath', NaturopathSchema);
