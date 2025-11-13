const db = require('../config/db');
const bcrypt = require('bcrypt');

// 获取用户列表
exports.getUsers = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                id, 
                username, 
                role, 
                status, 
                email, 
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at 
            FROM users 
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            data: rows,
            message: '获取用户列表成功'
        });
    } catch (err) {
        console.error('获取用户列表失败:', err);
        res.status(500).json({ 
            success: false,
            message: '获取用户列表失败', 
            error: err.message 
        });
    }
};

// 新建用户
exports.createUser = async (req, res) => {
    const { username, password, role, email } = req.body;
    
    // 输入验证
    if (!username || !password || !role || !email) {
        return res.status(400).json({ 
            success: false,
            message: '用户名、密码、角色和邮箱都是必填项' 
        });
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false,
            message: '邮箱格式不正确' 
        });
    }
    
    // 角色验证
    const allowedRoles = ['admin', 'reception', 'housekeeper'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ 
            success: false,
            message: '角色值无效' 
        });
    }
    
    try {
        // 检查用户名是否已存在
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: '用户名已存在' 
            });
        }
        
        // 检查邮箱是否已存在
        const [existingEmail] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingEmail.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: '邮箱已被使用' 
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username, password, role, email, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [username, hashedPassword, role, email, 'active']
        );
        
        res.status(201).json({ 
            success: true,
            message: '用户创建成功',
            data: {
                id: result.insertId,
                username,
                role,
                email,
                status: 'active'
            }
        });
    } catch (err) {
        console.error('用户创建失败:', err);
        res.status(500).json({ 
            success: false,
            message: '用户创建失败', 
            error: err.message 
        });
    }
};

// 更新用户
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role, status, email, password } = req.body;
    
    // 输入验证
    if (!role || !email) {
        return res.status(400).json({ 
            success: false,
            message: '角色和邮箱是必填项' 
        });
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false,
            message: '邮箱格式不正确' 
        });
    }
    
    // 角色验证
    const allowedRoles = ['admin', 'reception', 'housekeeper'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ 
            success: false,
            message: '角色值无效' 
        });
    }
    
    // 状态验证
    if (status && !['active', 'disabled'].includes(status)) {
        return res.status(400).json({ 
            success: false,
            message: '状态值无效' 
        });
    }
    
    try {
        // 检查用户是否存在
        const [userExists] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (userExists.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: '用户不存在' 
            });
        }
        
        // 检查邮箱是否被其他用户使用
        const [existingEmail] = await db.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, id]
        );
        
        if (existingEmail.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: '邮箱已被其他用户使用' 
            });
        }
        
        let query, params;
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = 'UPDATE users SET role = ?, status = ?, email = ?, password = ? WHERE id = ?';
            params = [role, status || 'active', email, hashedPassword, id];
        } else {
            query = 'UPDATE users SET role = ?, status = ?, email = ? WHERE id = ?';
            params = [role, status || 'active', email, id];
        }
        
        if (username) {
            // 检查用户名是否被其他用户使用
            const [existingUser] = await db.query(
                'SELECT id FROM users WHERE username = ? AND id != ?',
                [username, id]
            );
            
            if (existingUser.length > 0) {
                return res.status(400).json({ 
                    success: false,
                    message: '用户名已被其他用户使用' 
                });
            }
            
            if (password) {
                query = 'UPDATE users SET username = ?, role = ?, status = ?, email = ?, password = ? WHERE id = ?';
                params = [username, role, status || 'active', email, hashedPassword, id];
            } else {
                query = 'UPDATE users SET username = ?, role = ?, status = ?, email = ? WHERE id = ?';
                params = [username, role, status || 'active', email, id];
            }
        }
        
        await db.query(query, params);
        
        res.json({ 
            success: true,
            message: '用户更新成功' 
        });
    } catch (err) {
        console.error('用户更新失败:', err);
        res.status(500).json({ 
            success: false,
            message: '用户更新失败',
            error: err.message
        });
    }
};

// 删除用户
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    
    try {
        // 检查用户是否存在
        const [userExists] = await db.query('SELECT id, username FROM users WHERE id = ?', [id]);
        if (userExists.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: '用户不存在' 
            });
        }
        
        // 防止删除管理员账户（可选的安全措施）
        const [adminCheck] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
        if (adminCheck[0]?.role === 'admin') {
            // 检查是否是最后一个管理员
            const [adminCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
            if (adminCount[0].count <= 1) {
                return res.status(400).json({ 
                    success: false,
                    message: '不能删除最后一个管理员账户' 
                });
            }
        }
        
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        
        res.json({ 
            success: true,
            message: '用户删除成功' 
        });
    } catch (err) {
        console.error('用户删除失败:', err);
        res.status(500).json({ 
            success: false,
            message: '用户删除失败', 
            error: err.message 
        });
    }
};
