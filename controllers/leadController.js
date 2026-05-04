const Lead = require('../models/Lead');
const { callRingbaAPI } = require('../services/ringbaService');

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Public
const createLead = async (req, res, next) => {
  try {
    console.log('========================================');
    console.log('📥 NEW LEAD SUBMISSION RECEIVED');
    console.log('========================================');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const { callerid, ZipCode, income, QLE, agentname, vendor_code, lead_source } = req.body;

    if (QLE && (!income || income <= 0)) {
      console.log(' VALIDATION ERROR: Income is required when QLE is true');
      return res.status(400).json({
        success: false,
        message: 'Income is required when QLE is selected',
      });
    }

    console.log('CALLING RINGBA API...');
    const apiResponse = await callRingbaAPI(req.body);
    
    const leadData = {
      callerid,
      ZipCode,
      income: QLE ? income : 0,
      QLE,
      agentname,
      vendor_code,
      lead_source,
      apiResponse: {
        success: apiResponse.success,
        data: apiResponse.data,
        status: apiResponse.status,
        error: apiResponse.error,
        timestamp: new Date(),
      },
    };

    const lead = await Lead.create(leadData);    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  } catch (error) {
    console.log(' ERROR CREATING LEAD:');
    console.log('Error Name:', error.name);
    console.log('Error Message:', error.message);
    if (error.errors) {
      console.log('Validation Errors:', JSON.stringify(error.errors, null, 2));
    }
    next(error);
  }
};

// @desc    Get leads with pagination, search, and filters
// @route   GET /api/leads
// @access  Public
const getLeads = async (req, res, next) => {
  try {
    console.log('Query Params:', JSON.stringify(req.query, null, 2));
    
    const {
      page = 1,
      limit = 10,
      search = '',
      vendor_code,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { callerid: { $regex: search, $options: 'i' } },
        { agentname: { $regex: search, $options: 'i' } },
      ];
    }

    if (vendor_code && vendor_code !== 'all') {
      query.vendor_code = vendor_code;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('-__v')
        .lean(),
      Lead.countDocuments(query),
    ]);

    // Get unique vendor codes for filters
    const vendorCodes = await Lead.distinct('vendor_code');

    console.log(`✅ Found ${leads.length} leads (Total: ${total})`);
    console.log('========================================\n');

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
        filters: {
          vendorCodes: vendorCodes.sort(),
        },
      },
    });
  } catch (error) {
    console.log('ERROR FETCHING LEADS:');
    console.log('Error:', error.message);
    next(error);
  }
};

module.exports = {
  createLead,
  getLeads,
};