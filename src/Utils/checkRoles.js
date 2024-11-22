
import jwt from 'jsonwebtoken';

export const checkAuthorizedRole = ( jwToken, roles/* type: LIST */ ) => {
    const decoded = jwt.verify(jwToken, process.env.JWT_SECRET);
    if (roles.includes(decoded.role)) {
        return true
    }
    return false
}