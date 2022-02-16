const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const moment = require('moment');

const multer = require('multer');
const fs = require('fs');
const path = require('path');


const async = require("async");

const pool = require('../models/index');
const { json } = require('express');

try {
    fs.readdirSync('public/uploads');
} catch (err) {
    console.log('폴더 생성');
    fs.mkdirSync('public/uploads');
}

const upload = multer({
    // storage : 이미지의 destination, filename 지정
    // 위 함수들의 매개 변수
    // req : 요청
    // file : 업로드한 file 정보
    // done : 첫 번째 인수 - 에러, 두 번째 인수 - 경로, 파일 이름
    // req, file의 데이터를 가공해서 done으로 넘기는 방식
    
    
    // storage: multer.diskStorage({
    //     destination(req, file, done) {
    //         done(null, path.join(__dirname, `../public/uploads/`));
    //     },
    //     filename(req, file, done) {
    //         const ext = path.extname(file.originalname);
    //         done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    //     },
    // }),
    // limits: { fieldSize: 15 * 1024 * 1024 },
    storage : null
});

function getPath(title, url) {
    return { 
        title, 
        url,
    };
}

function checkList(data) {
    if (typeof(data) != 'object' && typeof(data) != 'undefined') {
        return [data];
    } else {
        return data
    }
}

const title = '경기도심리지원센터 관리자 페이지';
const paths = {
    checkPwd: { title: '계정변경', url: '/admin/checkPwd' },
    changeUser: { title: '계정변경', url: '/admin/changeUser' },
    applicantsRecords: { title: '제출내역', url: '' },
    applyCounsel: { title: '상담·검사·심리지원 신청', url: '/admin/appCounsel' },
    applyProgram: { title: '프로그램 신청', url: '/admin/appProgram' },
    appForm: { title: '상세내역', url: '/admin/appForm' },
    program: { title: '프로그램 관리', url: '/admin/program' },
    cooperation: { title: '연계협력 관리', url: '' },
    mou: { title: 'MOU 기관', url: '/admin/mou' },
    network: { title: '지역사회 네트워크', url: '/admin/network' },
    board: { title: '게시판 관리', url: '' },
    'research': { title: '연구보고', url: '/admin/research' },
    'notice': { title: '공지사항', url: '/admin/notice' },
    'news': { title: '센터소식', url: '/admin/news' },
    'reference': { title: '자료실', url: '/admin/reference' },
    'review': { title: '센터이용후기', url: '/admin/review' },
    gallery: { title: '갤러리', url: '/admin/gallery' },
    faq: { title: 'FAQ 관리', url: '/admin/faq' },
}



/* ---------- GET ---------- */

// router.get('/test', verifyToken, function (req, res, next) {
//     res.json(req.decoded);
// });


// router.use('/', function (req, res, next) {
//     const sessionId = req.cookies.logined;

//     console.log(sessionId)
//     console.log(req.session[sessionId])
    
//     if (req.session[sessionId]) {
//         next();
//     }
//     else {
//         res.write("<script>alert('please login.')</script>");
//         res.write("<script>location.href=\"/admin\"</script>");
//         return res.end();
//     }
// });

router.get('/main', function (req, res, next) {
    res.render('admin/main', {
        title,
        navbar: true,
        fpaths: { title: '' },
    });
});

router.get('/main/counsel', async function (req, res, next) {
    const connection = await pool.getConnection(async conn => conn);
    
    try {
        const sql = 'SELECT DATE_FORMAT(DATE_SUB(`reg_date`, INTERVAL (DAYOFWEEK(`reg_date`)-1) DAY), \'%Y/%m/%d\') AS start,'
                    +       ' DATE_FORMAT(DATE_SUB(`reg_date`, INTERVAL (DAYOFWEEK(`reg_date`)-7) DAY), \'%Y/%m/%d\') as end,'
                    +       ' DATE_FORMAT(\`reg_date\`, \'%Y%U\') AS \`date\`,'
                    +       ' count(id) AS app'
                    + ' FROM ( SELECT *'
                    +           ' FROM counsels'
                    +           ' WHERE DATE(reg_date)'
                    +                   ' BETWEEN ADDDATE( CURDATE(), - WEEKDAY(CURDATE()) - 22)'
                    +                   ' AND ADDDATE( CURDATE(), - WEEKDAY(CURDATE()) + 6)'
                    +           ' ORDER BY reg_date DESC'
                    +           ' LIMIT 10000000 ) AS c'
                    +  ' GROUP BY date'

        console.log(sql)
        const [result, fields] = await connection.query(sql);

        const obj = [{app:0}, {app:0}, {app:0}, {app:0}]
        Object.values(result).forEach((data) => {
            if (data.start == moment().day(0).format('YYYY/MM/DD')) {
                obj[0].app = data.app;
            } else if (data.start == moment().day(-7).format('YYYY/MM/DD')) {
                obj[1].app = data.app;
            } else if (data.start == moment().day(-14).format('YYYY/MM/DD')) {
                obj[2].app = data.app;
            } else if (data.start == moment().day(-21).format('YYYY/MM/DD')) {
                obj[3].app = data.app;
            } else { }
        });
        return res.json(obj);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.get('/main/program', async function (req, res, next) {
    const connection = await pool.getConnection(async conn => conn);
    
    try {
        const sql = 'select p.name, p.day, count(pa.id) as app'
                    + ' from ('
                    +           ' select id, name, day'
                    +           ' from programs'
                    +           ' WHERE day >= curdate()'
                    +           ' ORDER BY day ASC'
                    +           ' LIMIT 4'
                    +       ') p'
                    + ' LEFT JOIN programapps as pa'
                    + ' ON p.id = pa.program_id'
                    + ' GROUP BY p.name';

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        Object.values(result).forEach(data => {
            if (data.name.length > 5) {
                data.name = data.name[0] + data.name[1] + data.name[2] + data.name[3] + data.name[4] + '...'
            } else {}
            
            const temp = data.day.split('-')
            data.name = data.name + `(${temp[1]}.${temp[2]})`;
        });

        console.log(result)

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.get('/main/review', async function (req, res, next) {
    const connection = await pool.getConnection(async conn => conn);
    
    try {
        const sql = 'SELECT *'
                    + ' FROM boards'
                    + ' WHERE category=\'review\''
                    + ' ORDER BY reg_date DESC'
                    + ' LIMIT 4';

        const [result, fields] = await connection.query(sql);

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.get('/checkPwd', function (req, res, next) {
    res.render('admin/password-check', {
        title,
        fpaths: paths.checkPwd,
    });
});

router.get('/logout', function (req, res, next) {
    req.session.destroy(function(err){})

    res.cookie('logined', '', { maxAge: 0 });

    res.render('admin/sign-in', { layout: 'layouts/blank', title });
});

router.get('/changeUser', async function (req, res, next) {
    // 계정변경 접근권한 확인
    const sessionId = req.cookies.checked;
    
    if (req.session[sessionId]) {
        const connection = await pool.getConnection(async conn => conn);

        try {
            const userId = req.cookies.logined;

            const sql = `SELECT * FROM users WHERE id = '${userId}'`;
            const [result, fields] = await connection.query(sql);

            res.render('admin/user-change', {
                title,
                fpaths: paths.changeUser,
                userId: result[0].id
            });

        } catch (err) {
            console.log(err);
            return res.render('admin/sign-in', { layout: 'layouts/blank', notLogined: true});

        } finally {
            connection.release();
        }
    }
    else {
        // 잘못된 접근.
        return res.render('admin/sign-in', { layout: 'layouts/blank', notLogined: true});
    }
});


router.get('/appCounsel', function (req, res, next) {
    res.render('admin/appCounsel', {
        title,
        fpaths: paths.applicantsRecords,
        spaths: paths.applyCounsel,
    });
});


router.get('/appCounsel/appForm', async function (req, res, next) {
    const { id } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM counsels WHERE id = ${id}`;
        const [result, fields] = await connection.query(sql);

        const tpaths = getPath('상세내역', paths.applyCounsel.url + '/appForm');

        res.render('admin/app-counsel-form', {
            title,
            fpaths: paths.applicantsRecords,
            spaths: paths.applyCounsel,
            tpaths,
            result: result[0],
        });
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});


// router.post('/appCounsel/write', async function (req, res, next) {
//     const { id } = req.query;

//     const connection = await pool.getConnection(async conn => conn);

//     try {
//         const sql = `INSERT INTO programs(category, name, day, content)` + 
//         `VALUES('${category}', '${name}', '${date}', '${content}')`;

//         const [result, fields] = await connection.query(sql);

//         if (result.affectedRows > 0) {
//             await connection.commit();
//             console.log('program write success');

//             return res.json(1);
//         }
//         else {
//             throw new Error('에러');
//         }
//     } catch (err) {
//         console.log(err);
//         return res.json(0);
    
//     } finally {
//         connection.release();
//     }
// });


// var year = today.getFullYear();
        // var month = ('0' + (today.getMonth() + 1)).slice(-2);
        // var day = ('0' + today.getDate()).slice(-2);
        // Object.values(result).forEach(data => {
        //     const date = new Date(data.reg_date)
        //     console.log(date.getFullYear())
        //     console.log()
        //     data.reg_date = '1'
        // });

router.get('/appCounsel/data', async function (req, res, next) {
    const {
        category,
        name,
        gender,
        age,
        done,
        startdate,
        enddate,
    } = req.query;
    const connection = await pool.getConnection(async conn => conn);

    const genderDetail = gender == '그 외' ? `!='남' AND gender != '여'` : `='${gender}'`;

    const categoryQuery = category ? `category = '${category}' AND` : '';
    const nameQuery = name ? `name LIKE '%${name}%' AND` : '';
    const genderQuery = gender ? `gender ${genderDetail} AND` : '';
    const ageQuery = age ? `age = '${age}' AND` : '';
    const doneQuery = done ? `is_done = ${done}` : 'is_done != -1';
    const dateQuery = startdate&&enddate ? `(reg_date BETWEEN ${startdate} AND ${(parseInt(enddate) + 1).toString()}) AND` : '';

    try {
        const sql = `SELECT * FROM counsels WHERE ${categoryQuery} ${nameQuery} ${genderQuery} ${ageQuery} ${dateQuery} ${doneQuery} ORDER BY id DESC`;
        const [result, fields] = await connection.query(sql);

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.get('/appCounsel/excel', async function (req, res, next) {
    const {
        category,
        name,
        gender,
        age,
        done,
        startdate,
        enddate,
    } = req.query;

    try {
        // @breif xlsx 모듈추출
        const xlsx = require("xlsx");

        // @breif 가상의 엑셀파일을 생성한다.
        const book = xlsx.utils.book_new();

        // --------------------------------------------------------------------
        
        const connection = await pool.getConnection(async conn => conn);
    
        const genderDetail = gender == '그 외' ? `!='남' AND gender != '여'` : `='${gender}'`;
    
        const categoryQuery = category ? `category = '${category}' AND` : '';
        const nameQuery = name ? `name LIKE '%${name}%' AND` : '';
        const genderQuery = gender ? `gender ${genderDetail} AND` : '';
        const ageQuery = age ? `age = '${age}' AND` : '';
        const doneQuery = done ? `is_done = ${done}` : 'is_done != -1';
        const dateQuery = startdate&&enddate ? `(reg_date BETWEEN ${startdate} AND ${(parseInt(enddate) + 1).toString()}) AND` : '';
    
        
        const sql = `SELECT * FROM counsels WHERE ${categoryQuery} ${nameQuery} ${genderQuery} ${ageQuery} ${dateQuery} ${doneQuery}`;
        const [result, fields] = await connection.query(sql);

        return res.json(result);
        // @breif 1번 시트
        // @breif aoa_to_sheet 방식으로 데이터를 생성한다.
        let tempSheet = [
            ["서비스", "이름", "성별", "생년월일", "나이(만)",
            "주소", "전화번호", "종교", "주거", "군필",
            "경위", "비상번호", "상담방식", "상담경험", "이전 상담기간",
            "이전 상담종류", "검사경험", "이전 검사일", "이전 검사종류", "가족관계",
            "건강상태", "질병", "장애여부", "도움영역", "검사영역",
            "도움 받고 싶은 부분", "기대하는 부분", "가능 시간"]
            // , ["흉부외과", "병원장", "주전", "67"]
            // , ["흉부외과", "교수", "천명태", "52"]
            // , ["흉부외과", "치프", "도재학", "39"]
            // , ["소아외과", "레지던트", "장겨울", "29"]
            // , ["산부인과", "레지던트", "추민하", "34"]
            // , ["산부인과", "레지던트", "명은원", "28"]
            // , ["신경외과", "교수", "민기준", "55"]
            // , ["신경외과", "레지던트", "허선빈", "31"]
            // , ["응급의학과", "조교수", "봉광현", "40"]
            // , ["응급의학과", "펠로우", "배준희", "31"]
        ]

        Object.values(result).forEach(data => {
            tempSheet.push([
                `${data.category}`, `${data.name}`, `${data.gender}`, `${data.birth}`, `${data.age}`, 
                `${data.adress}`, `${data.phone}`, `${data.religion}`, `${data.dwelling}`, `${data.discharge}`, 
                `${data.how}`, `${data.second_phone}`, `${data.counsel_way}`, `${data.counsel_exp}`, `${data.counsel_period}`, 
                `${data.counsel_category}`, `${data.inspect_exp}`, `${data.inspect_date}`, `${data.inspect_category}`, `${data.family}`, 
                `${data.condition}`, `${data.desease}`, `${data.disability}`, `${data.support}`, `${data.inspect}`, 
                `${data.support_detail}`, `${data.expect_detail}`, `${data.time}` 
            ]);
        });

        const doctors = xlsx.utils.aoa_to_sheet(tempSheet);
        // @breif CELL 넓이 지정
        // doctors["!cols"] = [
        //     { wpx: 130 }   // A열
        //     , { wpx: 100 }   // B열
        //     , { wpx: 80 }    // C열
        //     , { wch: 60 }    // D열
        // ]

        // @breif 첫번째 시트에 작성한 데이터를 넣는다.
        xlsx.utils.book_append_sheet(book, doctors, "DOCTOR");

        // --------------------------------------------------------------------

        // @breif 2번 시트
        // @details json_to_sheet 방식으로 데이터를 생성한다.
        // const nurses = xlsx.utils.json_to_sheet([
        //     { A: "학과", B: "직급", C: "이름", D: "나이" }
        //     , { A: "흉부외과", B: "PA간호사", C: "소이현", D: "33" }
        //     , { A: "소아외과", B: "PA간호사", C: "한현희", D: "29" }
        //     , { A: "산부인과", B: "분만실간호사", C: "한한승주현희", D: "41" }
        //     , { A: "산부인과", B: "PA간호사", C: "은선진", D: "36" }
        //     , { A: "간담췌외과", B: "수간호사", C: "송수빈", D: "45" }
        //     , { A: "간담췌외과", B: "병동간호사", C: "김재환", D: "28" }
        //     , { A: "간담췌외과", B: "PA간호사", C: "국해성", D: "32" }
        //     , { A: "신경외과", B: "PA간호사", C: "황재신", D: "39" }
        //     , { A: "응급의학과", B: "응급실간호사", C: "선우희수", D: "26" }
        // ], { header: ["A", "B", "C", "D"], skipHeader: true });


        // // @breif CELL 넓이 지정
        // nurses["!cols"] = [
        //     { wpx: 130 }   // A열
        //     , { wpx: 100 }   // B열
        //     , { wpx: 80 }    // C열
        //     , { wch: 60 }    // D열
        // ]

        // @details 두번째 시트에 작성한 데이터를 넣는다.
        // xlsx.utils.book_append_sheet(book, nurses, "NURSES");
        // --------------------------------------------------------------------

        // @files 엑셀파일을 생성하고 저장한다.

        const filename = `신청내역${Date.now()}.xlsx`;
        // 

        xlsx.writeFile(book, `public/uploads/${filename}`);

        return res.json(filename);
    } catch(err) {
        console.log(err);
        return res.json(0)
    }
    
});

router.get('/appProgram', function (req, res, next) {
    res.render('admin/appProgram', {
        title,
        fpaths: paths.applicantsRecords,
        spaths: paths.applyProgram,
    });
});


router.get('/appProgram/appForm', async function (req, res, next) {
    const { id } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT pa.*, p.name AS program_name FROM (SELECT * FROM programapps WHERE id = ${id}) AS pa JOIN programs AS p ON pa.program_id = p.id`;

        console.log(sql);
        const [result, fields] = await connection.query(sql);

        const tpaths = getPath('상세내역', paths.applyCounsel.url + '/appForm');

        res.render('admin/app-program-form', {
            title,
            fpaths: paths.applicantsRecords,
            spaths: paths.applyProgram,
            tpaths,
            result: result[0],
        });
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.get('/appProgram/data', async function (req, res, next) {
    const {
        category,
        name,
        gender,
        age,
        done,
        startdate,
        enddate,
    } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    const genderDetail = gender == '그 외' ? `!='남' AND gender != '여'` : `='${gender}'`;

    const categoryQuery = category ? `WHERE p.category = '${category}'` : '';
    const nameQuery = name ? `name LIKE '%${name}%' AND` : '';
    const genderQuery = gender ? `gender ${genderDetail} AND` : '';
    const ageQuery = age ? `age = '${age}' AND` : '';
    const doneQuery = done ? `is_done = ${done}` : 'is_done != -1';
    const dateQuery = startdate&&enddate ? `(reg_date BETWEEN ${startdate} AND ${(parseInt(enddate) + 1).toString()}) AND` : '';

    try {
        const sql = `SELECT pa.*, p.name AS program_name FROM (SELECT * FROM programapps`
                    + ` WHERE ${nameQuery} ${genderQuery} ${ageQuery} ${dateQuery} ${doneQuery}) AS pa JOIN programs AS p ON pa.program_id = p.id ${categoryQuery} ORDER BY pa.id DESC`;
        
        console.log(sql);
        const [result, fields] = await connection.query(sql);

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.get('/appProgram/excel', async function (req, res, next) {
    const {
        category,
        name,
        gender,
        age,
        done,
        startdate,
        enddate,
    } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    const genderDetail = gender == '그 외' ? `!='남' AND gender != '여'` : `='${gender}'`;

    const categoryQuery = category ? `WHERE p.category = '${category}'` : '';
    const nameQuery = name ? `name LIKE '%${name}%' AND` : '';
    const genderQuery = gender ? `gender ${genderDetail} AND` : '';
    const ageQuery = age ? `age = '${age}' AND` : '';
    const doneQuery = done ? `is_done = ${done}` : 'is_done != -1';
    const dateQuery = startdate&&enddate ? `(reg_date BETWEEN ${startdate} AND ${(parseInt(enddate) + 1).toString()}) AND` : '';

    try {
        // @breif xlsx 모듈추출
        const xlsx = require("xlsx");

        // @breif 가상의 엑셀파일을 생성한다.
        const book = xlsx.utils.book_new();

        // --------------------------------------------------------------------
    
        const sql = `SELECT pa.*, p.name AS program_name FROM (SELECT * FROM programapps`
                    + ` WHERE ${nameQuery} ${genderQuery} ${ageQuery} ${dateQuery} ${doneQuery}) AS pa JOIN programs AS p ON pa.program_id = p.id ${categoryQuery}`;

        console.log(sql)
        const [result, fields] = await connection.query(sql);

        return res.json(result)

        // @breif 1번 시트
        // @breif aoa_to_sheet 방식으로 데이터를 생성한다.
        let tempSheet = [
            ["서비스", "프로그램 이름", "이름", "성별", "생년월일",
            "나이(만)", "주소", "전화번호", "경위", "도움영역",
            "기대하는 부분"]
            // , ["흉부외과", "병원장", "주전", "67"]
            // , ["흉부외과", "교수", "천명태", "52"]
            // , ["흉부외과", "치프", "도재학", "39"]
            // , ["소아외과", "레지던트", "장겨울", "29"]
            // , ["산부인과", "레지던트", "추민하", "34"]
            // , ["산부인과", "레지던트", "명은원", "28"]
            // , ["신경외과", "교수", "민기준", "55"]
            // , ["신경외과", "레지던트", "허선빈", "31"]
            // , ["응급의학과", "조교수", "봉광현", "40"]
            // , ["응급의학과", "펠로우", "배준희", "31"]
        ]

        Object.values(result).forEach(data => {
            tempSheet.push([
                `${data.category}`, `${data.program_name}`, `${data.name}`, `${data.gender}`,`${data.birth}`,
                `${data.age}`, `${data.adress}`, `${data.phone}`, `${data.how}`, `${data.support}`,
                `${data.expect_detail}` 
            ]);
        });

        const doctors = xlsx.utils.aoa_to_sheet(tempSheet);
        // @breif CELL 넓이 지정
        // doctors["!cols"] = [
        //     { wpx: 130 }   // A열
        //     , { wpx: 100 }   // B열
        //     , { wpx: 80 }    // C열
        //     , { wch: 60 }    // D열
        // ]

        // @breif 첫번째 시트에 작성한 데이터를 넣는다.
        xlsx.utils.book_append_sheet(book, doctors, "DOCTOR");

        // --------------------------------------------------------------------

        // @breif 2번 시트
        // @details json_to_sheet 방식으로 데이터를 생성한다.
        // const nurses = xlsx.utils.json_to_sheet([
        //     { A: "학과", B: "직급", C: "이름", D: "나이" }
        //     , { A: "흉부외과", B: "PA간호사", C: "소이현", D: "33" }
        //     , { A: "소아외과", B: "PA간호사", C: "한현희", D: "29" }
        //     , { A: "산부인과", B: "분만실간호사", C: "한한승주현희", D: "41" }
        //     , { A: "산부인과", B: "PA간호사", C: "은선진", D: "36" }
        //     , { A: "간담췌외과", B: "수간호사", C: "송수빈", D: "45" }
        //     , { A: "간담췌외과", B: "병동간호사", C: "김재환", D: "28" }
        //     , { A: "간담췌외과", B: "PA간호사", C: "국해성", D: "32" }
        //     , { A: "신경외과", B: "PA간호사", C: "황재신", D: "39" }
        //     , { A: "응급의학과", B: "응급실간호사", C: "선우희수", D: "26" }
        // ], { header: ["A", "B", "C", "D"], skipHeader: true });


        // // @breif CELL 넓이 지정
        // nurses["!cols"] = [
        //     { wpx: 130 }   // A열
        //     , { wpx: 100 }   // B열
        //     , { wpx: 80 }    // C열
        //     , { wch: 60 }    // D열
        // ]

        // @details 두번째 시트에 작성한 데이터를 넣는다.
        // xlsx.utils.book_append_sheet(book, nurses, "NURSES");
        // --------------------------------------------------------------------

        // @files 엑셀파일을 생성하고 저장한다.

        const filename = `신청내역${Date.now()}.xlsx`;

        xlsx.writeFile(book, `public/uploads/${filename}`);

        return res.json(filename);
    } catch(err) {
        console.log(err);
        return res.json(0)
    } finally {
        connection.release();
    }
    
});


router.get('/program', function (req, res, next) {
    res.render('admin/program', {
        title,
        fpaths: paths.program,
    });
});


router.get('/program/data', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM programs ORDER BY id DESC`;
        const [result, fields] = await connection.query(sql);
        
        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.get('/program/write', async function (req, res, next) {

    const spaths = getPath(paths.program.title + ' 추가', paths.program.url + '/write');

    res.render(`admin/program-form`, { 
        title,
        fpaths: paths.program,
        spaths,
    });
});

router.get('/program/update', async function (req, res, next) {
    const { id } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM programs WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);

        const fpaths = getPath(paths.program.title, paths.program.url);
        const spaths = getPath(paths.program.title + ' 수정', paths.program.url + '/update');

        res.render(`admin/program-form`, { 
            title,
            fpaths,
            spaths,
            result: result[0],
            update: true,
        });
    } catch (err) {
        console.log(err);
        next(err);

    } finally {
        connection.release();
    }
});

router.get('/program/copy', async function (req, res, next) {
    const { id } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM programs WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);

        const fpaths = getPath(paths.program.title, paths.program.url);
        const spaths = getPath(paths.program.title + ' 복사', paths.program.url + '/copy');

        res.render(`admin/program-form`, { 
            title,
            fpaths,
            spaths,
            result: result[0],
            update: false,
        });
    } catch (err) {
        console.log(err);
        next(err);

    } finally {
        connection.release();
    }
});


router.get('/mou', function (req, res, next) {
    const fpaths = getPath(paths.cooperation.title, paths.cooperation.url);
    const spaths = getPath(paths.mou.title, paths.mou.url);

    res.render('admin/mou', {
        title,
        fpaths,
        spaths,
    });
});

router.get('/mou/data', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM mous order by id desc`;
        const [result, fields] = await connection.query(sql);

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.get('/mou/write', function (req, res, next) {

    const fpaths = getPath(paths.cooperation.title, paths.cooperation.url);
    const spaths = getPath(paths.mou.title + ' 추가', paths.mou.url + '/write');

    res.render('admin/mou-form', {
        title,
        fpaths,
        spaths,
    });
});


router.get('/mou/update', async function (req, res, next) {
    const { id } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM mous WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);

        const fpaths = getPath(paths.cooperation.title, paths.cooperation.url);
        const spaths = getPath(paths.mou.title + ' 수정', paths.mou.url + '/update');

        res.render(`admin/mou-form`, { 
            title,
            fpaths,
            spaths,
            result: result[0],
        });
    } catch (err) {
        console.log(err);
        next(err);

    } finally {
        connection.release();
    }
});


router.get('/network', function (req, res, next) {
    
    const fpaths = getPath(paths.cooperation.title, paths.cooperation.url);
    const spaths = getPath(paths.network.title, paths.network.url);

    res.render('admin/network', {
        title,
        fpaths,
        spaths,
    });
});


router.get('/network/data', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM networks`;
        const [result, fields] = await connection.query(sql);

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.get('/network/write', function (req, res, next) {

    const fpaths = getPath(paths.cooperation.title, paths.cooperation.url);
    const spaths = getPath(paths.network.title + ' 추가', paths.network.url + '/write');

    res.render('admin/network-form', {
        title,
        fpaths,
        spaths,
    });
});


router.get('/network/update', async function (req, res, next) {
    const { id } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM networks WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);

        const fpaths = getPath(paths.cooperation.title, paths.cooperation.url);
        const spaths = getPath(paths.network.title + ' 수정', paths.network.url + '/update');

        res.render(`admin/network-form`, { 
            title,
            fpaths,
            spaths,
            result: result[0],
        });
    } catch (err) {
        console.log(err);
        next(err);

    } finally {
        connection.release();
    }
});

router.get('/:board', function (req, res, next) {
    const { board } = req.params;

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return next();
    } else {}

    console.log('board type : ' + board)

    res.render(`admin/board`, {
        title,
        fpaths: paths.board,
        spaths: paths[`${board}`],
    });
});


router.get('/:board/data', async function (req, res, next) {
    const { board } = req.params;

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return next();
    } else {}
    
    console.log(board)

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT *, DATE_FORMAT(reg_date, '%Y-%m-%d') AS reg_date FROM boards WHERE category='${board}' ORDER BY id DESC`;
        const [result, fields] = await connection.query(sql);

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.get('/:board/write', function (req, res, next) {
    const { board } = req.params;

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return next();
    } else {}

    const tpaths = getPath(paths[`${board}`].title + ' 추가', paths[`${board}`].url + '/write');

    res.render(`admin/board-form`, {
        title,
        fpaths: paths.board,
        spaths: paths[`${board}`],
        tpaths,
        filelen: 0,
    });
});

function bytesToSize(bytes) { // 1
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 }


router.get('/:board/update', async function (req, res, next) {
    const { board } = req.params;
    const { id } = req.query;

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return next();
    } else {}

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM boards WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);
        
        const fileSql = `SELECT * FROM files WHERE board_id=${result[0].id}`
        const [fileResult, fileFields] = await connection.query(fileSql);

        Object.values(fileResult).forEach(data => {
            data.file_size = bytesToSize(data.file_size);
        });

        const tpaths = getPath(paths[`${board}`].title + ' 수정', paths[`${board}`].url + '/update');

        res.render(`admin/board-form`, {
            title,
            fpaths: paths.board,
            spaths: paths[`${board}`],
            tpaths,
            result: result[0],
            fileResult: fileResult,
            filelen: fileResult.length
        });

    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.get('/gallery', function (req, res, next) {
    res.render(`admin/gallery`, {
        title,
        fpaths: paths.board,
        spaths: paths.gallery,
    });
});

router.get('/gallery/data', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM gallery`;
        const [result, fields] = await connection.query(sql);

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.get('/gallery/write', function (req, res, next) {
    const tpaths = getPath(paths.gallery.title + ' 추가', paths.gallery.url + '/write');

    res.render(`admin/gallery-form`, {
        title,
        fpaths: paths.board,
        spaths: paths.gallery,
        tpaths,
    });
});


router.get('/gallery/update', async function (req, res, next) {
    const { id } = req.query;
    
    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM gallery WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);

        const imgSql = `SELECT * FROM images WHERE gallery_id=${id}`;
        const [imgResult, imgFields] = await connection.query(imgSql);

        const tpaths = getPath(paths.gallery.title + ' 수정', paths.gallery.url + '/update');

        res.render(`admin/gallery-form`, { 
            title,
            fpaths: paths.board,
            spaths: paths.gallery,
            tpaths,
            result: result[0],
            imgResult,
        });

    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.get('/faq', function (req, res, next) {

    res.render('admin/faq', {
        title,
        fpaths: paths.faq,
        le: 5,
    });
});


router.get('/faq/data', async function (req, res, next) {

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM faqs`;
        const [result, fields] = await connection.query(sql);

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.get('/faq/write', async function (req, res, next) {
        const spaths = getPath(paths.faq.title + ' 작성', paths.faq.url + '/write');
    
        res.render(`admin/faq-form`, { 
            title,
            fpaths: paths.faq,
            spaths,
        });
});

router.get('/faq/update', async function (req, res, next) {
    const { id } = req.query;

    const connection = await pool.getConnection(async conn => conn);

    try {
        const sql = `SELECT * FROM faqs WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);

        const spaths = getPath(paths.faq.title + ' 수정', paths.faq.url + '/update');
    
        res.render(`admin/faq-form`, { 
            title,
            fpaths: paths.faq,
            spaths,
            result: result[0],
        });
    
    } catch (err) {
        console.log(err);
        next(err);
    
    } finally {
        connection.release();
    }
});




/* ---------- POST ---------- */

router.post('/program/write', async function (req, res, next) {
    const { 
            category,
            name,
            date,
            content,
        } = req.body

    let service = '';

    switch (category) {
        case '심리특강':
            service = '심리·상담';
            break;
        case '지지집단':
            service = '심리·상담';
            break;
        case '집단힐링 프로그램':
            service = '심리·상담';
            break;
        case '기초 심리교육':
            service = '심리교육';
            break;
        case '심층 심리교육':
            service = '심리교육';
            break;
        case '상담사 교육':
            service = '심리교육';
            break;
        case '돌봄/감정노동 종사자 심리지원':
            service = '취약계층지원사업';
            break;
        default:
            console.log('프로그램 추가 - 잘못된 프로그램명 접근 : ' + category);
            return res.json(0);
    }

    const connection = await pool.getConnection(async conn => conn);

    try {
        await connection.beginTransaction();

        const sql = `INSERT INTO programs(service, category, name, day, content)` + 
                    `VALUES('${service}', '${category}', '${name}', '${date}', '${content}')`;
        const [result, fields] = await connection.query(sql);

        if (result.affectedRows > 0) {
            await connection.commit();
            console.log('program write success');

            return res.json(result.insertId);
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        await connection.rollback();
        console.log('program write fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.post('/gallery/write', upload.any(), async function (req, res, next) {
    const { 
            name,
            content,
        } = req.body

    const connection = await pool.getConnection(async conn => conn);
        
    try {

        const sql = `INSERT INTO gallery(title, content)`
                    + `VALUES('${name}', '${content}')`;
        const [r, f] = await connection.query(sql);
        

        let mutipleQuery = '';

        const galleryId = r.insertId;

        Array.from(req.files).forEach(file => {
            const temp = file.originalname.split('.');

            fileType = temp[1].toLowerCase();
            fileName = temp[0] + '_' + Date.now();
    
            // let filePath = 'public/images/gallery/' + fileName + '.' + fileType;
            let filePath = path.join(__dirname, '../public/images/gallery/' + fileName + '.' + fileType);
            
            var buffer = Buffer.from(file.buffer, 'base64');
            
            console.log(filePath)
            fs.writeFileSync(filePath, buffer)
                    
            console.log(fs.readFileSync(filePath))

            const sql = `INSERT INTO images(gallery_id, img_originname, img_url, img_size, img_type)`
                                + ` VALUES('${galleryId}', '${file.originalname}', '${fileName}', ${file.size}, '${fileType}');`;
            
            mutipleQuery += sql;
        });

        const [result, fields] = await connection.query(mutipleQuery);
        
        console.log(result[0])
        console.log(result)
        
        if (result[0].affectedRows > 0) {
            console.log('gallery write success');
            return res.json(1);
        } else {
            console.log('gallery db write fail');
            return res.json(0);
        }

        
    } catch (err) {
        console.log('catch err : gallery write fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        console.log('finish')
        connection.release();
    }
});

router.post('/mou/write', upload.single("image"), async function (req, res, next) {
    // console.log("/mou/write/");

    const { 
            name,
            mou_content,
            url,
        } = req.body

        const connection = await pool.getConnection(async conn => conn);
        
    try {
        console.log(req.body)
        await connection.beginTransaction();

        let imgName = '';
        let imgType = '';

        if (typeof(req.file) != 'undefined') {

            const temp = req.file.originalname.split('.');

            imgType = temp[1].toLowerCase();
            imgName = temp[0] + '_' + Date.now();

            let filePath = path.join(__dirname, '../public/images/mou/' + imgName + '.' + imgType);
 
            // console.log(filePath);

            var buffer = Buffer.from(req.file.buffer, 'base64');

            fs.writeFileSync(filePath, buffer, function(err){
                if(err){
                    console.log('upload 에러발생 :', err);
                    
                    return res.json(0);
                } else {
                    console.log('완료');
                }
            });

        } else {
            console.log('no upload');
        }
        
        const sql = `INSERT INTO mous(name, content, url, img_name, img_type)` + 
                    `VALUES('${name}', '${mou_content}', '${url}', '${imgName}', '${imgType}')`;
        const [result, fields] = await connection.query(sql);
        

        if (result.affectedRows > 0) {
            await connection.commit();
            console.log('mou write success');

            return res.json(1);
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        await connection.rollback();
        console.log('mou write fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.post('/network/write', async function (req, res, next) {
    const { 
            name,
            adress,
            phoneNumber,
            url,
        } = req.body

    const connection = await pool.getConnection(async conn => conn);

    try {
        await connection.beginTransaction();

        const sql = `INSERT INTO networks(name, adress, phone_number, homepage_url)` + 
                    `VALUES('${name}', '${adress}', '${phoneNumber}', '${url}')`;
        const [result, fields] = await connection.query(sql);

        if (result.affectedRows > 0) {
            await connection.commit();
            console.log('network write success');

            return res.json(result.insertId);
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        await connection.rollback();
        console.log('network write fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.post('/faq/write', async function (req, res, next) {
    const { 
            question,
            answer,
            order,
        } = req.body

    const connection = await pool.getConnection(async conn => conn);

    try {
        await connection.beginTransaction();

        const sql = `INSERT INTO faqs(question, answer, show_order) VALUES('${question}', '${answer}', '${order}')`;
        const [result, fields] = await connection.query(sql);

        if (result.affectedRows > 0) {
            await connection.commit();
            console.log('faqs write success');

            return res.json(result.insertId);
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        await connection.rollback();
        console.log('faqs write fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.post('/:board/write', upload.any(), async function (req, res, next) {
    const { board } = req.params;
    const { 
            title,
            contentValue,
            writer,
        } = req.body;

    const content = contentValue;

    
    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return next();
    } else {}

    
    const connection = await pool.getConnection(async conn => conn);

    try {
        // await connection.beginTransaction();

        const sql = `INSERT INTO boards(category, title, writer, content)`
                    + `VALUES('${board}', '${title}', '${writer}', '${content}')`;
        const [result, fields] = await connection.query(sql);

        if (result.affectedRows > 0) {

            const boardId = result.insertId;

            if (req.files.length != 0) {
                async.mapSeries(req.files, async (file, callback) => {
                    const temp = file.originalname.split('.');
            
                    fileType = temp[1].toLowerCase();
                    fileName = temp[0] + '_' + Date.now();
            
                    let filePath = path.join(__dirname, '../public/uploads/board/' + fileName + '.' + fileType);
            
                    // console.log(filePath);
            
                    var buffer = Buffer.from(file.buffer, 'base64');
            
                    fs.writeFileSync(filePath, buffer, function(err){
                        if(err){
                            console.log('upload 에러발생 :', err);
                            
                            // return res.json(0);
                        } else {
                            console.log('완료');
                        }
                    });
    
                    const sql = `INSERT INTO files(board_id, file_originname, file_url, file_size, file_type)`
                                + ` VALUES('${boardId}', '${file.originalname}', '${fileName}', ${file.size}, '${fileType}')`;
                    const [result, fields] = await connection.query(sql);

                    return result;
                }
                , async (err, results) => {
                    if (err) {
                        console.log('boards write fail');
                        console.log(err);
                        // await connection.rollback();
        
                        return res.json(0);
                    }
                    else {
                        console.log('boards write success');
                        // await connection.commit();

                        return res.json(1);
                    }
                });
            }
            else {
                console.log('boards write success not file');
                // await connection.commit();

                return res.json(1);
            }
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        console.log(`${board} write fail`);
        console.log('catch error : ' + err);
        // await connection.rollback();

        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.post('/checkPwdAction', async function (req, res, next) {
    const { pwd } = req.body

    try {
        // db를 통해 관리자 계정 체크

        const userId = req.cookies.logined;

        const sql = `SELECT * FROM users WHERE id = '${userId}'`;
        const [result, fields] = await pool.query(sql);

        if (result.length !== 0) {
            let dbPW = result[0].pwd;
            let salt = result[0].salt;

            let isChangealbe = await bcrypt.compare(pwd + salt, dbPW);

            if (isChangealbe) {
                res.cookie('checked', `checked${userId}`);
                req.session[`checked${userId}`] = true

                res.json(1);
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
    }
});


router.post('/upload/mou', upload.single('image'), (req, res) => {
    try {
        console.log('router')
        res.json({ url: `/${req.file.filename}`});
    } catch (err) {
        console.log(err);
        res.json(0);
    }
});

router.post('/uploads', upload.array('many'), (req, res) => {
    try {
        let urlArr = new Array();
        let nameArr = new Array();
        let sizeArr = new Array();

        for (let i = 0; i < req.files.length; i++) {
            urlArr.push(`/${req.files[i].filename}`);
            nameArr.push(`${req.files[i].originalname}`);
            sizeArr.push(`${req.files[i].size}`);
        }

        let jsonUrl = JSON.stringify(urlArr);
        let jsonName = JSON.stringify(nameArr);
        let jsonSize = JSON.stringify(sizeArr);

        res.json([jsonUrl, jsonName, jsonSize]);

    } catch (err) {
        console.log(err);
        res.json(0);
    }
});

// ckeditor 이미지 미리보기
router.post('/upload', upload.any(), (req, res) => {
    try {
        // console.log(reader.readAsDataURL(event.target.files[0]);)
        console.log('router')
        console.log(req.files[0])
        const encoded = `data:${req.files[0].mimetype};base64,` + req.files[0].buffer.toString('base64')
        res.json({ 'url': encoded});
    } catch (err) {
        console.log(err);
        res.json(0);
    }
});


/* ---------- PUT ---------- */

router.put('/changeUserAction', async function (req, res, next) {
    const { 
            id,
            pwd,
            confirmPwd,
    } = req.body

    if (typeof(id) == 'undefined' || typeof(pwd) == 'undefined' || typeof(confirmPwd) == 'undefined'
        || typeof(req.cookies.logined) == 'undefined' || pwd != confirmPwd) {
        return res.json(0);
    } else {}

    const connection = await pool.getConnection(async conn => conn);

    try {
        await connection.beginTransaction();

        const userId = req.cookies.logined;
        const salt = Math.round((new Date().valueOf() * Math.random())) + "";
        const hashPassword = await bcrypt.hash(pwd + salt, 12);

        const sql = `UPDATE users SET id='${id}', pwd='${hashPassword}', salt='${salt}' WHERE id='${userId}'`;
        const [result, fields] = await connection.query(sql);

        if (result.affectedRows > 0) {
            await connection.commit();
            console.log('user change success');

            req.session.destroy(function(err){})

            res.cookie('logined', '', { maxAge: 0 });
            res.cookie('checked', '', { maxAge: 0 });

            return res.json(1);
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        await connection.rollback();
        console.log('user change fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.put('/program/update', async function (req, res, next) {
    const {
            id,  
            category,
            name,
            date,
            content,
    } = req.body;

    switch (category) {
        case '심리특강':
            service = '심리·상담';
            break;
        case '지지집단':
            service = '심리·상담';
            break;
        case '집단힐링 프로그램':
            service = '심리·상담';
            break;
        case '기초 심리교육':
            service = '심리교육';
            break;
        case '심층 심리교육':
            service = '심리교육';
            break;
        case '상담사 교육':
            service = '심리교육';
            break;
        case '돌봄 및 감정노동 종사자 심리지원':
            service = '취약계층지원사업';
            break;
        default:
            console.log('프로그램 추가 - 잘못된 프로그램명 접근 : ' + category);
            return res.json(0);
    }

    const connection = await pool.getConnection(async conn => conn);

    try {
        await connection.beginTransaction();

        const sql = `UPDATE programs SET service='${service}', category='${category}', name='${name}', day='${date}', content='${content}' WHERE id=${id}`;

        console.log(sql)
        const [result, fields] = await connection.query(sql);

        if (result.affectedRows > 0) {
            await connection.commit();
            console.log('program update success');

            return res.json(1);
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        await connection.rollback();
        console.log('program update fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.put('/gallery/update', upload.any(), async function (req, res, next) {
    const {
            id,
            name,
            content,
    } = req.body;

    const connection = await pool.getConnection(async conn => conn);

    try {
        
        await connection.beginTransaction();

        const sql = `UPDATE gallery SET title='${name}', content='${content}' WHERE id=${id}`;

        console.log(sql)
        const [result, fields] = await connection.query(sql);

        if (result.affectedRows > 0) {

            const galleryId = id;

            // 수정할 때 이미지를 변경했다면 if문 실행
            if (req.files.length != 0) {
                // 삭제할 image row 얻기
                const deleteSql = `SELECT * FROM images WHERE gallery_id='${id}'`;

                console.log('deleteSql : ' + deleteSql)
                const [deleteResult, fields] = await connection.query(deleteSql);

                console.log('delete.length : ' + deleteResult.length);

                // 전에 사용하던 이미지가 있는지 확인한다.
                // 파일이 없는데 삭제하려고 하면 서버가 죽어서 확인 필수.
                if (deleteResult.length != 0) {
                    async.mapSeries(deleteResult, async (data, callback) => {

                        // 이미지 파일 삭제
                        if (typeof(data) !== 'undefined' && typeof(data.img_url) !== 'undefined') {
                            const deleteFileUrl = path.join(__dirname, `../public/images/gallery/${data.img_url}.${data.img_type}`);
        
                            fs.unlink(deleteFileUrl, (err) => {
                                console.log(err);
                            });
                        } else {}
    
                        return result;
                    }
                    , async (err, results) => {
                        if (err) {
                            console.log('gallery delete fail');
                            console.log(err);
                            await connection.rollback();
                            
                            return res.json(0);
                        }
                        else {
                            // 이미지 db에서 전체 삭제
                            const imgSql = `DELETE FROM images WHERE gallery_id=${galleryId}`;
                            const [imgResult, imgFields] = await connection.query(imgSql);

                            if (imgResult.affectedRows <= 0) {
                                throw new Error('이미지 db 삭제 실패');
                            } else {}

                            // 삭제 성공
                            if (results.length != 0 && results[0].affectedRows > 0) {
                                console.log('gallery delete success');


                                async.mapSeries(req.files, async (file, callback) => {
                                    const temp = file.originalname.split('.');
                            
                                    fileType = temp[1].toLowerCase();
                                    fileName = temp[0] + '_' + Date.now();
                            
                                    let filePath = path.join(__dirname, '../public/images/gallery/' + fileName + '.' + fileType);
                            
                                    // console.log(filePath);
                            
                                    var buffer = Buffer.from(file.buffer, 'base64');
                            
                                    fs.writeFileSync(filePath, buffer, function(err){
                                        if(err){
                                            console.log('upload 에러발생 :', err);
                                            
                                            // return res.json(0);
                                        } else {
                                            console.log('완료');
                                        }
                                    });
                    
                                    const sql = `INSERT INTO images(gallery_id, img_originname, img_url, img_size, img_type)`
                                                + ` VALUES('${galleryId}', '${file.originalname}', '${fileName}', ${file.size}, '${fileType}')`;
                                    const [result, fields] = await connection.query(sql);
                
                                    return result;
                                }
                                , async (err, results) => {
                                    if (err) {
                                        console.log('gallery image update fail');
                                        console.log(err);
                                        await connection.rollback();
                        
                                        return res.json(0);
                                    }
                                    else {
                                        console.log('gallery image update success');
                                        await connection.commit();
                
                                        return res.json(1);
                                    }
                                });

                            }
                            // 삭제 실패
                            else {
                                await connection.rollback();
                                console.log('gallery delete fail');

                                return res.json(0);
                            }
                        }
                    });
                } else {}
            } else {
                await connection.commit();
                console.log('no upload gallery update success');
    
                return res.json(1);
            }

        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        await connection.rollback();
        console.log('gallery update fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.put('/network/update', async function (req, res, next) {
    const { 
            id,
            name,
            adress,
            phoneNumber,
            url,
    } = req.body;

    const connection = await pool.getConnection(async conn => conn);

    try {
        await connection.beginTransaction();

        const sql = `UPDATE networks SET name='${name}', adress='${adress}', phone_number='${phoneNumber}', homepage_url='${url}' WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);

        if (result.affectedRows > 0) {
            await connection.commit();
            console.log('network update success');

            return res.json(1);
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        await connection.rollback();
        console.log('network update fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});



router.put('/mou/update', upload.single('image'), async function (req, res, next) {
    const {
            id,
            name,
            mou_content,
            url,
    } = req.body;

    const connection = await pool.getConnection(async conn => conn);

    try {
        await connection.beginTransaction();

        let imgQuery = '';
        let imgName = '';
        let imgType = '';

        // 수정할 때 이미지를 변경했다면 if문 실행
        if (typeof(req.file) != 'undefined') {

            const sql = `SELECT * FROM mous WHERE id=${id}`;
            const [result, fields] = await connection.query(sql);

            const img = result[0].img_name;

            // 전에 사용하던 이미지가 있는지 확인한다.
            // 파일이 없는데 삭제하려고 하면 서버가 죽어서 확인 필수.
            if (typeof(img) != 'undefined' && img != '' && img != null && img != 'null') {
                const deleteFileUrl = path.join(__dirname, `../public/images/mou/${result[0].img_name}.${result[0].img_type}`);

                fs.unlink(deleteFileUrl, (err) => {
                    console.log(err);
                });
            } else {}

            const temp = req.file.originalname.split('.');

            imgType = temp[1].toLowerCase();
            imgName = temp[0] + '_' + Date.now();

            let filePath = path.join(__dirname, '../public/images/mou/' + imgName + '.' + imgType);
 
            // console.log(filePath);

            var buffer = Buffer.from(req.file.buffer, 'base64');

            fs.writeFileSync(filePath, buffer, function(err){
                if(err){
                    console.log('upload 에러발생 :', err);
                    
                    return res.json(0);
                } else {
                    console.log('완료');
                }
            });

            imgQuery = `, img_name='${imgName}', img_type='${imgType}'`;
        }
        else {
            console.log('no upload');
        }

        const sql = `UPDATE mous SET name='${name}', content='${mou_content}', url='${url}' ${imgQuery} WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);


        if (result.affectedRows > 0) {
            await connection.commit();
            console.log('mou update success');

            return res.json(1);
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        await connection.rollback();
        console.log('mou update fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});



router.put('/faq/update', async function (req, res, next) {
    const { 
            id,
            question,
            answer,
            order,
    } = req.body;

    const connection = await pool.getConnection(async conn => conn);

    try {
        await connection.beginTransaction();

        const sql = `UPDATE faqs SET question='${question}', answer='${answer}', show_order='${order}' WHERE id='${id}'`;
        console.log(sql);

        const [result, fields] = await connection.query(sql);

        if (result.affectedRows > 0) {
            await connection.commit();
            console.log('faqs update success');

            return res.json(1);
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        await connection.rollback();
        console.log('faqs update fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.put('/:board/update', upload.any(), async function (req, res, next) {
    const { board } = req.params;
    const { 
            id,
            title,
            contentValue,
            writer,
        } = req.body;

    const content = contentValue;

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return next();
    } else {}


    const connection = await pool.getConnection(async conn => conn);

    try {
   
        // 내용 수정
        await connection.beginTransaction();

        const sql = `UPDATE boards SET title='${title}', content='${content}', writer='${writer}' WHERE id=${id}`;
        const [result, fields] = await connection.query(sql);

        // 내용 수정 끝

        if (result.affectedRows > 0) {

            const boardId = id;

            // 파일 업로드
            console.log(req.files)
            if (req.files.length != 0) {
                const deleteSql = `SELECT * FROM files WHERE board_id='${id}'`;

                console.log('deleteSql : ' + deleteSql)
                const [deleteResult, fields] = await connection.query(deleteSql);
                // 원래 있던 파일 삭제

                if (deleteResult.length != 0) {
                    async.mapSeries(deleteResult, async (data, callback) => {

                        if (typeof(data) !== 'undefined' && typeof(data.img_url) !== 'undefined') {
                            const deleteFileUrl = path.join(__dirname, `../public/images/gallery/${data.img_url}.${data.img_type}`);
                            fs.unlink(`public/uploads/board/${data.file_url}.${data.file_type}`, (err) => {
                                console.log(err);
                            });
                        } else {}
    
                        return result;
                    }
                    , async (err, results) => {
                        if (err) {
                            console.log('file delete fail');
                            console.log(err);
                            await connection.rollback();
                            
                            return res.json(0);
                        }
                        else {
                            const fileSql = `DELETE FROM files WHERE board_id=${boardId}`;
                            const [fileResult, imgFields] = await connection.query(imgSql);

                            if (fileResult.affectedRows <= 0) {
                                throw new Error('이미지 db 삭제 실패');
                            } else {}

                            // 삭제 성공
                            if (results.length != 0 && results[0].affectedRows > 0) {
                                console.log('file delete success');
                            }
                            // 삭제 실패
                            else {
                                await connection.rollback();
                                console.log('file delete fail');

                                return res.json(0);
                            }
                        }
                    });
                } else {}
               

                // 파일 삭제 완료

                // 파일 업로드

                async.mapSeries(req.files, async (file, callback) => {
                    const temp = file.originalname.split('.');
            
                    fileType = temp[1].toLowerCase();
                    fileName = temp[0] + '_' + Date.now();
            
                    let filePath = path.join(__dirname, '../public/uploads/board/' + fileName + '.' + fileType);
            
                    // console.log(filePath);
            
                    var buffer = Buffer.from(file.buffer, 'base64');
            
                    fs.writeFileSync(filePath, buffer, function(err){
                        if(err){
                            console.log('upload 에러발생 :', err);
                            
                            // return res.json(0);
                        } else {
                            console.log('완료');
                        }
                    });
    
                    const sql = `INSERT INTO files(board_id, file_originname, file_url, file_size, file_type)`
                                + ` VALUES('${boardId}', '${file.originalname}', '${fileName}', ${file.size}, '${fileType}')`;
                    const [result, fields] = await connection.query(sql);

                    return result;
                }
                , async (err, results) => {
                    if (err) {
                        console.log('boards write fail');
                        console.log(err);
                        await connection.rollback();
        
                        return res.json(0);
                    }
                    else {
                        console.log('boards write success');
                        await connection.commit();

                        return res.json(1);
                    }
                });
            }
            else {
                await connection.commit();
                console.log('boards write success');

                return res.json(1);
            }
        }
        else {
            throw new Error('에러');
        }
    
    } catch (err) {
        await connection.rollback();
        console.log(`${board} update fail`);
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});






/* ---------- DELETE ---------- */


router.delete('/mou/delete', async function (req, res, next) {
    let deleteList = req.body["mouDeleteList[]"];

    if (typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

    const connection = await pool.getConnection(async conn => conn);

    try {        
        await connection.beginTransaction();

        let deleteImgList = []

        async.mapSeries(deleteList, async (id, callback) => {
            const deleteSql = `SELECT * FROM mous WHERE id=${id}`;
            const [deleteResult, deleteFields] = await connection.query(deleteSql);

            const imgName = deleteResult[0].img_name;

            if (typeof(imgName) != 'undefined' && imgName != '' && imgName != null && imgName != 'null') {
                fs.unlink(`public/images/mou/${imgName}.${deleteResult[0].img_type}`, (err) => {
                    console.log(err);
                });
            } else {}

            const sql = `DELETE FROM mous WHERE id=${id}`;
            const [result, fields] = await connection.query(sql);

            return result;
        }
        , async (err, results) => {
            if (err) {
                await connection.rollback();
                console.log('mou delete fail');
                console.log(err);

                return res.json(0);
            }
            else {
                // 삭제 성공
                if (results.length != 0 && results[0].affectedRows > 0) {
                    await connection.commit();
                    console.log('mou delete success');

                    return res.json(1);
                }
                // 삭제 실패
                else {
                    await connection.rollback();
                    console.log('mou delete fail');

                    return res.json(0);
                }
            }
        });

    } catch (err) {
        await connection.rollback();
        console.log('mou delete fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});


router.delete('/network/delete', async function (req, res, next) {
    let deleteList = req.body["networkDeleteList[]"];

    const connection = await pool.getConnection(async conn => conn);

    try {        
        await connection.beginTransaction();

        async.mapSeries(deleteList, async (id, callback) => {
            const sql = `DELETE FROM networks WHERE id=${id}`;
            const [result, fields] = await connection.query(sql);

            return result;
        }
        , async (err, results) => {
            if (err) {
                await connection.rollback();
                console.log('networks delete fail');
                console.log(err);

                return res.json(0);
            }
            else {
                // 삭제 성공
                if (results.length != 0 && results[0].affectedRows > 0) {
                    await connection.commit();
                    console.log('networks delete success');

                    return res.json(1);
                }
                // 삭제 실패
                else {
                    await connection.rollback();
                    console.log('networks delete fail');

                    return res.json(0);
                }
            }
        });

    } catch (err) {
        await connection.rollback();
        console.log('networks delete fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.delete('/gallery/delete', async function (req, res, next) {
    let deleteList = req.body["galleryDeleteList[]"];

    if (typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

    const connection = await pool.getConnection(async conn => conn);

    try {        
        await connection.beginTransaction();

        let deleteImgList = []

        if (deleteList.length != 0) {
            async.mapSeries(deleteList, async (id, callback) => {
                const deleteSql = `SELECT * FROM images WHERE gallery_id=${id}`;
                const [deleteResult, deleteFields] = await connection.query(deleteSql);

                if (deleteResult.length != 0) {
                    deleteResult.forEach((data) => {
                        fs.unlink(`public/images/gallery/${data.img_url}.${data.img_type}`, (err) => {
                            console.log(err);
                        });
                    });
    
                } else {}

                const sql = `DELETE FROM images WHERE gallery_id=${id}`;

                console.log(sql)
                const [result, fields] = await connection.query(sql);

                console.log(result)
    
                return result;
            }
            , async (err, results) => {
                if (err) {
                    await connection.rollback();
                    console.log('gallery delete fail');
                    console.log(err);
    
                    return res.json(0);
                }
                else {
                    // 삭제 성공
                    if (results.length != 0) {
                        console.log('gallery file delete success');

                        async.mapSeries(deleteList, async (id, callback) => {
                            const sql = `DELETE FROM gallery WHERE id=${id}`;
                            const [result, fields] = await connection.query(sql);
                            return result;
                        }
                        , async (err, results) => {
                            if (err) {
                                await connection.rollback();
                                console.log('gallery delete fail');
                                console.log(err);
                
                                return res.json(0);
                            }
                            else {
                                // 삭제 성공
                                if (results.length != 0 && results[0].affectedRows > 0) {
                                    await connection.commit();
                                    console.log('gallery delete success');
                
                                    return res.json(1);
                                }
                                // 삭제 실패
                                else {
                                    await connection.rollback();
                                    console.log('gallery delete fail');
                
                                    return res.json(0);
                                }
                            }
                        });
                    }
                    // 삭제 실패
                    else {
                        await connection.rollback();
                        console.log('gallery file delete fail');

                        return res.json(0);
                    }
                }
            });
        } else {}

    } catch (err) {
        await connection.rollback();
        console.log('gallery delete fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.delete('/faq/delete', async function (req, res, next) {
    let deleteList = req.body["deleteList[]"];

    if (typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

    const connection = await pool.getConnection(async conn => conn);

    try {        
        await connection.beginTransaction();

        async.mapSeries(deleteList, async (id, callback) => {
            const sql = `DELETE FROM faqs WHERE id=${id}`;
            const [result, fields] = await connection.query(sql);

            return result;
        }
        , async (err, results) => {
            if (err) {
                await connection.rollback();
                console.log('faqs delete fail');
                console.log(err);

                return res.json(0);
            }
            else {
                // 삭제 성공
                if (results.length != 0 && results[0].affectedRows > 0) {
                    await connection.commit();
                    console.log('faqs delete success');

                    return res.json(1);
                }
                // 삭제 실패
                else {
                    await connection.rollback();
                    console.log('faqs delete fail');

                    return res.json(0);
                }
            }
        });
    
    } catch (err) {
        await connection.rollback();
        console.log('faqs delete fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});

router.delete('/:board/delete', async function (req, res, next) {
    const { board } = req.params;

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return next();
    } else {}

    let deleteList = req.body["boardDeleteList[]"];

    if (typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

    const connection = await pool.getConnection(async conn => conn);

    try {        
        // await connection.beginTransaction();

        console.log(deleteList)
        if (deleteList.length != 0) {
            async.mapSeries(deleteList, async (id, callback) => {
                const deleteSql = `SELECT * FROM files WHERE board_id='${id}'`;
                const [deleteResult, deleteFields] = await connection.query(deleteSql);

                if (deleteResult.length != 0) {
                    deleteResult.forEach((data) => {
                        fs.unlink(`public/uploads/board/${data.file_url}.${data.file_type}`, (err) => {
                            console.log(err);
                        });
                    });

                } else {}

                const fileSql = `DELETE FROM files WHERE board_id=${id}`;
                const [result, fields] = await connection.query(fileSql);

                return result;
            }
            , async (err, results) => {
                if (err) {
                    await connection.rollback();
                    console.log('boards file delete fail');
                    console.log(err);

                    return res.json(0);
                }
                else {
                    // 삭제 성공
                    if (results.length != 0) {
                        console.log('boards file delete success');

                        async.mapSeries(deleteList, async (id, callback) => {
                            const sql = `DELETE FROM boards WHERE id=${id}`;
                            const [result, fields] = await connection.query(sql);
                            return result;
                        }
                        , async (err, results) => {
                            if (err) {
                                // await connection.rollback();
                                console.log('boards delete fail');
                                console.log(err);
                
                                return res.json(0);
                            }
                            else {
                                // 삭제 성공
                                if (results.length != 0 && results[0].affectedRows > 0) {
                                    // await connection.commit();
                                    console.log('boards delete success');
                
                                    return res.json(1);
                                }
                                // 삭제 실패
                                else {
                                    // await connection.rollback();
                                    console.log('boards delete fail');
                
                                    return res.json(0);
                                }
                            }
                        });
                    }
                    // 삭제 실패
                    else {
                        // await connection.rollback();
                        console.log('boards file delete fail');

                        return res.json(0);
                    }
                }
            });
        } else {}
    } catch (err) {
        // await connection.rollback();
        console.log('boards delete fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        connection.release();
    }
});

module.exports = router;