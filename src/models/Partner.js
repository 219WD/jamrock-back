const mongoose = require('mongoose');
const { Schema } = mongoose;

const PartnerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adress: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    dni: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    reprocann: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Partner', PartnerSchema);
