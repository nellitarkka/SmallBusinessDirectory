const Listing = require('../models/listing');
const Vendor = require('../models/vendor');
const path = require('path');

// Create a new listing (vendor only)
exports.create = async (req, res) => {
  try {
    const { title, description, city, contactEmail, contactPhone, openingHours, categoryIds } = req.body;
    
    // Get vendor profile
    const vendor = await Vendor.findByUserId(req.user.userId);
    if (!vendor) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Vendor profile not found. Please complete your vendor registration.' 
      });
    }
    
    // Create listing
    const listing = await Listing.create(vendor.id, {
      title,
      description,
      city,
      contactEmail,
      contactPhone,
      openingHours
    });
    
    // Add categories if provided
    if (categoryIds && categoryIds.length > 0) {
      await Listing.addCategories(listing.id, categoryIds);
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Listing created successfully',
      data: { listing }
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// Get all listings (public - with filters)
exports.getAll = async (req, res) => {
  try {
    const { city, category, search } = req.query;
    
    const listings = await Listing.findAll({ city, category, search });
    
    res.json({
      status: 'success',
      results: listings.length,
      data: { listings }
    });
  } catch (error) {
    console.error('Get all listings error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// Get all listings (admin - all statuses)
exports.getAllAdmin = async (req, res) => {
  try {
    const listings = await Listing.findAllAdmin();
    res.json({
      status: 'success',
      results: listings.length,
      data: { listings }
    });
  } catch (error) {
    console.error('Get all admin listings error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update listing status (admin only)
exports.updateStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status - admin can set to active or rejected
    const validStatuses = ['active', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid status. Admin can set to: ${validStatuses.join(', ')}`
      });
    }
    
    // Update status
    const updatedListing = await Listing.update(id, { status });
    
    if (!updatedListing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }
    
    res.json({
      status: 'success',
      message: `Listing status updated to ${status}`,
      data: { listing: updatedListing }
    });
  } catch (error) {
    console.error('Update listing status (admin) error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get one listing by ID (public)
exports.getOne = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Listing not found' 
      });
    }
    
    res.json({
      status: 'success',
      data: { listing }
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// Get my listings (vendor only)
exports.getMine = async (req, res) => {
  try {
    const listings = await Listing.findByVendorUserId(req.user.userId);
    
    res.json({
      status: 'success',
      results: listings.length,
      data: { listings }
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// Update a listing (vendor only - own listings)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    console.log(`[UPDATE] Listing ${id} by user ${userId}`);
    
    // Check if listing exists and belongs to this vendor
    const listing = await Listing.findByIdWithVendor(id);
    
    if (!listing) {
      console.log(`[UPDATE] Listing ${id} not found`);
      return res.status(404).json({ 
        status: 'error', 
        message: 'Listing not found' 
      });
    }
    
    console.log(`[UPDATE] Listing vendor_user_id: ${listing.vendor_user_id}, req.user.userId: ${userId}`);
    
    if (listing.vendor_user_id !== userId) {
      console.log(`[UPDATE] Permission denied - listing belongs to user ${listing.vendor_user_id}`);
      return res.status(403).json({ 
        status: 'error', 
        message: 'You do not have permission to update this listing' 
      });
    }
    
    // Build update object with only provided fields
    const updateData = {};
    
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.city !== undefined) updateData.city = req.body.city;
    if (req.body.contact_email !== undefined) updateData.contact_email = req.body.contact_email;
    if (req.body.contact_phone !== undefined) updateData.contact_phone = req.body.contact_phone;
    if (req.body.opening_hours !== undefined) updateData.opening_hours = req.body.opening_hours;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    
    console.log(`[UPDATE] Updating with data:`, updateData);
    
    // Update listing with only provided fields
    const updatedListing = await Listing.update(id, updateData);
    
    // Update categories if provided
    if (req.body.categoryIds !== undefined) {
      await Listing.removeCategories(id);
      if (req.body.categoryIds.length > 0) {
        await Listing.addCategories(id, req.body.categoryIds);
      }
    }
    
    res.json({
      status: 'success',
      message: 'Listing updated successfully',
      data: { listing: updatedListing }
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// Delete a listing (vendor only - own listings)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if listing exists and belongs to this vendor
    const listing = await Listing.findByIdWithVendor(id);
    
    if (!listing) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Listing not found' 
      });
    }
    
    if (listing.vendor_user_id !== req.user.userId) {
      return res.status(403).json({ 
        status: 'error', 
        message: 'You do not have permission to delete this listing' 
      });
    }
    
    await Listing.delete(id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

module.exports = exports;

// Upload listing image (single) - vendor only, owns listing
exports.uploadImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const listing = await Listing.findByIdWithVendor(id);
    if (!listing) {
      return res.status(404).json({ status: 'error', message: 'Listing not found' });
    }
    if (listing.vendor_user_id !== userId) {
      return res.status(403).json({ status: 'error', message: 'Not allowed to modify this listing' });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    // Build public URL for the uploaded file
    const url = `/uploads/${req.file.filename}`;
    const updated = await Listing.update(id, { image_url: url });

    res.status(200).json({ status: 'success', data: { listing: updated } });
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};
