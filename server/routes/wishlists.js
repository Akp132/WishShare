const express = require('express');
const { body, validationResult } = require('express-validator');
const Wishlist = require('../models/Wishlist');
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlists
// @desc    Get all wishlists for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const wishlists = await Wishlist.find({
      $or: [
        { ownerId: req.user._id },
        { 'members.userId': req.user._id }
      ]
    })
    .populate('ownerId', 'displayName email avatarUrl')
    .populate('members.userId', 'displayName email avatarUrl')
    .sort({ updatedAt: -1 });

    // Get item counts for each wishlist
    const wishlistsWithCounts = await Promise.all(
      wishlists.map(async (wishlist) => {
        const itemCount = await Item.countDocuments({ wishlistId: wishlist._id });
        return {
          ...wishlist.toJSON(),
          itemCount
        };
      })
    );

    res.json(wishlistsWithCounts);
  } catch (error) {
    console.error('Get wishlists error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/wishlists
// @desc    Create a new wishlist
// @access  Private
router.post('/', [
  auth,
  body('name').trim().notEmpty().withMessage('Wishlist name is required'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isPublic, color } = req.body;

    const wishlist = new Wishlist({
      name,
      description,
      ownerId: req.user._id,
      members: [{
        userId: req.user._id,
        email: req.user.email,
        displayName: req.user.displayName,
        role: 'admin'
      }],
      isPublic: isPublic || false,
      color: color || '#3B82F6'
    });

    await wishlist.save();
    await wishlist.populate('ownerId', 'displayName email avatarUrl');

    // Emit real-time event
    req.app.get('socketio').emit('wishlist_created', {
      wishlist: wishlist.toJSON(),
      userId: req.user._id
    });

    res.status(201).json({
      message: 'Wishlist created successfully',
      wishlist: wishlist.toJSON()
    });
  } catch (error) {
    console.error('Create wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/wishlists/:id
// @desc    Get a specific wishlist
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id)
      .populate('ownerId', 'displayName email avatarUrl')
      .populate('members.userId', 'displayName email avatarUrl');

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.ownerId._id.equals(req.user._id) || 
                     wishlist.members.some(member => member.userId._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/wishlists/:id
// @desc    Update a wishlist
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().trim().notEmpty().withMessage('Wishlist name cannot be empty'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if user is owner or admin
    const isOwner = wishlist.ownerId.equals(req.user._id);
    const isAdmin = wishlist.members.some(member => 
      member.userId.equals(req.user._id) && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, isPublic, color } = req.body;

    if (name) wishlist.name = name;
    if (description !== undefined) wishlist.description = description;
    if (isPublic !== undefined) wishlist.isPublic = isPublic;
    if (color) wishlist.color = color;

    await wishlist.save();
    await wishlist.populate('ownerId', 'displayName email avatarUrl');

    // Emit real-time event
    req.app.get('socketio').to(`wishlist_${wishlist._id}`).emit('wishlist_updated', {
      wishlist: wishlist.toJSON(),
      updatedBy: req.user._id
    });

    res.json({
      message: 'Wishlist updated successfully',
      wishlist: wishlist.toJSON()
    });
  } catch (error) {
    console.error('Update wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:id
// @desc    Delete a wishlist
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Only owner can delete
    if (!wishlist.ownerId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only the owner can delete this wishlist' });
    }

    // Delete all items in the wishlist
    await Item.deleteMany({ wishlistId: wishlist._id });

    // Delete the wishlist
    await wishlist.deleteOne();

    // Emit real-time event
    req.app.get('socketio').emit('wishlist_deleted', {
      wishlistId: wishlist._id,
      deletedBy: req.user._id
    });

    res.json({ message: 'Wishlist deleted successfully' });
  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/wishlists/:id/invite
// @desc    Invite a user to a wishlist
// @access  Private
router.post('/:id/invite', [
  auth,
  body('email').isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if user is owner or admin
    const isOwner = wishlist.ownerId.equals(req.user._id);
    const isAdmin = wishlist.members.some(member => 
      member.userId.equals(req.user._id) && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Find user to invite
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const isAlreadyMember = wishlist.members.some(member => 
      member.userId.equals(userToInvite._id)
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add user to members
    wishlist.members.push({
      userId: userToInvite._id,
      email: userToInvite.email,
      displayName: userToInvite.displayName,
      role: 'member'
    });

    await wishlist.save();
    await wishlist.populate('members.userId', 'displayName email avatarUrl');

    // Emit real-time event
    req.app.get('socketio').to(`wishlist_${wishlist._id}`).emit('member_invited', {
      wishlist: wishlist.toJSON(),
      newMember: userToInvite.toJSON(),
      invitedBy: req.user._id
    });

    res.json({
      message: 'User invited successfully',
      wishlist: wishlist.toJSON()
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;