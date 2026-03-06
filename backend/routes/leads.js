const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get all leads with filtering and search
router.get('/', async (req, res) => {
  try {
    const { niche, status, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 50 } = req.query;
    
    // Build query
    let query = {};
    
    if (niche && niche !== 'all') {
      query.niche = niche;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Text search across multiple fields
    if (search && search.trim() !== '') {
      query.$or = [
        { businessOwnerName: { $regex: search, $options: 'i' } },
        { problem: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort order
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination
    const total = await Lead.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);
    
    // Fetch leads with pagination
    const leads = await Lead.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    res.json({ 
      success: true, 
      count: leads.length,
      total,
      page: pageNum,
      totalPages,
      leads 
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching leads' 
    });
  }
});

// Get single lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }
    
    res.json({ 
      success: true, 
      lead 
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching lead' 
    });
  }
});

// Create new lead
router.post('/', async (req, res) => {
  try {
    const { businessOwnerName, website, address, phoneNumber, problem, niche, status, notes } = req.body;
    
    // Validation
    if (!businessOwnerName || !address || !phoneNumber || !problem || !niche) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }
    
    const lead = new Lead({
      businessOwnerName,
      website: website || '',
      address,
      phoneNumber,
      problem,
      niche,
      status: status || 'not-contacted',
      notes: notes || ''
    });
    
    await lead.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Lead created successfully',
      lead 
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating lead' 
    });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const { businessOwnerName, website, address, phoneNumber, problem, niche, status, notes } = req.body;
    
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        businessOwnerName,
        website,
        address,
        phoneNumber,
        problem,
        niche,
        status,
        notes
      },
      { new: true, runValidators: true }
    );
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Lead updated successfully',
      lead 
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating lead' 
    });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lead not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Lead deleted successfully' 
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting lead' 
    });
  }
});

// Get stats (count by niche and status)
router.get('/stats/summary', async (req, res) => {
  try {
    const nicheStats = await Lead.aggregate([
      { $group: { _id: '$niche', count: { $sum: 1 } } }
    ]);
    
    const statusStats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const totalLeads = await Lead.countDocuments();
    
    res.json({ 
      success: true,
      stats: {
        total: totalLeads,
        byNiche: nicheStats,
        byStatus: statusStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stats' 
    });
  }
});

module.exports = router;
