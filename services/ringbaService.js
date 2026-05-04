const axios = require('axios');

const RINGBA_API_URL = "https://display.ringba.com/enrich/2948227265420330595";

const callRingbaAPI = async (leadData) => {
  try {
    const params = {
      callerid: leadData.callerid,
      exposeCallerId: 'yes',
      ZipCode: leadData.ZipCode,
      income: leadData.income,
      QLE: leadData.QLE,
      agentname: leadData.agentname,
      vendor_code: leadData.vendor_code,
      lead_source: leadData.lead_source,
    };

    const response = await axios.get(RINGBA_API_URL, {
      params,
      timeout: 10000,
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('Ringba API Error:', error.message);
    
    return {
      success: false,
      data: null,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
};

module.exports = { callRingbaAPI };