var express = require('express');

const bcrypt = require('bcrypt');
const moment = require('moment');

// const jwt = require('jsonwebtoken');
// const secretKey = require('../config/secretKey').secretKey;
// const options = require('../config/secretKey').options;

const pool = require('../models/index');


var router = express.Router();

const title = '경기도심리지원센터';


/* GET users listing. */

router.get('/', function (req, res, next) {
    res.render('main', { layout: 'layouts/front', title, main: true });
});

router.get('/center/introduce', function (req, res, next) {
    res.render('introduce', { layout: 'layouts/front', title, fpath: 'center', spath: 'introduce' });
});

router.get('/center/history', function (req, res, next) {
    res.render('sub_01_02_history', { layout: 'layouts/front', title, fpath: 'center', spath: 'history' });
});

router.get('/center/about', function (req, res, next) {
    res.render('sub_01_03_about', { layout: 'layouts/front', title, fpath: 'center', spath: 'about' });
});

router.get('/center/ochart', function (req, res, next) {
    res.render('sub_01_04_ochart', { layout: 'layouts/front', title, fpath: 'center', spath: 'ochart' });
});

router.get('/center/center', function (req, res, next) {
    res.render('sub_01_05_center', { layout: 'layouts/front', title, fpath: 'center', spath: 'subCenter' });
});

router.get('/center/map', function (req, res, next) {
    res.render('sub_01_06_map', { layout: 'layouts/front', title, fpath: 'center', spath: 'map' });
});

router.get('/counsel/introduce', function (req, res, next) {
    res.render('sub_02_01_introduce', { layout: 'layouts/front', title, fpath: 'counsel', spath: 'introduce' });
});

router.get('/counsel/guide', function (req, res, next) {
    res.render('sub_02_02_guide', { layout: 'layouts/front', title, fpath: 'counsel', spath: 'guide' });
});

router.get('/counsel/mind', function (req, res, next) {
    res.render('sub_02_03_mind', { layout: 'layouts/front', title, fpath: 'counsel', spath: 'mind' });
});

router.get('/counsel/mind/result', function (req, res, next) {
    res.render('sub_02_03_mind_result', { layout: 'layouts/front', title, fpath: 'counsel', spath: 'mind' });
});

router.get('/education/introduce', function (req, res, next) {
    res.render('sub_03_01_introduce', { layout: 'layouts/front', title, fpath: 'education', spath: 'introduce' });
});

router.get('/education/guide', function (req, res, next) {
    res.render('sub_03_02_guide', { layout: 'layouts/front', title, fpath: 'education', spath: 'guide' });
});

router.get('/support/introduce', function (req, res, next) {
    res.render('sub_04_01_introduce', { layout: 'layouts/front', title, fpath: 'support', spath: 'introduce' });
});

router.get('/support/guide', function (req, res, next) {
    res.render('sub_04_02_guide', { layout: 'layouts/front', title, fpath: 'support', spath: 'guide' });
});

router.get('/online/calendar', function (req, res, next) {
    res.render('sub_05_01_calendar', { layout: 'layouts/front', title, fpath: 'online', spath: 'calendar' });
});

router.get('/online/counsel', function (req, res, next) {
    res.render('sub_05_02_counsel', { layout: 'layouts/front', title, fpath: 'online', spath: 'counsel' });
});

router.get('/online/program',  async function (req, res, next) {
    const { id } = req.query

    const connection = await pool.getConnection(async conn => conn);

    try {
        // db를 통해 관리자 계정 체크
        if (typeof(id) !== 'undefined') {
            const sql = `SELECT * FROM programs WHERE id=${id}`
    
            const [result, fields] = await connection.query(sql);

            // console.log(result)
            if (!result.err) {
                res.render('sub_05_03_program', { layout: 'layouts/front', title, fpath: 'online', spath: 'program', result: result[0] });
            } else {
                throw new Error('not work db');
            }
        } else {
            res.render('sub_05_03_program', { layout: 'layouts/front', title, fpath: 'online', spath: 'program'});
        }
        
    } catch (err) {
        console.error(err);
        return next(err);
    } finally {
        connection.release();
    }
});

router.get('/collabo/mou', function (req, res, next) {
    res.render('sub_06_01_mou', { layout: 'layouts/front', title, fpath: 'collabo', spath: 'mou' });
});

router.get('/collabo/network', function (req, res, next) {
    res.render('sub_06_02_network', { layout: 'layouts/front', title, fpath: 'collabo', spath: 'network' });
});

// router.get('/research', function (req, res, next) {
//     res.render('sub_07_01_research', { layout: 'layouts/front', title, fpath: 'research', spath: 'research', page:1 });
// });

router.get('/research', async function (req, res, next) {
    let page;

    let {
        search,
        category,
    } = req.query

    if (typeof(category) == 'undefined' || !category || category == 'null') {
        category = 'title';
    } else {}

    if (typeof(search) == 'undefined' || !search || search == 'null') {
        search = '';
    } else {}

    const connection = await pool.getConnection(async conn => conn);

    try {
        let start = 0;
        const pageSize = 10;

        if (typeof(req.query.page) == 'undefined' || req.query.page <= 0) {
            page = 1;
        } else {
            page = req.query.page;
            start = (page - 1) * pageSize;
        }

        // 전체 개수
        const countSql = `SELECT count(*) AS total FROM boards WHERE category='research'`;

        console.log(countSql);
        const [countResult, countFields] = await connection.query(countSql);
        
        const max_page = Math.ceil(countResult[0].total / pageSize);
        if (page > max_page && max_page != 0) {
            throw new Error('over page');
        }

        // const artist_list = await user.pageAll(start, pageSize);
        

        // db를 통해 관리자 계정 체크
        const sql = `SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, b.*, DATE_FORMAT(reg_date, \'%Y-%m-%d\') AS reg_date FROM ( SELECT @ROWNUM := ${start} , boards.* FROM boards WHERE category='research' AND ${category} LIKE '%${search}%' ORDER BY id DESC) AS b LIMIT ${start}, ${pageSize}`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        // console.log(result)

        if (!result.err) {
            res.render('sub_07_01_research', { layout: 'layouts/front', title, fpath: 'research', spath: 'research', result, page, max_page, total: countResult[0].total });
        } else {
            throw new Error('not work db');
        }
    
    } catch (err) {
        console.error(err);
        next(err);
    } finally {
        connection.release();
    }
});

router.get('/research/detail', async function (req, res, next) {
    const { board } = req.params
    const { id } = req.query

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        const sql =`UPDATE boards SET `
                    +                   ` hit=hit + 1`
                    +           ` WHERE id=${id}`;
        console.log(sql);
        const [result, fields] = await connection.query(sql);

        const fileSql = `SELECT * FROM files WHERE board_id=${id}`
        console.log(fileSql);
        const [fileResult, fileFields] = await connection.query(fileSql);

        Object.values(fileResult).forEach(data => {
            data.file_size = bytesToSize(data.file_size);
        });

        console.log(fileResult)

        res.render('sub_08_05_board_detail', { layout: 'layouts/front', title, fpath: 'research', spath: 'research', fileResult, filelen: fileResult.length });

    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.get('/term', function (req, res, next) {
    res.render('sub_09_01_term', { layout: 'layouts/blank', title: title + '이용약관', });
});

// router.get('/commu/notice', function (req, res, next) {
//     res.render('sub_08_01_notice', { layout: 'layouts/front', title, fpath: 'commu', spath: 'notice', page:1 });
// });

// router.get('/commu/news', function (req, res, next) {
//     res.render('sub_08_02_news', { layout: 'layouts/front', title, fpath: 'commu', spath: 'news', page:1 });
// });

// router.get('/commu/reference', function (req, res, next) {
//     res.render('sub_08_03_reference', { layout: 'layouts/front', title, fpath: 'commu', spath: 'reference', page:1 });
// });

// router.get('/commu/review', function (req, res, next) {
//     res.render('sub_08_05_review', { layout: 'layouts/front', title, fpath: 'commu', spath: 'review', page:1 });
// });

router.get('/commu/:board', async function (req, res, next) {
    const { board } = req.params;

    let {
        search,
        category,
    } = req.query

    let page;

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return next();
    } else {}

    console.log(req.query)

    if (typeof(category) == 'undefined' || !category || category == 'null') {
        category = 'title';
    } else {}

    if (typeof(search) == 'undefined' || !search || search == 'null') {
        search = '';
    } else {}

    const connection = await pool.getConnection(async conn => conn);

    try {
        let start = 0;
        const pageSize = 10;

        if (typeof(req.query.page) == 'undefined' || req.query.page <= 0) {
            page = 1;
        } else {
            page = req.query.page;
            start = (page - 1) * pageSize;
        }

        // 전체 개수
        const countSql = `SELECT count(*) AS total FROM boards WHERE category='${board}'`;

        console.log(countSql);
        const [countResult, countFields] = await connection.query(countSql);

        const max_page = Math.ceil(countResult[0].total / pageSize);
        if (page > max_page && max_page != 0) {
            throw new Error('over page');
        }

        // const artist_list = await user.pageAll(start, pageSize);
        

        // db를 통해 관리자 계정 체크
        const sql = `SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, b.*, DATE_FORMAT(reg_date, \'%Y-%m-%d\') AS reg_date`
                    + ` FROM ( SELECT @ROWNUM := ${start} , boards.* FROM boards WHERE category='${board}' AND ${category} LIKE '%${search}%' ORDER BY id DESC) AS b`
                    + ` LIMIT ${start}, ${pageSize}`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        // console.log(result)

        let num = '';
        if (board == 'notice') {
            num = '01'
        } else if (board == 'news') {
            num = '02'
        } else if (board == 'reference') {
            num = '03'
        } else if (board == 'review') {
            num = '05'
        }

        if (!result.err) {
            res.render(`sub_08_${num}_${board}`, { layout: 'layouts/front', title, fpath: 'commu', spath: `${board}`, result, page:page, max_page, total: countResult[0].total })
        } else {
            throw new Error('not work db');
        }
    
    } catch (err) {
        console.error(err);
        return res.json( {result : 'board-error', data : err})
    } finally {
        connection.release();
    }
});

function bytesToSize(bytes) { // 1
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 }


router.get('/commu/:board/detail', async function (req, res, next) {
    const { board } = req.params
    const { id } = req.query

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return next();
    } else {}

    const connection = await pool.getConnection(async conn => conn);

    try {

        
        const sql =`UPDATE boards SET `
                    +                   ` hit=hit + 1`
                    +           ` WHERE id=${id}`;
        console.log(sql);
        const [result, fields] = await connection.query(sql);

        
        const fileSql = `SELECT * FROM files WHERE board_id=${id}`
        console.log(fileSql);
        const [fileResult, fileFields] = await connection.query(fileSql);

        Object.values(fileResult).forEach(data => {
            data.file_size = bytesToSize(data.file_size);
        });

        console.log(fileResult)

        res.render('sub_08_05_board_detail', { layout: 'layouts/front', title, fpath: 'commu', spath: `${board}`, fileResult, filelen: fileResult.length });


    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.get('/commu/:board/detail/data', async function (req, res, next) {
    const { id } = req.query
    const { board } = req.params
    // console.log(id)

    const connection = await pool.getConnection(async conn => conn);

    try {
        // db를 통해 관리자 계정 체크
        const sql = `SELECT *, DATE_FORMAT(reg_date, '%Y-%m-%d') AS reg_date FROM boards WHERE id=${id}`

        const [result, fields] = await connection.query(sql);

        // console.log(result)
        if (!result.err) {
            return res.json( {result : `${board}`, data : result[0]})
        } else {
            return res.json( {result : `${board}-error`, data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'faq-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/commu/review/write', function (req, res, next) {
    res.render('sub_08_05_review_write', { layout: 'layouts/front', title, fpath: 'commu', spath: 'review' });
});



router.get('/commu/gallery', async function (req, res, next) {
    let page;

    const connection = await pool.getConnection(async conn => conn);

    try {
        let start = 0;
        const pageSize = 4;

        if (typeof(req.query.page) == 'undefined' || req.query.page <= 0) {
            page = 1;
        } else {
            page = req.query.page;
            start = (page - 1) * pageSize;
        }

        // 전체 개수
        const countSql = `SELECT count(*) AS total FROM gallery WHERE category='gallery'`;

        console.log(countSql);
        const [countResult, countFields] = await connection.query(countSql);

        const max_page = Math.ceil(countResult[0].total / pageSize);
        if (page > max_page && max_page != 0) {
            throw new Error('over page');
        }

        // const artist_list = await user.pageAll(start, pageSize);
        
        // db를 통해 관리자 계정 체크
        const sql = `SELECT *, DATE_FORMAT(reg_date, \'%Y-%m-%d\') AS reg_date`
                    + ` FROM (SELECT * FROM gallery WHERE category='gallery' ORDER BY reg_date DESC) AS b`
                    + ` JOIN (SELECT MIN(id) AS img_id, img_url, img_type, gallery_id FROM images GROUP BY gallery_id) AS i ON b.id=i.gallery_id `
                    + ` ORDER BY b.id DESC`
                    + ` LIMIT ${start}, ${pageSize}`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);


        if (!result.err) {
            res.render(`sub_08_04_gallery`, { layout: 'layouts/front', title, fpath: 'commu', spath: 'gallery', result, page:page, max_page })
        } else {
            throw new Error('not work db');
        }
    
    } catch (err) {
        console.error(err);
        return res.json( {result : 'board-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/commu/gallery/detail', async function (req, res, next) {
    const { id } = req.query

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        const sql = `SELECT * FROM gallery WHERE id=${id}`;
        const [result, f] = await connection.query(sql);

        const imgSql = `SELECT * FROM images WHERE gallery_id=${id}`;
        const [imgResult, ff] = await connection.query(imgSql);


        res.render('sub_08_04_gallery_detail', { layout: 'layouts/front', title, fpath: 'commu', spath: `gallery`, result: result[0], imgResult });


    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }

});


router.get('/commu/advertGallery', async function (req, res, next) {
    let page;

    const connection = await pool.getConnection(async conn => conn);

    try {
        let start = 0;
        const pageSize = 4;

        if (typeof(req.query.page) == 'undefined' || req.query.page <= 0) {
            page = 1;
        } else {
            page = req.query.page;
            start = (page - 1) * pageSize;
        }

        // 전체 개수
        const countSql = `SELECT count(*) AS total FROM gallery WHERE category='advert'`;

        console.log(countSql);
        const [countResult, countFields] = await connection.query(countSql);

        const max_page = Math.ceil(countResult[0].total / pageSize);
        if (page > max_page && max_page != 0) {
            throw new Error('over page');
        }

        // const artist_list = await user.pageAll(start, pageSize);
        

        
        // db를 통해 관리자 계정 체크
        const sql = `SELECT *, DATE_FORMAT(reg_date, \'%Y-%m-%d\') AS reg_date`
                    + ` FROM (SELECT * FROM gallery WHERE category='advert' ORDER BY reg_date DESC) AS b`
                    + ` JOIN (SELECT MIN(id) AS img_id, img_url, img_type, gallery_id FROM images GROUP BY gallery_id) AS i ON b.id=i.gallery_id `
                    + ` ORDER BY b.id DESC`
                    + ` LIMIT ${start}, ${pageSize}`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);


        if (!result.err) {
            res.render(`sub_08_04_advert_gallery`, { layout: 'layouts/front', title, fpath: 'commu', spath: 'advertGallery', result, page:page, max_page })
        } else {
            throw new Error('not work db');
        }
    
    } catch (err) {
        console.error(err);
        return res.json( {result : 'board-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/commu/advertGallery/detail', async function (req, res, next) {
    const { id } = req.query

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        const sql = `SELECT * FROM gallery WHERE id=${id}`;
        const [result, f] = await connection.query(sql);

        const imgSql = `SELECT * FROM images WHERE gallery_id=${id}`;
        const [imgResult, ff] = await connection.query(imgSql);


        res.render('sub_08_04_advert_gallery_detail', { layout: 'layouts/front', title, fpath: 'commu', spath: `advertGallery`, result: result[0], imgResult });


    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }

});



router.get('/commu/faq', function (req, res, next) {
    res.render('sub_08_06_faq', { layout: 'layouts/front', title, fpath: 'commu', spath: 'faq' });
});


router.get('/admin', function (req, res, next) {
    const sessionId = req.cookies.logined;
    
    if (req.session[sessionId]) {
        res.render('admin/main', { title,navbar: true,fpaths: { title: '' }, });
    }
    else {
        res.render('admin/sign-in', { layout: 'layouts/blank'});
    }
});

/* POST users listing. */

router.post('/admin/loginAction', async function (req, res, next) {
    const {
        userId,
        userPwd,
    } = req.body;

    const connection = await pool.getConnection(async conn => conn);

    try {
        // db를 통해 관리자 계정 체크
        const sql = `SELECT * FROM users WHERE id = '${userId}'`;
        const [result, fields] = await connection.query(sql);


        if (result.length !== 0) {
            let dbPW = result[0].pwd;
            let salt = result[0].salt;

            let isLoginalbe = await bcrypt.compare(userPwd + salt, dbPW);

            if (isLoginalbe) {
                // // 토큰 발급
                // const token = jwt.sign({
                //     id: userId
                // }, secretKey, options);

                // return res
                //     .cookie("x_auth", token, {
                //         maxAge: 1000 * 60 * 60 * 24 * 7, // 7일간 유지
                //         httpOnly: true,
                //     })
                //     .status(200)
                //     .json(1);

                // 시간되면 userId 암호화
                res.cookie('logined', userId);
                req.session[userId] = true


                res.json({data: true});
            }
            // 비밀번호 틀림
            else {
                return res.json(0);
            }
            // 없는 아이디
        } else {
            return res.json(0)
        }
    } catch (err) {
        console.error(err);
        return res.json(0);
    } finally {
        // connection.release();
    }
});

router.get('/commu/review/update', async function (req, res, next) {
    const { id } = req.query

    const sessionId = req.cookies.cookieValue;
    
    if (req.session[sessionId]) {
        return next('err!!!!');
    } else {}

    const connection = await pool.getConnection(async conn => conn);
    
    try {
        // db를 통해 관리자 계정 체크
        const sql = `SELECT * FROM boards WHERE id='${id}'`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);


        // console.log(result);
        if (!result.err) {
            res.render('sub_08_05_review_write', { layout: 'layouts/front', title, fpath: 'commu', spath: 'review', update: true, result: result[0] });
        } else {
            return res.json( {result : 'program-error', data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'program-error', data : err})
    } finally {
        connection.release();
    }

});

router.post('/review/update', async function (req, res, next) {
    const {
        id,
        pwd,
    } = req.body;

    const connection = await pool.getConnection(async conn => conn);

    try {
        // db를 통해 관리자 계정 체크
        const sql = `SELECT * FROM boards WHERE id='${id}'`;
        const [result, fields] = await connection.query(sql);

        if (result.length !== 0) {

            // let isLoginalbe = await bcrypt.compare(userPwd + salt, dbPW);

            if (pwd == result[0].pwd) {

                if (!result.err) {
                    const cookieValue = 'ASJDifj/asdj9@!3$JOJFSAFJASFJSKAF';
                    res.cookie('review', cookieValue);
                    req.session[cookieValue] = true

                    return res.json( {result : 'review', data : true})
                } else {
                    throw new Error('not work db');
                }
            }
            // 비밀번호 틀림
            else {
                throw new Error('pwd error');
            }
            // 없는 아이디
        } else {
            throw new Error('not work db');
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'review-error', data : err})
    } finally {
        connection.release();
    }
});

router.post('/review/delete', async function (req, res, next) {
    const {
        id,
        pwd,
    } = req.body;

    const connection = await pool.getConnection(async conn => conn);

    try {
        // db를 통해 관리자 계정 체크
        const sql = `SELECT * FROM boards WHERE id='${id}'`;
        const [result, fields] = await connection.query(sql);

        if (result.length !== 0) {

            // let isLoginalbe = await bcrypt.compare(userPwd + salt, dbPW);

            if (pwd == result[0].pwd) {
                const deleteSql = `DELETE FROM boards WHERE id='${id}'`;
                const [deleteResult, deleteFields] = await connection.query(deleteSql);

                if (!result.err) {
                    return res.json( {result : 'review', data : true})
                } else {
                    throw new Error('not work db');
                }
            }
            // 비밀번호 틀림
            else {
                throw new Error('pwd error');
            }
            // 없는 아이디
        } else {
            throw new Error('not work db');
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'review-error', data : err})
    } finally {
        connection.release();
    }
});


router.get('/front/faq', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        // db를 통해 관리자 계정 체크
        const sql = 'SELECT * FROM faqs ORDER BY faqs.`show_order`';

        const [result, fields] = await connection.query(sql);

        if (!result.err) {
            return res.json( {result : 'faq', data : result})
        } else {
            return res.json( {result : 'faq-error', data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'faq-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/front/notice', async function (req, res, next) {
    const connection = await pool.getConnection(async conn => conn);

    try {
        
        // db를 통해 관리자 계정 체크
        const sql = "SELECT * FROM boards"
            + " WHERE category = 'notice'"
            + " ORDER BY id DESC"
            + " LIMIT 0, 5;"

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        if (!result.err) {
            return res.json( {result : 'notice', data : result})
        } else {
            return res.json( {result : 'notice-error', data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'notice-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/front/program', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        // db를 통해 관리자 계정 체크
        const sql = "SELECT * FROM programs"
            + " WHERE day >= curdate()"
            + " ORDER BY `day` ASC"
            + " LIMIT 0, 5;"

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        if (!result.err) {
            return res.json( {result : 'program', data : result})
        } else {
            return res.json( {result : 'program-error', data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'program-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/front/advert', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        // db를 통해 관리자 계정 체크
        const sql = `SELECT *, DATE_FORMAT(reg_date, \'%Y-%m-%d\') AS reg_date`
                    + ` FROM (SELECT * FROM gallery WHERE category='advert' AND is_advert=1 ORDER BY reg_date DESC) AS b`
                    + ` JOIN (SELECT MIN(id) AS img_id, img_url, img_type, gallery_id FROM images GROUP BY gallery_id) AS i ON b.id=i.gallery_id `
                    + ` ORDER BY b.id DESC`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        // console.log(result)

        if (!result.err) {
            return res.json( {result : 'advert', data : result})
        } else {
            return res.json( {result : 'advert-error', data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'advert-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/front/banner', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        // db를 통해 관리자 계정 체크
        const sql = `SELECT * FROM banners order by id desc`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        // console.log(result)

        if (!result.err) {
            return res.json( {result : 'banner', data : result})
        } else {
            return res.json( {result : 'banner-error', data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'banner-error', data : err})
    } finally {
        connection.release();
    }
});


router.get('/front/network', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        // db를 통해 관리자 계정 체크
        const sql = "SELECT * FROM networks ORDER BY id DESC";

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        if (!result.err) {
            return res.json( {result : 'network', data : result})
        } else {
            return res.json( {result : 'network-error', data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'network-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/front/mou', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        // db를 통해 관리자 계정 체크
        const sql = "SELECT * FROM mous ORDER BY id DESC";

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        if (!result.err) {
            return res.json( {result : 'mou', data : result})
        } else {
            return res.json( {result : 'mou-error', data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'mou-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/front/program/data', async function (req, res, next) {
    const { service } = req.query
    // console.log(id)

    const connection = await pool.getConnection(async conn => conn);

    console.log(service)
    try {
        // db를 통해 관리자 계정 체크
        const sql = `SELECT * FROM programs WHERE category='${service}' AND day >= curdate() ORDER BY day ASC`

        console.log(sql)
        const [result, fields] = await connection.query(sql);

        Object.values(result).forEach((data) => {
            const d = data.day.split('-');
            console.log(data.day)
            console.log(data.end_day)
            if (data.day == data.end_day) {
                data.name = `(${d[1]}월${d[2]}일) ${data.name}`;
            } else {
                const ed = data.end_day.split('-');
                
                data.name = `(${d[1]}월${d[2]}일~${ed[1]}월${ed[2]}일) ${data.name}`;
            }
        });

        // console.log(result)
        if (!result.err) {
            return res.json( {result : `service`, data : result})
        } else {
            return res.json( {result : `service-error`, data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'service-error', data : err})
    } finally {
        connection.release();
    }
});

router.get('/front/program/detail/data', async function (req, res, next) {
    const { id } = req.query
    // console.log(id)

    const connection = await pool.getConnection(async conn => conn);

    try {
        // db를 통해 관리자 계정 체크
        const sql = `SELECT *, DATE_FORMAT(day, \'%Y-%m-%d\') AS day FROM programs WHERE id='${id}'`

        const [result, fields] = await connection.query(sql);

        // console.log(result)
        if (!result.err) {
            return res.json( {result : `service`, data : result[0]})
        } else {
            return res.json( {result : `service-program-error`, data : 'not work db'})
        }
    } catch (err) {
        console.error(err);
        return res.json( {result : 'service-program-error', data : err})
    } finally {
        connection.release();
    }
});


// 캘린터 월 데이터
router.get('/calendar/monthList', async function (req, res, next) {
    const {
        fullDate
    } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    try {

        // db를 통해 관리자 계정 체크
        const sql = "SELECT" // boards
                    +       " *"
                    +       " , DATE_FORMAT(day, \'%Y-%m-%d\') AS day"
                    +       " , DATE_FORMAT(day, \'%Y-%m-%d\') AS day"
                    + " FROM programs"
                    + ` WHERE DATE_FORMAT(day, '%Y-%m') = '${fullDate}'`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        const today = moment();

        let obj = {};
        result.forEach((schedule) => {
            const index = moment(schedule.day).subtract(9, 'hour').format('D');
            const is_done = today.format('YYYY-MM-DD') >= schedule.day ? true : false;

            if (`${index}` in obj) {
                obj[`${index}`]
                    .push(
                        {
                            name: schedule.name,
                            id: schedule.id,
                            content: schedule.content,
                            is_done: is_done
                        }
                        );
                    } else {
                        obj[`${index}`]
                        = [
                            {
                                name: schedule.name,
                                id: schedule.id,
                                content: schedule.content,
                                is_done: is_done
                        }
                    ]
            }
        });

        console.log(obj)

        if (!result.err) {
            return res.json( {result : 'board', data : obj})
        } else {
            return res.json( {result : 'board-error', data : 'not work db'})
        }
    
    } catch (err) {
        console.error(err);
        return res.json( {result : 'board-error', data : err})
    
    } finally {
        connection.release();
    }
});

// // 캘린터 일 데이터
// router.get('/calendar/dayList', async function (req, res, next) {
//     const {
//         fullDate
//     } = req.query;

//     try {
        
//         const connection = await pool.getConnection(async conn => conn);

//         // db를 통해 관리자 계정 체크
//         const sql = "SELECT" // boards
//                     +       " *"
//                     +       " , DATE_FORMAT(day, \'%Y-%m-%d\') AS day"
//                     + " FROM programs"
//                     + ` WHERE DATE_FORMAT(day, '%Y-%m-%d') = '${fullDate}'`;

//         console.log(sql);
//         const [result, fields] = await connection.query(sql);

//         console.log(result)
//         const today = moment();

//         let obj = {};
//         result.forEach((schedule) => {
//             const index = moment(schedule.day).subtract(9, 'hour').format('D');
//             const is_done = today.format('YYYY-MM-DD') >= schedule.day ? true : false;

//             if (`${index}` in obj) {
//                 obj[`${index}`]
//                     .push(
//                         {
//                             name: schedule.name,
//                             id: schedule.id,
//                             content: schedule.content,
//                             is_done: is_done
//                         }
//                         );
//                     } else {
//                         obj[`${index}`]
//                         = [
//                             {
//                                 name: schedule.name,
//                                 id: schedule.id,
//                                 content: schedule.content,
//                                 is_done: is_done
//                         }
//                     ]
//             }
//         });

//         if (!result.err) {
//             return res.json( {result : 'board', data : obj})
//         } else {
//             return res.json( {result : 'board-error', data : 'not work db'})
//         }
    
//     } catch (err) {
//         console.error(err);
//         return res.json( {result : 'board-error', data : err})
//     } finally {
//         connection.release();
//     }
// });


// post

router.post('/front/counsel/write', async function (req, res, next) {
    const data = req.body;
    
    const connection = await pool.getConnection(async conn => conn);

    try {
        // db를 통해 관리자 계정 체크

        await connection.beginTransaction();

        const sql =`INSERT INTO `
                    +           `counsels(`
                    +                       `category`
                    +                       `, name`
                    +                       `, gender`
                    +                       `, birth`
                    +                       `, age`
                    +                       `, adress`
                    +                       `, phone`
                    +                       `, email`
                    +                       `, religion`
                    +                       `, dwelling`
                    +                       `, discharge`
                    +                       `, how`
                    +                       `, second_phone`
                    +                       `, counsel_way`
                    +                       `, counsel_exp`
                    +                       `, counsel_period`
                    +                       `, counsel_category`
                    +                       `, inspect_exp`
                    +                       `, inspect_date`
                    +                       `, inspect_category`
                    +                       `, family`
                    +                       `, condi`
                    +                       `, desease`
                    +                       `, disability`
                    +                       `, support`
                    +                       `, inspect`
                    +                       `, support_detail`
                    +                       `, expect_detail`
                    +                       `, time`
                    +           `) `
                    +           `VALUES(`
                    +                      `'${data.category}'`
                    +                      `, '${data.name}'`
                    +                      `, '${data.gender}'`
                    +                      `, '${data.birth}'`
                    +                      `, '${data.age}'`
                    +                      `, '${data.adress}'`
                    +                      `, '${data.phone}'`
                    +                      `, '${data.email}'`
                    +                      `, '${data.religion}'`
                    +                      `, '${data.dwelling}'`
                    +                      `, '${data.discharge}'`
                    +                      `, '${data.how}'`
                    +                      `, '${data.second_phone}'`
                    +                      `, '${data.counsel_way}'`
                    +                      `, '${data.counsel_exp}'`
                    +                      `, '${data.counsel_period}'`
                    +                      `, '${data.counsel_category}'`
                    +                      `, '${data.inspect_exp}'`
                    +                      `, '${data.inspect_date}'`
                    +                      `, '${data.inspect_category}'`
                    +                      `, '${data.family}'`
                    +                      `, '${data.condi}'`
                    +                      `, '${data.desease}'`
                    +                      `, '${data.disability}'`
                    +                      `, '${data.support}'`
                    +                      `, '${data.inspect}'`
                    +                      `, '${data.support_detail}'`
                    +                      `, '${data.expect_detail}'`
                    +                      `, '${data.time}'`
                    +           `)`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);


        if (!result.err) {
            await connection.commit();

            return res.json( {result : 'counsel', data : result.insertId});
        } else {
            await connection.rollback();

            return res.json( {result : 'counsel-error', data : 'not work db'});
        }
    } catch (err) {
        await connection.rollback();

        console.error(err);
        return res.json( {result : 'counsel-error', data : err});

    } finally {
        connection.release();
    }
});

router.post('/front/program/write', async function (req, res, next) {
    const data = req.body;
    
    const connection = await pool.getConnection(async conn => conn);

    try {
        // db를 통해 관리자 계정 체크

        await connection.beginTransaction();

        const sql =`INSERT INTO `
                    +           `programapps(`
                    +                       `program_id`
                    // +                       `category`
                    +                       `, name`
                    +                       `, gender`
                    +                       `, birth`
                    +                       `, age`
                    +                       `, adress`
                    +                       `, phone`
                    +                       `, email`
                    +                       `, how`
                    +                       `, support`
                    +                       `, expect_detail`
                    +           `) `
                    +           `VALUES(`
                    +                      `'${data.program_id}'`
                    // +                      `'${data.category}'`
                    +                      `, '${data.name}'`
                    +                      `, '${data.gender}'`
                    +                      `, '${data.birth}'`
                    +                      `, '${data.age}'`
                    +                      `, '${data.adress}'`
                    +                      `, '${data.phone}'`
                    +                      `, '${data.email}'`
                    +                      `, '${data.how}'`
                    +                      `, '${data.support}'`
                    +                      `, '${data.expect_detail}'`
                    +           `)`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);


        if (!result.err) {
            await connection.commit();

            return res.json( {result : 'program', data : result.insertId});
        } else {
            await connection.rollback();

            return res.json( {result : 'program-error', data : 'not work db'});
        }
    } catch (err) {
        await connection.rollback();

        console.error(err);
        return res.json( {result : 'program-error', data : err});

    } finally {
        connection.release();
    }
});

router.post('/commu/review/write', async function (req, res, next) {
    const {
        title,
        writer,
        content,
        pwd,
    } = req.body;
    
    const connection = await pool.getConnection(async conn => conn);

    try {
        // db를 통해 관리자 계정 체크

        await connection.beginTransaction();

        const sql =`INSERT INTO `
                    +           `boards(`
                    +                       `category`
                    +                       `, title`
                    +                       `, writer`
                    +                       `, content`
                    +                       `, pwd`
                    +           `) `
                    +           `VALUES(`
                    +                      `'review'`
                    +                      `, '${title}'`
                    +                      `, '${writer}'`
                    +                      `, '${content}'`
                    +                      `, '${pwd}'`
                    +           `)`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);


        if (!result.err) {
            await connection.commit();

            return res.json( {result : 'review', data : result.insertId});
        } else {
            await connection.rollback();

            return res.json( {result : 'review-error', data : 'not work db'});
        }
    } catch (err) {
        await connection.rollback();

        console.error(err);
        return res.json( {result : 'mou-error', data : err});

    } finally {
        connection.release();
    }
});

router.post('/commu/review/update', async function (req, res, next) {
    const {
        id,
        title,
        writer,
        content,
        pwd,
    } = req.body;
    
    const connection = await pool.getConnection(async conn => conn);

    try {

        await connection.beginTransaction();


        const sql =`UPDATE boards SET `
                    +                   ` title='${title}',`
                    +                   ` writer='${writer}',`
                    +                   ` content='${content}',`
                    +                   ` pwd='${pwd}'`
                    +           ` WHERE id=${id}`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        if (!result.err) {
            await connection.commit();

            return res.json( {result : 'review', data : id});
        } else {
            await connection.rollback();

            return res.json( {result : 'review-error', data : 'not work db'});
        }
    } catch (err) {
        await connection.rollback();

        console.error(err);
        return res.json( {result : 'mou-error', data : err});

    } finally {
        connection.release();
    }
});

module.exports = router;
