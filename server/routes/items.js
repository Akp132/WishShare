const express = require('express');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const Wishlist = require('../models/Wishlist');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlists/:wishlistId/items
// @desc    Get all items in a wishlist
// @access  Private
router.get('/:wishlistId/items', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.wishlistId);
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.ownerId.equals(req.user._id) || 
                     wishlist.members.some(member => member.userId.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = await Item.find({ wishlistId: req.params.wishlistId })
      .populate('addedBy', 'displayName email avatarUrl')
      .populate('editedBy', 'displayName email avatarUrl')
      .populate('claimedBy', 'displayName email avatarUrl')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/wishlists/:wishlistId/items
// @desc    Add an item to a wishlist
// @access  Private
router.post('/:wishlistId/items', [
  auth,
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('url').optional().isURL().withMessage('Please enter a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const wishlist = await Wishlist.findById(req.params.wishlistId);
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.ownerId.equals(req.user._id) || 
                     wishlist.members.some(member => member.userId.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, imageUrl, price, currency, url, priority } = req.body;

    const item = new Item({
      wishlistId: req.params.wishlistId,
      name,
      description,
      imageUrl: imageUrl || `https://source.unsplash.com/400x300/?${encodeURIComponent(name)}`,
      price,
      currency: currency || 'USD',
      url,
      priority: priority || 'medium',
      addedBy: req.user._id
    });

    await item.save();
    await item.populate('addedBy', 'displayName email avatarUrl');

    // Emit real-time event
    req.app.get('socketio').to(`wishlist_${req.params.wishlistId}`).emit('item_added', {
      item: item.toJSON(),
      addedBy: req.user._id
    });

    res.status(201).json({
      message: 'Item added successfully',
      item: item.toJSON()
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/wishlists/:wishlistId/items/:itemId
// @desc    Update an item
// @access  Private
router.put('/:wishlistId/items/:itemId', [
  auth,
  body('name').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('url').optional().isURL().withMessage('Please enter a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const wishlist = await Wishlist.findById(req.params.wishlistId);
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.ownerId.equals(req.user._id) || 
                     wishlist.members.some(member => member.userId.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { name, description, imageUrl, price, currency, url, priority, status } = req.body;

    if (name) item.name = name;
    if (description !== undefined) item.description = description;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (price !== undefined) item.price = price;
    if (currency) item.currency = currency;
    if (url !== undefined) item.url = url;
    if (priority) item.priority = priority;
    if (status) item.status = status;

    item.editedBy = req.user._id;

    await item.save();
    await item.populate('addedBy', 'displayName email avatarUrl');
    await item.populate('editedBy', 'displayName email avatarUrl');
    await item.populate('claimedBy', 'displayName email avatarUrl');

    // Emit real-time event
    req.app.get('socketio').to(`wishlist_${req.params.wishlistId}`).emit('item_updated', {
      item: item.toJSON(),
      editedBy: req.user._id
    });

    res.json({
      message: 'Item updated successfully',
      item: item.toJSON()
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:wishlistId/items/:itemId
// @desc    Delete an item
// @access  Private
router.delete('/:wishlistId/items/:itemId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.wishlistId);
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.ownerId.equals(req.user._id) || 
                     wishlist.members.some(member => member.userId.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await item.deleteOne();

    // Emit real-time event
    req.app.get('socketio').to(`wishlist_${req.params.wishlistId}`).emit('item_deleted', {
      itemId: item._id,
      deletedBy: req.user._id
    });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/wishlists/:wishlistId/items/:itemId/claim
// @desc    Claim an item
// @access  Private
router.post('/:wishlistId/items/:itemId/claim', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.wishlistId);
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.ownerId.equals(req.user._id) || 
                     wishlist.members.some(member => member.userId.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.status === 'claimed') {
      return res.status(400).json({ error: 'Item is already claimed' });
    }

    item.status = 'claimed';
    item.claimedBy = req.user._id;
    item.editedBy = req.user._id;

    await item.save();
    await item.populate('addedBy', 'displayName email avatarUrl');
    await item.populate('editedBy', 'displayName email avatarUrl');
    await item.populate('claimedBy', 'displayName email avatarUrl');

    // Emit real-time event
    req.app.get('socketio').to(`wishlist_${req.params.wishlistId}`).emit('item_claimed', {
      item: item.toJSON(),
      claimedBy: req.user._id
    });

    res.json({
      message: 'Item claimed successfully',
      item: item.toJSON()
    });
  } catch (error) {
    console.error('Claim item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;