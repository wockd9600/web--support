const createError = require('http-errors');

const express = require('express');
const session = require('express-session');
// const FileStore = require('session-file-store')(session);
const MySQLStore = require("express-mysql-session")(session);

const expressLayouts = require('express-ejs-layouts');

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const moment = require('moment');
const cors = require('cors');


// const { verifyToken } = require('./middlewares/auth');
const { logind } = require('./middlewares/auth');

const adminRouter = require('./routes/admin');
const indexRouter = require('./routes/index');

const app = express();

app.use(
    session({
        key: "session_cookie_name",
        secret: "session_cookie_secret",
        resave: false,
        saveUninitialized: true,
        store: new MySQLStore({
            host: "211.47.75.102",
            // port: 3306,
            user: "sim0901",
            password: "qw12qw12!!",
            database: "dbsim0901",
        }),
    })
);

// app.use(session({
//     httpOnly: true,	//자바스크립트를 통해 세션 쿠키를 사용할 수 없도록 함
//     secure: true,	//https 환경에서만 session 정보를 주고받도록처리
//     secret: 'yurimtest',	//암호화하는 데 쓰일 키
//     resave: true,	//세션을 언제나 저장할지 설정함
//     saveUninitialized: true,	//세션이 저장되기 전 uninitialized 상태로 미리 만들어 저장
//     cookie: {	//세션 쿠키 설정 (세션 관리 시 클라이언트에 보내는 쿠키)
//       httpOnly: true,
//       Secure: true
//     }
// }));

// app.use(session({  // 2
//     secret: 'yurimtest',  // 암호화
//     resave: false,
//     saveUninitialized: true,
//     store: new FileStore({path: './session'})
// }));


// view engine setup
app.set('layout', 'layouts/layout');
app.set("layout extractScripts", true);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
// app.engine('html', require('ejs').renderFile);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/@ckeditor/ckeditor5-build-classic/build/')));

// app.use(function(req, res, next) {
//     console.log("Access-Control-Allow-Origin");
//     res.set({'access-control-allow-origin': 'http://ggdpsywithu.or.kr'});
//     res.header("Access-Control-Allow-Headers", "http://ggdpsywithu.or.kr");
//     //res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
//     //res.header("Access-Control-Allow-Credentials", true);
//     next();
// });

// app.use(cors());

// app.use(function (req, res, next) {
//     let data = {name: 'kukaro'};
//     console.log('**********************');
//     console.log(req.headers);
//     console.log('**********************');
//     console.log(req.rawHeaders);
//     console.log('**********************');
//     console.log(res.getHeaders());
//     next();
// });

app.use('/', indexRouter);
app.use('/admin', adminRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', { layout: 'layouts/blank' });
});

module.exports = app;
