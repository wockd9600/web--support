
// const jwt = require('jsonwebtoken');
// const secretKey = require('../config/secretKey').secretKey;

// exports.verifyToken = (req, res, next) => {
//     try {
//         const token = req.cookies.x_auth;
//         req.decoded = jwt.verify(token, secretKey);
//         return next();
//     } catch (err) {

//         if (err.name === 'TokenExpriedError') {
//             return res.status(419).json({
//                 code: 419,
//                 message: '토큰이 만료되었습니다',
//             });
//         } else { }
//         res.status(404);
//         next(err);
//     }
// }

exports.logind = (req, res, next) => {
    const sessionId = req.cookies.logined;

    console.log(sessionId)
    console.log(req.session[sessionId])
    
    if (req.session[sessionId]) {
        next();
    }
    else {
        res.write("<script>alert('please login.')</script>");
        res.write("<script>location.href=\"/admin\"</script>");
        return res.end();
    }
}