const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    callerid: {
      type: String,
      required: [true, 'Caller ID is required'],
      trim: true,
      index: true,
    },
    ZipCode: {
      type: String,
      required: [true, 'Zip Code is required'],
      trim: true,
    },
    income: {
      type: Number,
      required: function() {
        return this.QLE === true;
      },
      min: [0, 'Income must be positive'],
    },
    QLE: {
      type: Boolean,
      required: [true, 'QLE status is required'],
    },
    agentname: {
      type: String,
      required: [true, 'Agent name is required'],
      trim: true,
      index: true,
    },
    vendor_code: {
      type: String,
      required: [true, 'Vendor code is required'],
      trim: true,
      index: true,
    },
    lead_source: {
      type: String,
      required: [true, 'Lead source is required'],
      trim: true,
    },
    apiResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ vendor_code: 1, createdAt: -1 });
leadSchema.index({ callerid: 'text' });

module.exports = mongoose.model('Lead', leadSchema);