const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isChatUser } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.use(isChatUser);

// Chat allowed for: admin, principal, teacher, student, bd_agent. NOT super_admin.

const getChatVisibilityFilter = (user) => {
  const { id: myId, role, campus_id: campusId, client_id: clientId, student_id: studentId } = user;
  
  const baseCond = `u.client_id = ? AND u.id != ? AND u.role != 'super_admin'`;
  const baseParams = [clientId, myId];

  if (role === 'student') {
    // Students see HOD/Admin of their campus + Teachers of their enrolled courses/classes/sections. NO other students.
    return {
      condition: `
        ${baseCond} AND (
          (u.role IN ('admin', 'principal') AND u.campus_id = ?)
          OR
          (u.role = 'teacher' AND u.id IN (
            SELECT emp.user_id FROM courses c 
            JOIN enrollments e ON c.id = e.course_id 
            JOIN employees emp ON c.teacher_id = emp.id
            WHERE e.student_id = ? AND e.status = 'approved'
            UNION
            SELECT emp.user_id FROM classes cl 
            JOIN student_classes sc ON cl.id = sc.class_id 
            JOIN employees emp ON cl.teacher_id = emp.id
            WHERE sc.student_id = ? AND sc.status = 'approved'
            UNION
            SELECT emp.user_id FROM course_sections cs 
            JOIN enrollments e ON cs.course_id = e.course_id AND cs.semester_id = e.semester
            JOIN employees emp ON cs.teacher_id = emp.id
            WHERE e.student_id = ? AND e.status = 'approved'
          ))
        )
      `,
      params: [...baseParams, campusId, studentId, studentId, studentId]
    };
  } else if (role === 'teacher') {
    // Teachers see HOD/Admin of their campus + Students in their campus.
    return {
      condition: `
        ${baseCond} AND (
          (u.role IN ('admin', 'principal') AND u.campus_id = ?)
          OR
          (u.role = 'student' AND u.campus_id = ?)
        )
      `,
      params: [...baseParams, campusId, campusId]
    };
  } else if (['rector', 'hr_manager', 'finance_manager', 'registrar', 'admission_officer', 'library_manager', 'master_admin'].includes(role)) {
    // Masters see EVERYONE across ALL campuses in their university (except super_admin)
    return {
      condition: baseCond,
      params: baseParams
    };
  } else {
    // Admins/Principals/BD see everyone in their campus (except super_admin)
    return {
      condition: `${baseCond} AND u.campus_id = ?`,
      params: [...baseParams, campusId]
    };
  }
};

// List users that current user can chat with
router.get('/users', async (req, res) => {
  try {
    const filter = getChatVisibilityFilter(req.user);
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.campus_id, u.created_at
      FROM users u
      WHERE ${filter.condition}
      ORDER BY u.name ASC
    `;

    const [users] = await pool.query(query, filter.params);
    res.json({ success: true, users });
  } catch (err) {
    console.error('Chat users error:', err);
    res.status(500).json({ success: false, message: 'Failed to load chat users' });
  }
});

// Conversations list with last message + unread count, filtered by department
router.get('/conversations', async (req, res) => {
  try {
    const myId = req.user.id;
    const filter = getChatVisibilityFilter(req.user);

    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.campus_id,
        lm.message AS last_message,
        lm.created_at AS last_message_at,
        (
          SELECT COUNT(*) 
          FROM chat_messages um 
          WHERE um.sender_id = u.id 
            AND um.receiver_id = ? 
            AND um.read_at IS NULL
        ) AS unread_count
      FROM users u
      LEFT JOIN chat_messages lm 
        ON (
          (lm.sender_id = u.id AND lm.receiver_id = ?) OR
          (lm.sender_id = ? AND lm.receiver_id = u.id)
        )
        AND lm.created_at = (
          SELECT MAX(created_at)
          FROM chat_messages
          WHERE 
            (sender_id = u.id AND receiver_id = ?) OR
            (sender_id = ? AND receiver_id = u.id)
        )
      WHERE ${filter.condition}
      ORDER BY 
        COALESCE(lm.created_at, '1970-01-01') DESC,
        u.name ASC
    `;
    const params = [myId, myId, myId, myId, myId, ...filter.params];

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      conversations: rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        campus_id: row.campus_id,
        last_message: row.last_message || '',
        last_message_at: row.last_message_at,
        unread_count: Number(row.unread_count || 0)
      }))
    });
  } catch (err) {
    console.error('Chat conversations error:', err);
    res.status(500).json({ success: false, message: 'Failed to load conversations' });
  }
});

// Get messages between current user and otherUserId
router.get('/messages/:otherUserId', async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = parseInt(req.params.otherUserId, 10);
    if (!otherId) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const [rows] = await pool.query(
      `SELECT id, sender_id, receiver_id, message, created_at, read_at, is_edited, is_deleted
       FROM chat_messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [myId, otherId, otherId, myId]
    );
    res.json({ success: true, messages: rows });
  } catch (err) {
    console.error('Chat messages error:', err);
    res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
});

// Mark messages as read when opening a conversation
router.post('/read/:otherUserId', async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = parseInt(req.params.otherUserId, 10);
    if (!otherId) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    await pool.query(
      `UPDATE chat_messages 
       SET read_at = NOW() 
       WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL`,
      [otherId, myId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Chat mark read error:', err);
    res.status(500).json({ success: false, message: 'Failed to mark messages as read' });
  }
});

// Send message (store in DB and emit via socket in server.js using app.get('io'))
router.post('/messages', async (req, res) => {
  try {
    const myId = req.user.id;
    const { receiver_id, message } = req.body;
    if (!receiver_id || !message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'receiver_id and message required' });
    }
    const receiverId = parseInt(receiver_id, 10);
    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Invalid receiver id' });
    }
    // Ensure receiver is not super_admin and belongs to the same department
    const [[receiver]] = await pool.query(
      'SELECT id, role, campus_id FROM users WHERE id = ?',
      [receiverId]
    );
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (receiver.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Cannot send message to this user' });
    }

    // Final validation: Ensure receiver is visible to sender based on new rules
    const filter = getChatVisibilityFilter(req.user);
    const [visibilityCheck] = await pool.query(
      `SELECT id FROM users u WHERE u.id = ? AND (${filter.condition})`,
      [receiverId, ...filter.params]
    );

    if (visibilityCheck.length === 0) {
      return res.status(403).json({ success: false, message: 'Message delivery restricted: Recipient not in your permitted contact list.' });
    }

    const [result] = await pool.query(
      'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [myId, receiverId, message.trim()]
    );
    const insertId = result.insertId;
    const [[row]] = await pool.query(
      'SELECT id, sender_id, receiver_id, message, created_at, read_at FROM chat_messages WHERE id = ?',
      [insertId]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${receiverId}`).emit('chat:message', {
        id: row.id,
        sender_id: row.sender_id,
        receiver_id: row.receiver_id,
        message: row.message,
        created_at: row.created_at,
        read_at: row.read_at
      });
    }

    res.status(201).json({ success: true, message: row });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Edit a sent message
router.put('/messages/:id', async (req, res) => {
  try {
    const myId = req.user.id;
    const msgId = parseInt(req.params.id, 10);
    const { message } = req.body;
    if (!msgId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const [[msg]] = await pool.query('SELECT * FROM chat_messages WHERE id = ?', [msgId]);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    if (msg.sender_id !== myId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    if (msg.is_deleted) return res.status(400).json({ success: false, message: 'Cannot edit deleted message' });

    await pool.query(
      'UPDATE chat_messages SET message = ?, is_edited = 1 WHERE id = ?',
      [message.trim(), msgId]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${msg.receiver_id}`).emit('chat:message_updated', {
        id: msg.id,
        message: message.trim(),
        is_edited: 1
      });
    }
    
    res.json({ success: true, message: 'Message updated' });
  } catch (err) {
    console.error('Edit message error:', err);
    res.status(500).json({ success: false, message: 'Failed to edit message' });
  }
});

// Delete a sent message (soft delete)
router.delete('/messages/:id', async (req, res) => {
  try {
    const myId = req.user.id;
    const msgId = parseInt(req.params.id, 10);
    if (!msgId) return res.status(400).json({ success: false, message: 'Invalid payload' });

    const [[msg]] = await pool.query('SELECT * FROM chat_messages WHERE id = ?', [msgId]);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    if (msg.sender_id !== myId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    await pool.query(
      'UPDATE chat_messages SET message = ?, is_deleted = 1 WHERE id = ?',
      ["This message was deleted", msgId]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${msg.receiver_id}`).emit('chat:message_deleted', {
        id: msg.id,
        message: "This message was deleted",
        is_deleted: 1
      });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

module.exports = router;
