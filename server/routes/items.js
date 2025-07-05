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
      .populate('comments.user', 'displayName email avatarUrl')
      .populate('reactions.user', 'displayName email avatarUrl')
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

// @route   POST /api/wishlists/:wishlistId/items/:itemId/comments
// @desc    Add a comment to an item
// @access  Private
router.post('/:wishlistId/items/:itemId/comments', [
  auth,
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 }).withMessage('Comment must be 500 characters or less')
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

    const { text } = req.body;

    const newComment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    item.comments.push(newComment);
    await item.save();
    
    // Populate the new comment
    await item.populate('comments.user', 'displayName email avatarUrl');
    
    // Get the newly added comment with populated user
    const addedComment = item.comments[item.comments.length - 1];

    // Emit real-time event
    console.log('📡 Emitting comment_added event for wishlist:', req.params.wishlistId);
    req.app.get('socketio').to(`wishlist_${req.params.wishlistId}`).emit('comment_added', {
      itemId: item._id,
      comment: addedComment,
      addedBy: req.user._id
    });
    console.log('✅ Comment event emitted successfully');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: addedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:wishlistId/items/:itemId/comments/:commentId
// @desc    Delete a comment from an item
// @access  Private
router.delete('/:wishlistId/items/:itemId/comments/:commentId', auth, async (req, res) => {
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

    const comment = item.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment or is the wishlist owner
    if (!comment.user.equals(req.user._id) && !wishlist.ownerId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    item.comments.pull(req.params.commentId);
    await item.save();

    // Emit real-time event
    req.app.get('socketio').to(`wishlist_${req.params.wishlistId}`).emit('comment_deleted', {
      itemId: item._id,
      commentId: req.params.commentId,
      deletedBy: req.user._id
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/wishlists/:wishlistId/items/:itemId/reactions
// @desc    Add or update a reaction to an item
// @access  Private
router.post('/:wishlistId/items/:itemId/reactions', [
  auth,
  body('emoji').isIn(['👍', '❤️', '😍', '🔥', '👏', '😂', '😮', '😢', '🎉', '💯']).withMessage('Invalid emoji')
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

    const { emoji } = req.body;

    // Check if user already has a reaction
    const existingReactionIndex = item.reactions.findIndex(reaction => 
      reaction.user.equals(req.user._id)
    );

    if (existingReactionIndex !== -1) {
      // Update existing reaction
      item.reactions[existingReactionIndex].emoji = emoji;
      item.reactions[existingReactionIndex].createdAt = new Date();
    } else {
      // Add new reaction
      item.reactions.push({
        user: req.user._id,
        emoji,
        createdAt: new Date()
      });
    }

    await item.save();
    await item.populate('reactions.user', 'displayName email avatarUrl');

    // Get the user's reaction
    const userReaction = item.reactions.find(reaction => 
      reaction.user._id.equals(req.user._id)
    );

    // Emit real-time event
    console.log('😍 Emitting reaction_updated event for wishlist:', req.params.wishlistId);
    req.app.get('socketio').to(`wishlist_${req.params.wishlistId}`).emit('reaction_updated', {
      itemId: item._id,
      reaction: userReaction,
      addedBy: req.user._id
    });
    console.log('✅ Reaction event emitted successfully');

    res.json({
      message: 'Reaction updated successfully',
      reaction: userReaction
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:wishlistId/items/:itemId/reactions
// @desc    Remove user's reaction from an item
// @access  Private
router.delete('/:wishlistId/items/:itemId/reactions', auth, async (req, res) => {
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

    // Remove user's reaction
    item.reactions = item.reactions.filter(reaction => 
      !reaction.user.equals(req.user._id)
    );

    await item.save();

    // Emit real-time event
    req.app.get('socketio').to(`wishlist_${req.params.wishlistId}`).emit('reaction_removed', {
      itemId: item._id,
      removedBy: req.user._id
    });

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;