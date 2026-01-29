const Category = require('../models/category');

const categoryController = {
  // Get all categories
  async getAll(req, res) {
    try {
      const categories = await Category.findAll();
      res.json({
        status: 'success',
        results: categories.length,
        data: { categories }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Get single category
  async getOne(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }
      res.json({
        status: 'success',
        data: { category }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Create category (admin only)
  async create(req, res) {
    try {
      const { name } = req.body;
      const category = await Category.create(name);
      res.status(201).json({
        status: 'success',
        data: { category }
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          status: 'error',
          message: 'Category already exists'
        });
      }
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Update category (admin only)
  async update(req, res) {
    try {
      const category = await Category.update(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }
      res.json({
        status: 'success',
        data: { category }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Delete category (admin only)
  async delete(req, res) {
    try {
      const category = await Category.delete(req.params.id);
      if (!category) {
        return res.status(404).json({
          status: 'error',
          message: 'Category not found'
        });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = categoryController;
