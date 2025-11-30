const Listing = require('../models/listing');
const Vendor = require('../models/vendor');

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
        message: 'You do not have permission to update this listing' 
      });
    }
    
    // Build update object with only provided fields
    const updateData = {};
    
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.city !== undefined) updateData.city = req.body.city;
    if (req.body.contactEmail !== undefined) updateData.contact_email = req.body.contactEmail;
    if (req.body.contactPhone !== undefined) updateData.contact_phone = req.body.contactPhone;
    if (req.body.openingHours !== undefined) updateData.opening_hours = req.body.openingHours;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    
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
