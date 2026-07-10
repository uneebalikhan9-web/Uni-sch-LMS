const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isRegistrar } = require('../middleware/auth');

const router = express.Router();

// Get all rooms for campus
router.get('/', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [rooms] = await pool.query(
      'SELECT * FROM rooms WHERE campus_id = ? ORDER BY building, room_number',
      [campus_id]
    );
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching rooms' });
  }
});

// Create new room
router.post('/', verifyToken, isRegistrar, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const {
      building,
      room_number,
      room_type,
      capacity,
      is_air_conditioned,
      has_projector,
      has_smart_board,
      is_available,
      notes
    } = req.body;

    if (!room_number || !building) {
      return res.status(400).json({ success: false, message: 'Building and Room Number are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO rooms (
        campus_id, building, room_number, room_type, capacity,
        is_air_conditioned, has_projector, has_smart_board, is_available, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campus_id, building, room_number, room_type || 'lecture', capacity || 30,
        is_air_conditioned ? 1 : 0, has_projector ? 1 : 0, has_smart_board ? 1 : 0,
        is_available !== undefined ? (is_available ? 1 : 0) : 1, notes || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Room created successfully!',
      roomId: result.insertId
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Server error while creating room' });
  }
});

// Update room
router.put('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const campus_id = req.user.campus_id;
    const {
      building,
      room_number,
      room_type,
      capacity,
      is_air_conditioned,
      has_projector,
      has_smart_board,
      is_available,
      notes
    } = req.body;

    // Verify campus ownership
    const [existing] = await pool.query('SELECT id FROM rooms WHERE id = ? AND campus_id = ?', [id, campus_id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found on this campus' });
    }

    await pool.query(
      `UPDATE rooms SET 
        building = ?, room_number = ?, room_type = ?, capacity = ?,
        is_air_conditioned = ?, has_projector = ?, has_smart_board = ?, is_available = ?, notes = ?
      WHERE id = ?`,
      [
        building, room_number, room_type, capacity,
        is_air_conditioned ? 1 : 0, has_projector ? 1 : 0, has_smart_board ? 1 : 0,
        is_available ? 1 : 0, notes || null, id
      ]
    );

    res.json({ success: true, message: 'Room updated successfully!' });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ success: false, message: 'Server error while updating room' });
  }
});

// Delete room
router.delete('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const campus_id = req.user.campus_id;

    // Verify campus ownership
    const [existing] = await pool.query('SELECT id FROM rooms WHERE id = ? AND campus_id = ?', [id, campus_id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found on this campus' });
    }

    await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ success: true, message: 'Room deleted successfully!' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting room' });
  }
});

module.exports = router;
