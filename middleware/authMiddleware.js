import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => { 
  const authHeader = req.headers.authorization; 
  if (!authHeader) return res.status(401).json({ error: 'No token provided' }); 
  try { 
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader; 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log('[AUTH] decoded token:', decoded); // ✅ debug log 
    req.user = { userId: decoded.userId, role: decoded.role }; 
    next(); 
  } catch (err) { 
    console.error('[AUTH] token verification error:', err); 
    res.status(401).json({ error: 'Invalid token' }); 
  } 
};
