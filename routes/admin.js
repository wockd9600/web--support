const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const moment = require('moment');

const mysql = require('mysql');


const multer = require('multer');
const fs = require('fs');
const path = require('path');

const async = require("async");

const pool = require('../models/index');

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
    fieldNameSize: 30000,
    limits: { fieldSize: 10 * 1024 * 1024 },

    storage : null

    // storage: multer.memoryStorage()
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

const sqlReplaceAll = content => content.replace(/\&/g, '\\&').replace(/\</g, '\\<').replace(/\>/g, '\\>').replace(/\"/g, '\\\"').replace(/\'/g, '\\\'').replace(/\//g, '\\/');


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
    banner: { title: '협력사', url: '/admin/banner' },
    network: { title: '지역사회 네트워크', url: '/admin/network' },
    board: { title: '게시판 관리', url: '' },
    'research': { title: '연구보고', url: '/admin/research' },
    'notice': { title: '공지사항', url: '/admin/notice' },
    'news': { title: '센터소식', url: '/admin/news' },
    'reference': { title: '자료실', url: '/admin/reference' },
    'review': { title: '센터이용후기', url: '/admin/review' },
    gallery: { title: '갤러리', url: '/admin/gallery' },
    advertGallery: { title: '홍보 갤러리', url: '/admin/advertGallery' },
    faq: { title: 'FAQ 관리', url: '/admin/faq' },
}



/* ---------- GET ---------- */

// router.get('/test', verifyToken, function (req, res, next) {
//     res.json(req.decoded);
// });


router.use(function (req, res, next) {
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
});

router.get('/main', function (req, res, next) {
    res.render('admin/main', {
        title,
        navbar: true,
        fpaths: { title: '' },
    });
});

router.get('/main/counsel', async function (req, res, next) {
     
    
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

        console.log((sql))
        const [result, fields] = await pool.query((sql));

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
    
    }
});

router.get('/main/program', async function (req, res, next) {
     
    
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

        console.log((sql));
        const [result, fields] = await pool.query((sql));

        Object.values(result).forEach(data => {
            if (data.name.length > 5) {
                data.name = data.name[0] + data.name[1] + data.name[2] + data.name[3] + data.name[4] + '...'
            } else {}
            
            const temp = data.day.split('-')
            data.name = data.name + `(${temp[1]}.${temp[2]})`;
        });

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    }
});

router.get('/main/review', async function (req, res, next) {
     
    
    try {
        const sql = 'SELECT *'
                    + ' FROM boards'
                    + ' WHERE category=\'review\''
                    + ' ORDER BY reg_date DESC'
                    + ' LIMIT 4';

        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
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
         

        try {
            const userId = req.cookies.logined;

            const sql = `SELECT * FROM users WHERE id = '${userId}'`;
            const [result, fields] = await pool.query((sql));

            res.render('admin/user-change', {
                title,
                fpaths: paths.changeUser,
                userId: result[0].id
            });

        } catch (err) {
            console.log(err);
            return res.render('admin/sign-in', { layout: 'layouts/blank', notLogined: true});

        } finally {
            
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

     

    try {
        const sql = `SELECT * FROM counsels WHERE id = ${id}`;
        const [result, fields] = await pool.query((sql));

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
    
    }
});


// router.post('/appCounsel/write', async function (req, res, next) {
//     const { id } = req.query;

//      

//     try {
//         const sql = `INSERT INTO programs(category, name, day, content)` + 
//         `VALUES('${category}', '${name}', '${date}', '${sqlReplaceAll(content)}')`;

//         const [result, fields] = await pool.query((sql));

//         if (result.affectedRows > 0) {
//             
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
//         
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
     

    const genderDetail = gender == '그 외' ? `!='남' AND gender != '여'` : `='${gender}'`;

    const categoryQuery = category ? `category = '${category}' AND` : '';
    const nameQuery = name ? `name LIKE '%${name}%' AND` : '';
    const genderQuery = gender ? `gender ${genderDetail} AND` : '';

    let ageQuery = '';
    if (age.includes('~')) {
        const [l, r] = age.split('~');    
        ageQuery = `age BETWEEN '${l}' AND '${r}' AND`;
    } else {
        ageQuery = age ? `age = '${age}' AND` : '';
    }

    const doneQuery = done ? `is_done = ${done}` : 'is_done != -1';
    const dateQuery = startdate&&enddate ? `(reg_date BETWEEN STR_TO_DATE("${startdate}", '%Y%m%d') AND DATE_ADD(STR_TO_DATE("${enddate}", '%Y%m%d'), INTERVAL 1 DAY)) AND` : '';

    try {
        const sql = `SELECT * FROM counsels WHERE ${categoryQuery} ${nameQuery} ${genderQuery} ${ageQuery} ${dateQuery} ${doneQuery} ORDER BY id DESC`;

        console.log((sql));
        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
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
        
         
    
        const genderDetail = gender == '그 외' ? `!='남' AND gender != '여'` : `='${gender}'`;
    
        const categoryQuery = category ? `category = '${category}' AND` : '';
        const nameQuery = name ? `name LIKE '%${name}%' AND` : '';
        const genderQuery = gender ? `gender ${genderDetail} AND` : '';

        let ageQuery = '';
        if (age.includes('~')) {
            const [l, r] = age.split('~');    
            ageQuery = `age BETWEEN '${l}' AND '${r}' AND`;
        } else {
            ageQuery = age ? `age = '${age}' AND` : '';
        }
        
        const doneQuery = done ? `is_done = ${done}` : 'is_done != -1';
        const dateQuery = startdate&&enddate ? `(reg_date BETWEEN STR_TO_DATE("${startdate}", '%Y%m%d') AND DATE_ADD(STR_TO_DATE("${enddate}", '%Y%m%d'), INTERVAL 1 DAY)) AND` : '';
    
        
        const sql = `SELECT * FROM counsels WHERE ${categoryQuery} ${nameQuery} ${genderQuery} ${ageQuery} ${dateQuery} ${doneQuery}`;
        const [result, fields] = await pool.query((sql));

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

    try {
        const sql = `SELECT pa.*, p.name AS program_name, p.category, p.id AS program_id FROM (SELECT * FROM programapps WHERE id = ${id}) AS pa JOIN programs AS p ON pa.program_id = p.id`;

        console.log((sql));
        const [result, fields] = await pool.query((sql));

        const tpaths = getPath('상세내역', paths.applyCounsel.url + '/appForm');

        result
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

     

    const genderDetail = gender == '그 외' ? `!='남' AND gender != '여'` : `='${gender}'`;

    const categoryQuery = category ? `WHERE p.category = '${category}'` : '';
    const nameQuery = name ? `name LIKE '%${name}%' AND` : '';
    const genderQuery = gender ? `gender ${genderDetail} AND` : '';
    
    let ageQuery = '';
    if (age.includes('~')) {
        const [l, r] = age.split('~');    
        ageQuery = `age BETWEEN '${l}' AND '${r}' AND`;
    } else {
        ageQuery = age ? `age = '${age}' AND` : '';
    }
    
    const doneQuery = done ? `is_done = ${done}` : 'is_done != -1';
    const dateQuery = startdate&&enddate ? `(reg_date BETWEEN STR_TO_DATE("${startdate}", '%Y%m%d') AND DATE_ADD(STR_TO_DATE("${enddate}", '%Y%m%d'), INTERVAL 1 DAY)) AND` : '';

    try {
        const sql = `SELECT pa.*, p.name AS program_name FROM (SELECT * FROM programapps`
                    + ` WHERE ${nameQuery} ${genderQuery} ${ageQuery} ${dateQuery} ${doneQuery}) AS pa JOIN programs AS p ON pa.program_id = p.id ${categoryQuery} ORDER BY pa.id DESC`;
        
        console.log((sql));
        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
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

     

    const genderDetail = gender == '그 외' ? `!='남' AND gender != '여'` : `='${gender}'`;

    const categoryQuery = category ? `WHERE p.category = '${category}'` : '';
    const nameQuery = name ? `name LIKE '%${name}%' AND` : '';
    const genderQuery = gender ? `gender ${genderDetail} AND` : '';
    
    let ageQuery = '';
    if (age.includes('~')) {
        const [l, r] = age.split('~');    
        ageQuery = `age BETWEEN '${l}' AND '${r}' AND`;
    } else {
        ageQuery = age ? `age = '${age}' AND` : '';
    }

    const doneQuery = done ? `is_done = ${done}` : 'is_done != -1';
    const dateQuery = startdate&&enddate ? `(reg_date BETWEEN STR_TO_DATE("${startdate}", '%Y%m%d') AND DATE_ADD(STR_TO_DATE("${enddate}", '%Y%m%d'), INTERVAL 1 DAY)) AND` : '';

    try {
        // @breif xlsx 모듈추출
        const xlsx = require("xlsx");

        // @breif 가상의 엑셀파일을 생성한다.
        const book = xlsx.utils.book_new();

        // --------------------------------------------------------------------
    
        const sql = `SELECT pa.*, p.name AS program_name FROM (SELECT * FROM programapps`
                    + ` WHERE ${nameQuery} ${genderQuery} ${ageQuery} ${dateQuery} ${doneQuery}) AS pa JOIN programs AS p ON pa.program_id = p.id ${categoryQuery}`;

        console.log((sql))
        const [result, fields] = await pool.query((sql));

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
    }
    
});


router.get('/program', function (req, res, next) {
    res.render('admin/program', {
        title,
        fpaths: paths.program,
    });
});


router.get('/program/data', async function (req, res, next) {

     

    try {
        const sql = 'SELECT p.*, COUNT(pa.id) as app'
                    + ' FROM ('
                    +           ' SELECT *'
                    +           ' FROM programs'
                    +           ' ORDER BY id DESC'
                    +       ') p'
                    + ' LEFT JOIN programapps as pa'
                    + ' ON p.id = pa.program_id'
                    + ' GROUP BY p.name, p.day'
                    + ' ORDER BY p.id DESC';

        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
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

     

    try {
        const sql = `SELECT * FROM programs WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

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

    }
});

router.get('/program/copy', async function (req, res, next) {
    const { id } = req.query;

     

    try {
        const sql = `SELECT * FROM programs WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

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

     

    try {
        const sql = `SELECT * FROM mous order by id desc`;
        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
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

     

    try {
        const sql = `SELECT * FROM mous WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

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

    }
});


router.get('/banner', function (req, res, next) {
    const fpaths = getPath(paths.cooperation.title, paths.cooperation.url);
    const spaths = getPath(paths.banner.title, paths.banner.url);

    res.render('admin/banner', {
        title,
        fpaths,
        spaths,
    });
});

router.get('/banner/data', async function (req, res, next) {

     

    try {
        const sql = `SELECT * FROM banners order by id desc`;
        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    }
});


router.get('/banner/write', function (req, res, next) {

    const fpaths = getPath(paths.cooperation.title, paths.cooperation.url);
    const spaths = getPath(paths.banner.title + ' 추가', paths.banner.url + '/write');

    res.render('admin/banner-form', {
        title,
        fpaths,
        spaths,
    });
});


router.get('/banner/update', async function (req, res, next) {
    const { id } = req.query;

     

    try {
        const sql = `SELECT * FROM banners WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

        const fpaths = getPath(paths.cooperation.title, paths.cooperation.url);
        const spaths = getPath(paths.banner.title + ' 수정', paths.banner.url + '/update');

        res.render(`admin/banner-form`, { 
            title,
            fpaths,
            spaths,
            result: result[0],
        });
    } catch (err) {
        console.log(err);
        next(err);

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

    try {
        const sql = `SELECT * FROM networks ORDER BY id DESC`;
        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
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

     

    try {
        const sql = `SELECT * FROM networks WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

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

    try {
        const sql = `SELECT *, DATE_FORMAT(reg_date, '%Y-%m-%d') AS reg_date FROM boards WHERE category='${board}' ORDER BY id DESC`;
        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
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

     

    try {
        const sql = `SELECT * FROM boards WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));
        
        const fileSql = `SELECT * FROM files WHERE board_id=${result[0].id}`
        const [fileResult, fileFields] = await pool.query(fileSql);

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

     

    try {
        const sql = `SELECT *`
                    + ` FROM (SELECT * FROM gallery WHERE category='gallery' ORDER BY reg_date DESC) AS b`
                    + ` JOIN (SELECT MIN(id) AS img_id, img_url, img_type, gallery_id FROM images GROUP BY gallery_id) AS i ON b.id=i.gallery_id `
                    + ` ORDER BY b.id DESC`;
        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
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
    
     

    try {
        const sql = `SELECT * FROM gallery WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

        const imgSql = `SELECT * FROM images WHERE gallery_id=${id}`;
        const [imgResult, imgFields] = await pool.query(imgSql);

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
    
    }
});


router.get('/advertGallery', function (req, res, next) {
    res.render(`admin/gallery`, {
        title,
        fpaths: paths.board,
        spaths: paths.advertGallery,
    });
});

router.get('/advertGallery/data', async function (req, res, next) {

    try {
        const sql = `SELECT *`
                    + ` FROM (SELECT * FROM gallery WHERE category='advert' ORDER BY reg_date DESC) AS b`
                    + ` JOIN (SELECT MIN(id) AS img_id, img_url, img_type, gallery_id FROM images GROUP BY gallery_id) AS i ON b.id=i.gallery_id `
                    + ` ORDER BY b.id DESC`;

        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
    }
});


router.get('/advertGallery/write', function (req, res, next) {
    const tpaths = getPath(paths.advertGallery.title + ' 추가', paths.advertGallery.url + '/write');

    res.render(`admin/gallery-form`, {
        title,
        fpaths: paths.board,
        spaths: paths.advertGallery,
        tpaths,
    });
});


router.get('/advertGallery/update', async function (req, res, next) {
    const { id } = req.query;

    try {
        const sql = `SELECT * FROM gallery WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

        const imgSql = `SELECT * FROM images WHERE gallery_id=${id}`;
        const [imgResult, imgFields] = await pool.query(imgSql);

        const tpaths = getPath(paths.advertGallery.title + ' 수정', paths.advertGallery.url + '/update');

        res.render(`admin/gallery-form`, { 
            title,
            fpaths: paths.board,
            spaths: paths.advertGallery,
            tpaths,
            result: result[0],
            imgResult,
        });

    } catch (err) {
        console.log(err);
        return res.json(0);
    
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

     

    try {
        const sql = `SELECT * FROM faqs`;
        const [result, fields] = await pool.query((sql));

        return res.json(result);
    
    } catch (err) {
        console.log(err);
        return res.json(0);
    
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

     

    try {
        const sql = `SELECT * FROM faqs WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

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
    
    }
});




/* ---------- POST ---------- */

router.post('/program/write', async function (req, res, next) {
    const { 
            category,
            name,
            date,
            end_date,
            content,
        } = req.body

    let service = '';

    switch (category) {
        case '심리특강':
            service = '심리·상담';
            break;
        case '힐링자조모임':
            service = '심리·상담';
            break;
        case '원데이힐링 프로그램':
            service = '심리·상담';
            break;
        case '기초 심리교육':
            service = '심리교육·문화';
            break;
        case '심층 심리교육':
            service = '심리교육·문화';
            break;
        case '돌봄 및 감정노동 종사자 심리지원':
            service = '취약계층지원사업';
            break;
        case '고립노인 심리지원':
            service = '취약계층지원사업';
            break;
        default:
            console.log('프로그램 추가 - 잘못된 프로그램명 접근 : ' + category);
            return res.json(0);
    }


    try {
        
        // 프로그램 이름, 날짜 중복 체크

        const checkSql = `SELECT * FROM programs WHERE name='${name}' AND (day='${date}' OR end_day='${end_date}')`; 
        const [checkResult, f] = await pool.query(checkSql);

        if (checkResult.length > 0) {
            console.log('duplicate program');
            return res.json(-1);
        } else {}
        

        const sql = `INSERT INTO programs(service, category, name, day, end_day, content)` + 
                    `VALUES('${service}', '${category}', '${name}', '${date}', '${end_date}', '${sqlReplaceAll(content)}')`;
        console.log((sql))
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            
            console.log('program write success');

            return res.json(result.insertId);
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        
        console.log('program write fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.post('/gallery/write', upload.any(), async function (req, res, next) {
    const { 
            name,
            content,
        } = req.body
        
    try {
        const sql = `INSERT INTO gallery(category, title, content)`
                    + `VALUES('gallery', '${name}', '${sqlReplaceAll(content)}')`;
        const [r, f] = await pool.query((sql));


        if (r.affectedRows > 0) {

            if (req.files.length != 0) {
                const galleryId = r.insertId;

                const data = [];

                Array.from(req.files).forEach(file => {
                    const temp = file.originalname.split('.');

                    fileType = temp[1].toLowerCase();
                    fileName = temp[0] + '_' + Date.now();
            
                    // let filePath = 'public/images/gallery/' + fileName + '.' + fileType;
                    let filePath = path.join(__dirname, '../public/images/gallery/' + fileName + '.' + fileType);
                    
                    var buffer = Buffer.from(file.buffer, 'base64');
                    
                    console.log(filePath)

                    fs.writeFile(filePath, buffer, function(err){
                        if(err){
                            console.log('upload 에러발생 :', err);
                            
                            res.json(0);
        
                            return;
                        } else {
                            console.log(filePath + '완료');
                        }
                    });
                            
                    // console.log(fs.readFileSync(filePath))

                    const tempData = {
                        gallery_id : galleryId,
                        img_originname : file.originalname,
                        img_url : fileName,
                        img_size : file.size,
                        img_type : fileType
                    };

                    data.push(tempData);

                    // const sql = `INSERT INTO images(gallery_id, img_originname, img_url, img_size, img_type)`
                    //                     + ` VALUES('${galleryId}', '${file.originalname}', '${fileName}', ${file.size}, '${fileType}');`;
                    
                    // mutipleQuery += sql;
                });

                console.log(data.length)
                
                let sqls = "INSERT INTO images(gallery_id, img_originname, img_url, img_size, img_type) \r\n";
                const sqlForm = "SELECT ?, ?, ?, ?, ? UNION ALL ";
                let params = [];
                
                data.map( d => {
                    params = [d.gallery_id, d.img_originname, d.img_url, d.img_size, d.img_type];
                    sqls += mysql.format(sqlForm, params) + "\r\n";
                });

                sqls = sqls.slice(0, -12);

                console.log("sql : " + sqls);

                const [sqlResult, fields] = await pool.query(sqls);
                
                console.log('complete');
                
                if (sqlResult.affectedRows > 0) {
                    console.log('gallery write success');
                    

                    return res.json(1);
                } else {
                    console.log('gallery db write fail');
                    

                    return res.json(0);
                }

            } else {
                console.log('gallery write success no file');
                

                return res.json(1);
            }
        } else {
            

            return res.json(0);
        }
        
    } catch (err) {
        console.log('catch err : gallery write fail');
        console.log(err);
        

        return res.json(0);
    
    }
});

router.post('/advertGallery/write', upload.any(), async function (req, res, next) {
    const { 
        name,
        content,
    } = req.body
    
    try {
        const advert = typeof(req.body.advert) !== 'undefined' && req.body.advert == 'on' ? 1 : 0;

        const sql = `INSERT INTO gallery(category, title, content, is_advert)`
                    + `VALUES('advert', '${sqlReplaceAll(name)}', '${sqlReplaceAll(content)}', ${advert})`;
        console.log(sql)
        const [r, f] = await pool.query(sql);


        if (r.affectedRows > 0) {

            if (req.files.length != 0) {
                const galleryId = r.insertId;

                const data = [];

                Array.from(req.files).forEach(file => {
                    const temp = file.originalname.split('.');

                    fileType = temp[1].toLowerCase();
                    fileName = temp[0] + '_' + Date.now();
            
                    // let filePath = 'public/images/gallery/' + fileName + '.' + fileType;
                    let filePath = path.join(__dirname, '../public/images/gallery/' + fileName + '.' + fileType);
                    
                    var buffer = Buffer.from(file.buffer, 'base64');
                    
                    console.log(filePath)

                    fs.writeFile(filePath, buffer, function(err){
                        if(err){
                            console.log('upload 에러발생 :', err);
                            
                            res.json(0);
        
                            return;
                        } else {
                            console.log(filePath + '완료');
                        }
                    });
                            
                    // console.log(fs.readFileSync(filePath))

                    const tempData = {
                        gallery_id : galleryId,
                        img_originname : file.originalname,
                        img_url : fileName,
                        img_size : file.size,
                        img_type : fileType
                    };

                    data.push(tempData);

                    // const sql = `INSERT INTO images(gallery_id, img_originname, img_url, img_size, img_type)`
                    //                     + ` VALUES('${galleryId}', '${file.originalname}', '${fileName}', ${file.size}, '${fileType}');`;
                    
                    // mutipleQuery += sql;
                });

                console.log(data.length)
                
                let sqls = "INSERT INTO images(gallery_id, img_originname, img_url, img_size, img_type) \r\n";
                const sqlForm = "SELECT ?, ?, ?, ?, ? UNION ALL ";
                let params = [];
                
                data.map( d => {
                    params = [d.gallery_id, d.img_originname, d.img_url, d.img_size, d.img_type];
                    sqls += mysql.format(sqlForm, params) + "\r\n";
                });

                sqls = sqls.slice(0, -12);

                console.log("sql : " + sqls);

                const [sqlResult, fields] = await pool.query(sqls);
                
                console.log('complete');
                
                if (sqlResult.affectedRows > 0) {
                    console.log('gallery write success');
                    

                    return res.json(1);
                } else {
                    console.log('gallery db write fail');
                    

                    return res.json(0);
                }

            } else {
                console.log('gallery write success no file');
                

                return res.json(1);
            }
        } else {
            

            return res.json(0);
        }
        
    } catch (err) {
        console.log('catch err : gallery write fail');
        console.log(err);
        

        return res.json(0);

    }
});

router.post('/mou/write', upload.single("image"), async function (req, res, next) {
    // console.log("/mou/write/");

    const { 
            name,
            mou_content,
            url,
        } = req.body

        
    try {
        console.log(req.body)

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
        const [result, fields] = await pool.query((sql));
        

        if (result.affectedRows > 0) {
            console.log('mou write success');

            return res.json(1);
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        console.log('mou write fail');
        console.log(err);

        return res.json(0);
    
    } finally {
        pool.release();
    }
});

router.post('/banner/write', upload.any(), async function (req, res, next) {
    // console.log("/mou/write/");

    const { 
            name,
            url,
        } = req.body

        
    try {

        let imgName = '';
        let imgType = '';

        if (typeof(req.files[0]) != 'undefined') {

            const temp = req.files[0].originalname.split('.');

            imgType = temp[1].toLowerCase();
            imgName = temp[0] + '_' + Date.now();

            let filePath = path.join(__dirname, '../public/images/banner/' + imgName + '.' + imgType);
 
            // console.log(filePath);

            var buffer = Buffer.from(req.files[0].buffer, 'base64');

            fs.writeFile(filePath, buffer, function(err){
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
        
        const sql = `INSERT INTO banners(name, url, img_name, img_type)` + 
                    `VALUES('${name}', '${url}', '${imgName}', '${imgType}')`;

        console.log((sql))
        const [result, fields] = await pool.query((sql));
        

        if (result.affectedRows > 0) {
            console.log('banner write success');

            return res.json(1);
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        console.log('banner write fail');
        console.log(err);

        return res.json(0);
    }
});


router.post('/network/write', async function (req, res, next) {
    const { 
            name,
            adress,
            phoneNumber,
            url,
        } = req.body

     

    try {
        

        const sql = `INSERT INTO networks(name, adress, phone_number, homepage_url)` + 
                    `VALUES('${name}', '${adress}', '${phoneNumber}', '${url}')`;
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            
            console.log('network write success');

            return res.json(result.insertId);
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        
        console.log('network write fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.post('/faq/write', async function (req, res, next) {
    const { 
            question,
            answer,
            order,
        } = req.body

     

    try {
        

        const sql = `INSERT INTO faqs(question, answer, show_order) VALUES('${question}', '${answer}', '${order}')`;
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            
            console.log('faqs write success');

            return res.json(result.insertId);
        }
        else {
            throw new Error('에러');
        }
        
    } catch (err) {
        
        console.log('faqs write fail');
        console.log(err);

        return res.json(0);
    
    }
});


router.post('/research/write/test', upload.any(), async function (req, res, next) {
    

        try {

            let sql = '';
            for (let i=0; i<100; i++) {
                sql += `INSERT INTO boards(category, title, writer, content) VALUES('research', 'test${i}', 'writer${i}', 'test${i}'); `;
            }
            const [r, f] = await pool.query((sql));

            return res.json(1);
            
        } catch (err) {
            console.log(`dds write fail`);
            console.log('catch error : ' + err);
            // 

            return res.json(0);
        
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

    console.log('This is CORS-enabled for a single Route');
    console.log('board : ' + board)

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return res.json(0);
    } else {

        try {

            const sql = `INSERT INTO boards(category, title, writer, content)`
                        + `VALUES('${board}', '${sqlReplaceAll(title)}', '${writer}', '${sqlReplaceAll(content)}')`;
            const [r, f] = await pool.query((sql));

            if (r.affectedRows > 0) {

                if (req.files.length != 0) {
                    const boardId = r.insertId;
        
                    const data = [];
        
                    Array.from(req.files).forEach(file => {
                        const temp = file.originalname.split('.');
                    
                        fileType = temp[1].toLowerCase();
                        fileName = temp[0] + '_' + Date.now();
                
                        let filePath = path.join(__dirname, '../public/uploads/board/' + fileName + '.' + fileType);
                
                        console.log(filePath);
                
                        var buffer = Buffer.from(file.buffer, 'base64');
                
                        fs.writeFile(filePath, buffer, function(err){
                            if(err){
                                console.log('upload 에러발생 :', err);
                                
                                res.json(0);
            
                                return;
                            } else {
                                console.log(filePath + '완료');
                            }
                        });
        
                        const tempData = {
                            board_id : boardId,
                            file_originname : file.originalname,
                            file_url : fileName,
                            file_size : file.size,
                            file_type : fileType
                        };

                        data.push(tempData);
                    });

                    console.log("file sql insert");

                    let sqls = "INSERT INTO files(board_id, file_originname, file_url, file_size, file_type) \r\n";
                    const sqlForm = "SELECT ?, ?, ?, ?, ? UNION ALL ";
                    let params = [];
                    
                    data.map( d => {
                        params = [d.board_id, d.file_originname, d.file_url, d.file_size, d.file_type];
                        sqls += mysql.format(sqlForm, params) + "\r\n";
                    });

                    sqls = sqls.slice(0, -12);
        
                    console.log("sql : " + sqls);

                    // const [result, fields] = await pool.query(sqls);
                    // pool.query(sqls, (error, result, field) => {
                    //     if (error) {
                    //         console.log("Error Execution :", error);
                    //     } else {}

                    //     console.log(result)
        
                    //     console.log('complete');
            
                    //     if (result) {
                    //         console.log('boards write success');
                    //         
                
                    //         return res.json(1);
                    //     } else {
                    //         console.log('boards db write fail');
                    //         
                
                    //         return res.json(0);
                    //     }

                    // });

                    /* --------------- 시간 되면 union all!!! ----------- */
                    // sqls = "INSERT INTO files(board_id, file_originname, file_url, file_size, file_type)"
                    // + " SELECT " + boardId + ", 'solgan_row.zip', 'solgan_row_1641193218298', 926933, 'zip' UNION ALL"
                    // + " SELECT " + boardId + ", 'slider3.jpg', 'slider3_1641193218301', 298340, 'jpg'";

                    const [sqlResult, field] = await pool.query(sqls);

                    console.log(sqlResult)

                    if (sqlResult.affectedRows > 0) {
                        console.log('sql success');
                        

                        return res.json(1);
                    } else {
                        console.log('sql fail');
                        

                        return res.json(0);
                    }
                    
                } else {
                    console.log('boards write success no file');
                    // 
        
                    return res.json(1);
                }

                // if (req.files.length != 0) {
                //     async.mapSeries(req.files, async (file, callback) => {
                //         const temp = file.originalname.split('.');
                
                //         fileType = temp[1].toLowerCase();
                //         fileName = temp[0] + '_' + Date.now();
                
                //         let filePath = path.join(__dirname, '../public/uploads/board/' + fileName + '.' + fileType);
                
                //         // console.log(filePath);
                
                //         var buffer = Buffer.from(file.buffer, 'base64');
                
                //         fs.writeFileSync(filePath, buffer, function(err){
                //             if(err){
                //                 console.log('upload 에러발생 :', err);
                                
                //                 // return res.json(0);
                //             } else {
                //                 console.log('완료');
                //             }
                //         });
        
                //         const sql = `INSERT INTO files(board_id, file_originname, file_url, file_size, file_type)`
                //                     + ` VALUES('${boardId}', '${file.originalname}', '${fileName}', ${file.size}, '${fileType}')`;
                //         const [result, fields] = await pool.query((sql));

                //         return result;
                //     }
                //     , async (err, results) => {
                //         if (err) {
                //             console.log('boards write fail');
                //             console.log(err);
                //             // 
            
                //             return res.json(0);
                //         }
                //         else {
                //             console.log('boards write success');
                //             // 

                //             return res.json(1);
                //         }
                //     });
                // }
                // else {
                //     console.log('boards write success not file');
                //     // 

                //     return res.json(1);
                // }
            } else {
                

                return res.json(0);
            }
            
        } catch (err) {
            console.log(`${board} write fail`);
            console.log('catch error : ' + err);
            // 

            return res.json(0);
        
        }
    }
});


router.post('/checkPwdAction', async function (req, res, next) {
    const { pwd } = req.body

    try {
        // db를 통해 관리자 계정 체크

        const userId = req.cookies.logined;

        const sql = `SELECT * FROM users WHERE id = '${userId}'`;
        const [result, fields] = await pool.query((sql));

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


// router.post('/upload/mou', upload.single('image'), (req, res) => {
//     try {
//         console.log('router')
//         res.json({ url: `/${req.file.filename}`});
//     } catch (err) {
//         console.log(err);
//         res.json(0);
//     }
// });

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
router.post('/imgpreview/upload', upload.any(), (req, res) => {
    try {
        // console.log(reader.readAsDataURL(event.target.files[0]);)
        console.log('router')
        console.log(req.files[0])
        console.log(req.files[0].mimetype)
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

     

    try {
        

        const userId = req.cookies.logined;
        const salt = Math.round((new Date().valueOf() * Math.random())) + "";
        const hashPassword = await bcrypt.hash(pwd + salt, 12);

        const sql = `UPDATE users SET id='${id}', pwd='${hashPassword}', salt='${salt}' WHERE id='${userId}'`;
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            
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
        
        console.log('user change fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.put('/appCounsel/update', async function (req, res, next) {
    const data = req.body;

    try {

        const sql =`UPDATE counsels `
                +  `SET `
                +       `category='${data.category}'`
                +       `, name='${data.name}'`
                +       `, gender='${data.gender}'`
                +       `, birth='${data.birth}'`
                +       `, age='${data.age}'`
                +       `, adress='${data.adress}'`
                +       `, phone='${data.phone}'`
                +       `, email='${data.email}'`
                +       `, religion='${data.religion}'`
                +       `, dwelling='${data.dwelling}'`
                +       `, discharge='${data.discharge}'`
                +       `, how='${data.how}'`
                +       `, second_phone='${data.second_phone}'`
                +       `, counsel_way='${data.counsel_way}'`
                +       `, counsel_exp='${data.counsel_exp}'`
                +       `, counsel_period='${data.counsel_period}'`
                +       `, counsel_category='${data.counsel_category}'`
                +       `, inspect_exp='${data.inspect_exp}'`
                +       `, inspect_date='${data.inspect_date}'`
                +       `, inspect_category='${data.inspect_category}'`
                +       `, family='${data.family}'`
                +       `, condi='${data.condi}'`
                +       `, desease='${data.desease}'`
                +       `, disability='${data.disability}'`
                +       `, support='${data.support}'`
                +       `, inspect='${data.inspect}'`
                +       `, support_detail='${data.support_detail}'`
                +       `, expect_detail='${data.expect_detail}'`
                +       `, time='${data.time}' `
                +  `WHERE id=${data.id}`
                    

        console.log((sql))
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            
            console.log('counsel update success');

            return res.json(1);
        }
        else {
            return res.json({data: 'not work db'});
        }
    
    } catch (err) {
        
        console.log('counsel update fail');
        console.log(err);

        return res.json({data: 'not work db'});
    
    }
});

router.put('/appProgram/update', async function (req, res, next) {
    const data = req.body;

    try {

        const sql =`UPDATE programapps `
                +  `SET `
                +       ` program_id='${data.program_id}'`
                +       `, name='${data.name}'`
                +       `, gender='${data.gender}'`
                +       `, birth='${data.birth}'`
                +       `, age='${data.age}'`
                +       `, adress='${data.adress}'`
                +       `, phone='${data.phone}'`
                +       `, email='${data.email}'`
                +       `, how='${data.how}'`
                +       `, support='${data.support}'`
                +       `, expect_detail='${data.expect_detail}'`
                +  `WHERE id=${data.id}`
                    

        console.log((sql))
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            
            console.log('program app update success');

            return res.json(1);
        }
        else {
            return res.json({data: 'not work db'});
        }
    
    } catch (err) {
        
        console.log('program app update fail');
        console.log(err);

        return res.json({data: 'not work db'});
    
    }
});

router.put('/program/update', async function (req, res, next) {
    const {
            id,  
            category,
            name,
            date,
            end_date,
            content,
    } = req.body;

    switch (category) {
        case '심리특강':
            service = '심리·상담';
            break;
        case '힐링자조모임':
            service = '심리·상담';
            break;
        case '원데이힐링 프로그램':
            service = '심리·상담';
            break;
        case '기초 심리교육':
            service = '심리교육·문화';
            break;
        case '심층 심리교육':
            service = '심리교육·문화';
            break;
        case '돌봄 및 감정노동 종사자 심리지원':
            service = '취약계층지원사업';
            break;
        case '고립노인 심리지원':
            service = '취약계층지원사업';
            break;
        default:
            console.log('프로그램 추가 - 잘못된 프로그램명 접근 : ' + category);
            return res.json(0);
    }

     

    try {
        

        const sql = `UPDATE programs SET service='${service}', category='${category}', name='${name}', day='${date}', end_day='${end_date}', content='${sqlReplaceAll(content)}' WHERE id=${id}`;

        console.log((sql))
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            
            console.log('program update success');

            return res.json(1);
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        
        console.log('program update fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.put('/gallery/update', upload.any(), async function (req, res, next) {
    const {
            id,
            name,
            content,
    } = req.body;

    try {
        const galleryId = id;

        let deleteImages = req.body.deleteImages;

        if (typeof(deleteImages) !== 'undefined' & typeof(deleteImages) != 'object') {
            deleteImages = [deleteImages]
        } else { }


        if (typeof(deleteImages) !== 'undefined' && deleteImages.length != 0) {
            console.log(`삭제 이미지 : ${deleteImages.length}개`);

            const data = [];
            
            async.mapSeries(deleteImages, async (id, callback) => {
                const deleteSql = `SELECT * FROM images WHERE id='${id}'`;
                const [deleteResult, fields] = await pool.query(deleteSql);

                console.log(deleteResult)

                if (typeof(deleteResult) !== 'undefined' && typeof(deleteResult[0].img_url) !== 'undefined') {
                    fs.unlink(`public/images/gallery/${deleteResult[0].img_url}.${deleteResult[0].img_type}`, (err) => {
                        console.log(err);
                    });
                } else {
                    console.log('파일 없음');
                }

                const tempData = { id };
                data.push(tempData);

                return deleteResult;
            }
            , async (err, results) => {
                if (err) {
                    console.log('file delete fail');
                    console.log(err);
                    
                    return res.json(0);
                }
                else {
                    // db에서 파일 row 모두 삭제
                    let fileSql = "DELETE FROM images WHERE id IN ( \r\n";
                    const sqlForm = "SELECT ? UNION ALL ";
                    
                    data.map( d => {
                        fileSql += mysql.format(sqlForm, [d.id]) + "\r\n";
                    });

                    fileSql = fileSql.slice(0, -12);
                    fileSql += ')';
                    console.log("sql : " + fileSql);

                    const [fileResult, field] = await pool.query(fileSql);

                    // 삭제 성공
                    if (results.length != 0 && fileResult.affectedRows > 0) {
                        console.log(`file delete success ${fileResult.affectedRows}개 삭제`);
                    }
                    // 삭제 실패
                    else {
                        console.log('게시글 업로드된 파일 db 삭제 실패');
                        return res.json(0);
                    }
                }
            });
        } else {}

        // 이미지 업로드

        const uploadFiles = req.files;

        if (typeof(uploadFiles) !== 'undefined' && uploadFiles.length != 0) {
            console.log(`업로드 파일 : ${uploadFiles.length}개`);

            const data = [];

            Array.from(req.files).forEach(file => {
                const temp = file.originalname.split('.');
            
                fileType = temp[1].toLowerCase();
                fileName = temp[0] + '_' + Date.now();
        
                let filePath = path.join(__dirname, '../public/images/gallery/' + fileName + '.' + fileType);
        
                console.log(filePath);
        
                var buffer = Buffer.from(file.buffer, 'base64');
        
                fs.writeFile(filePath, buffer, function(err){
                    if(err){
                        console.log('upload 에러발생 :', err);
                        
                        res.json(0);
    
                        return;
                    } else {
                        console.log(filePath + '완료');
                    }
                });

                const tempData = {
                    gallery_id : galleryId,
                    img_originname : file.originalname,
                    img_url : fileName,
                    img_size : file.size,
                    img_type : fileType
                };

                data.push(tempData);
            });

            let sqls = "INSERT INTO images(gallery_id, img_originname, img_url, img_size, img_type) \r\n";
            const sqlForm = "SELECT ?, ?, ?, ?, ? UNION ALL ";
            let params = [];
            
            data.map( d => {
                params = [d.gallery_id, d.img_originname, d.img_url, d.img_size, d.img_type];
                sqls += mysql.format(sqlForm, params) + "\r\n";
            });

            sqls = sqls.slice(0, -12);

            console.log("sql : " + sqls);

            const [sqlResult, field] = await pool.query(sqls);

            if (sqlResult.affectedRows > 0) {
                console.log('upload image success');
                
            } else {
                console.log('upload image fail');

                return res.json(0);
            }
        } else {}
        
        
        const sql = `UPDATE gallery SET title='${name}', content='${sqlReplaceAll(content)}' WHERE id=${id}`;

        console.log((sql))
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            console.log('sql success');

            return res.json(1);
        } else {
            console.log('no upload gallery update success');

            return res.json(1);
        }
    } catch (err) {
        
        console.log('gallery update fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.put('/advertGallery/update', upload.any(), async function (req, res, next) {
    const {
        id,
        name,
        content,
} = req.body;

    try {
        const galleryId = id;

        let deleteImages = req.body.deleteImages;

        if (typeof(deleteImages) !== 'undefined' & typeof(deleteImages) != 'object') {
            deleteImages = [deleteImages]
        } else { }


        if (typeof(deleteImages) !== 'undefined' && deleteImages.length != 0) {
            console.log(`삭제 이미지 : ${deleteImages.length}개`);

            const data = [];
            
            async.mapSeries(deleteImages, async (id, callback) => {
                const deleteSql = `SELECT * FROM images WHERE id='${id}'`;
                const [deleteResult, fields] = await pool.query(deleteSql);

                if (typeof(deleteResult) !== 'undefined' && typeof(deleteResult[0].img_url) !== 'undefined') {
                    fs.unlink(`public/images/gallery/${deleteResult[0].img_url}.${deleteResult[0].img_type}`, (err) => {
                        console.log(err);
                    });
                } else {
                    console.log('파일 없음');
                }

                const tempData = { id };
                data.push(tempData);

                return deleteResult;
            }
            , async (err, results) => {
                if (err) {
                    console.log('file delete fail');
                    console.log(err);
                    
                    return res.json(0);
                }
                else {
                    // db에서 파일 row 모두 삭제
                    let fileSql = "DELETE FROM images WHERE id IN ( \r\n";
                    const sqlForm = "SELECT ? UNION ALL ";
                    
                    data.map( d => {
                        fileSql += mysql.format(sqlForm, [d.id]) + "\r\n";
                    });

                    fileSql = fileSql.slice(0, -12);
                    fileSql += ')';
                    console.log("sql : " + fileSql);

                    const [fileResult, field] = await pool.query(fileSql);

                    // 삭제 성공
                    if (results.length != 0 && fileResult.affectedRows > 0) {
                        console.log(`file delete success ${fileResult.affectedRows}개 삭제`);
                    }
                    // 삭제 실패
                    else {
                        console.log('게시글 업로드된 파일 db 삭제 실패');
                        return res.json(0);
                    }
                }
            });
        } else {}

        // 이미지 업로드

        const uploadFiles = req.files;

        if (typeof(uploadFiles) !== 'undefined' && uploadFiles.length != 0) {
            console.log(`업로드 파일 : ${uploadFiles.length}개`);

            const data = [];

            Array.from(req.files).forEach(file => {
                const temp = file.originalname.split('.');
            
                fileType = temp[1].toLowerCase();
                fileName = temp[0] + '_' + Date.now();
        
                let filePath = path.join(__dirname, '../public/images/gallery/' + fileName + '.' + fileType);
        
                console.log(filePath);
        
                var buffer = Buffer.from(file.buffer, 'base64');
        
                fs.writeFile(filePath, buffer, function(err){
                    if(err){
                        console.log('upload 에러발생 :', err);
                        
                        res.json(0);
    
                        return;
                    } else {
                        console.log(filePath + '완료');
                    }
                });

                const tempData = {
                    gallery_id : galleryId,
                    img_originname : file.originalname,
                    img_url : fileName,
                    img_size : file.size,
                    img_type : fileType
                };

                data.push(tempData);
            });

            let sqls = "INSERT INTO images(gallery_id, img_originname, img_url, img_size, img_type) \r\n";
            const sqlForm = "SELECT ?, ?, ?, ?, ? UNION ALL ";
            let params = [];
            
            data.map( d => {
                params = [d.gallery_id, d.img_originname, d.img_url, d.img_size, d.img_type];
                sqls += mysql.format(sqlForm, params) + "\r\n";
            });

            sqls = sqls.slice(0, -12);

            console.log("sql : " + sqls);

            const [sqlResult, field] = await pool.query(sqls);

            console.log(sqlResult)
            if (sqlResult.affectedRows > 0) {
                console.log('upload image success');
                
            } else {
                console.log('upload image fail');

                return res.json(0);
            }
        } else {}


        const advert = typeof(req.body.advert) !== 'undefined' && req.body.advert == 'on' ? 1 : 0;
        const sql = `UPDATE gallery SET title='${name}', content='${sqlReplaceAll(content)}', is_advert=${advert} WHERE id=${id}`;

        console.log((sql))
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            console.log('sql success');

            return res.json(1);
        } else {
            console.log('no upload gallery update success');

            return res.json(1);
        }
    } catch (err) {
        
        console.log('gallery update fail');
        console.log(err);

        return res.json(0);

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

    try {
        

        const sql = `UPDATE networks SET name='${name}', adress='${adress}', phone_number='${phoneNumber}', homepage_url='${url}' WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            
            console.log('network update success');
            // res.setHeader("Content-Type", "text/plain; charset=UTF-8");
            return res.json({result: 'network', data: 1});
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }

    } catch (err) {
        
        console.log('network update fail');
        console.log(err);

        return res.json(0);
    
    }
});



router.put('/mou/update', upload.single('image'), async function (req, res, next) {
    const {
            id,
            name,
            mou_content,
            url,
    } = req.body;

     

    try {
        

        let imgQuery = '';
        let imgName = '';
        let imgType = '';

        // 수정할 때 이미지를 변경했다면 if문 실행
        if (typeof(req.file) != 'undefined') {

            const sql = `SELECT * FROM mous WHERE id=${id}`;
            const [result, fields] = await pool.query((sql));

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
        const [result, fields] = await pool.query((sql));


        if (result.affectedRows > 0) {
            
            console.log('mou update success');

            return res.json(1);
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        
        console.log('mou update fail');
        console.log(err);

        return res.json(0);
    
    }
});


router.put('/banner/update', upload.any(), async function (req, res, next) {
    const {
            id,
            name,
            url,
    } = req.body;

    try {
        

        let imgQuery = '';
        let imgName = '';
        let imgType = '';

        // 수정할 때 이미지를 변경했다면 if문 실행
        console.log('files length : ' + req.files.length);
        if (req.files.length != 0) {

            console.log(req.files)
            const sql = `SELECT * FROM banners WHERE id=${id}`;
            const [result, fields] = await pool.query((sql));

            const data = result[0];

            // 전에 사용하던 이미지가 있는지 확인한다.
            // 파일이 없는데 삭제하려고 하면 서버가 죽어서 확인 필수.
            if (typeof(data) !== 'undefined' && typeof(data.img_name) !== 'undefined') {
                const deleteFileUrl = path.join(__dirname, `../public/images/banner/${data.img_name}.${data.img_type}`);

                fs.unlink(deleteFileUrl, (err) => {
                    console.log(err);
                });
            } else {}

            const temp = req.files[0].originalname.split('.');

            imgType = temp[1].toLowerCase();
            imgName = temp[0] + '_' + Date.now();

            let filePath = path.join(__dirname, '../public/images/banner/' + imgName + '.' + imgType);
 
            // console.log(filePath);

            var buffer = Buffer.from(req.files[0].buffer, 'base64');

            fs.writeFile(filePath, buffer, function(err){
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

        const sql = `UPDATE banners SET name='${name}', url='${url}' ${imgQuery} WHERE id=${id}`;

        console.log((sql));
        const [result, fields] = await pool.query((sql));


        if (result.affectedRows > 0) {
            
            console.log('banner update success');

            // res.header("Content-Type: application/json")
            // res.setHeader("Content-Type", "text/plain; charset=UTF-8");
            return res.json({result: 'banner', data: 1});
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        
        console.log('banner update fail');
        console.log(err);

        return res.json(0);
    
    }
});



router.put('/faq/update', async function (req, res, next) {
    const { 
            id,
            question,
            answer,
            order,
    } = req.body;

     

    try {
        

        const sql = `UPDATE faqs SET question='${question}', answer='${answer}', show_order='${order}' WHERE id='${id}'`;
        console.log((sql));

        const [result, fields] = await pool.query((sql));

        if (result.affectedRows > 0) {
            
            console.log('faqs update success');

            return res.json(1);
        }
        else {
            throw new Error('변경된 데이터 없음.');
        }
    
    } catch (err) {
        
        console.log('faqs update fail');
        console.log(err);

        return res.json(0);
    
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
        return res.json(0);
    } else {}

    try {
   
        // 내용 수정

        const sql = `UPDATE boards SET title='${sqlReplaceAll(title)}', content='${sqlReplaceAll(content)}', writer='${writer}' WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

        // 내용 수정 끝

        if (result.affectedRows > 0) {

            const boardId = id;
            
            let deleteFiles = req.body.deleteFiles;

            if (typeof(deleteFiles) !== 'undefined' & typeof(deleteFiles) != 'object') {
                deleteFiles = [deleteFiles]
            } else { }

            // 파일 삭제
            if (typeof(deleteFiles) !== 'undefined' && deleteFiles.length != 0) {
                console.log(`삭제 파일 : ${deleteFiles.length}개`);

                const data = [];

                async.mapSeries(deleteFiles, async (id, callback) => {
                    const deleteSql = `SELECT * FROM files WHERE id='${id}'`;
                    const [deleteResult, fields] = await pool.query(deleteSql);

                    if (typeof(deleteResult) !== 'undefined' && typeof(deleteResult[0].file_url) !== 'undefined') {
                        fs.unlink(`public/uploads/board/${deleteResult[0].file_url}.${deleteResult[0].file_type}`, (err) => {
                            console.log(err);
                        });
                    } else {
                        console.log('파일 없음');
                    }

                    const tempData = { id };
                    data.push(tempData);

                    return deleteResult;
                }
                , async (err, results) => {
                    if (err) {
                        console.log('file delete fail');
                        console.log(err);
                        
                        return res.json(0);
                    }
                    else {
                        
                        // db에서 파일 row 모두 삭제
                        let fileSql = "DELETE FROM files WHERE id IN ( \r\n";
                        const sqlForm = "SELECT ? UNION ALL ";
                        
                        data.map( d => {
                            fileSql += mysql.format(sqlForm, [d.id]) + "\r\n";
                        });

                        fileSql = fileSql.slice(0, -12);
                        fileSql += ')';
                        console.log("sql : " + fileSql);

                        const [fileResult, field] = await pool.query(fileSql);

                        // 삭제 성공
                        if (results.length != 0 && fileResult.affectedRows > 0) {
                            console.log(`file delete success ${fileResult.affectedRows}개 삭제`);
                        }
                        // 삭제 실패
                        else {
                            console.log('게시글 업로드된 파일 db 삭제 실패');
                            return res.json(0);
                        }
                    }
                });
            } else {}

            const uploadFiles = req.files;

            if (typeof(uploadFiles) !== 'undefined' && uploadFiles.length != 0) {
                console.log(`업로드 파일 : ${uploadFiles.length}개`);

                const data = [];
        
                Array.from(uploadFiles).forEach(file => {
                    const temp = file.originalname.split('.');
                
                    fileType = temp[1].toLowerCase();
                    fileName = temp[0] + '_' + Date.now();
            
                    let filePath = path.join(__dirname, '../public/uploads/board/' + fileName + '.' + fileType);
            
                    console.log(filePath);
            
                    var buffer = Buffer.from(file.buffer, 'base64');
            
                    fs.writeFile(filePath, buffer, function(err){
                        if(err){
                            console.log('upload 에러발생 :', err);
                            
                            res.json(0);
        
                            return;
                        } else {
                            console.log(filePath + '완료');
                        }
                    });

                    const tempData = {
                        board_id : boardId,
                        file_originname : file.originalname,
                        file_url : fileName,
                        file_size : file.size,
                        file_type : fileType
                    };

                    data.push(tempData);
                });

                let sqls = "INSERT INTO files(board_id, file_originname, file_url, file_size, file_type) \r\n";
                const sqlForm = "SELECT ?, ?, ?, ?, ? UNION ALL ";
                let params = [];
                
                data.map( d => {
                    params = [d.board_id, d.file_originname, d.file_url, d.file_size, d.file_type];
                    sqls += mysql.format(sqlForm, params) + "\r\n";
                });

                sqls = sqls.slice(0, -12);

                console.log("sql : " + sqls);

                const [sqlResult, field] = await pool.query(sqls);

                if (sqlResult.affectedRows > 0) {
                    console.log('sql success');
                    
                    return res.json(1);
                } else {
                    console.log('sql fail');
                    
                    return res.json(0);
                }
            } else {}

            console.log('게시글 수정 성공 no file upload');
            return res.json(1);

                // async.mapSeries(req.files, async (file, callback) => {
                //     const temp = file.originalname.split('.');
            
                //     fileType = temp[1].toLowerCase();
                //     fileName = temp[0] + '_' + Date.now();
            
                //     let filePath = path.join(__dirname, '../public/uploads/board/' + fileName + '.' + fileType);
            
                //     // console.log(filePath);
            
                //     var buffer = Buffer.from(file.buffer, 'base64');
            
                //     fs.writeFileSync(filePath, buffer, function(err){
                //         if(err){
                //             console.log('upload 에러발생 :', err);
                            
                //             // return res.json(0);
                //         } else {
                //             console.log('완료');
                //         }
                //     });
    
                //     const sql = `INSERT INTO files(board_id, file_originname, file_url, file_size, file_type)`
                //                 + ` VALUES('${boardId}', '${file.originalname}', '${fileName}', ${file.size}, '${fileType}')`;
                //     const [result, fields] = await pool.query((sql));

                //     return result;
                // }
                // , async (err, results) => {
                //     if (err) {
                //         console.log('boards write fail');
                //         console.log(err);
                        
        
                //         return res.json(0);
                //     }
                //     else {
                //         console.log('boards write success');
                        

                //         return res.json(1);
                //     }
                // });
        } else {
            console.log('fail sql update');

            return res.json(0);
        }
        
    } catch (err) {
        console.log(`${board} update fail`);
        console.log(err);

        return res.json(0);
    
    }
});






/* ---------- DELETE ---------- */


router.delete('/mou/delete', async function (req, res, next) {
    let deleteList = req.body["mouDeleteList[]"];

    if (typeof(deleteList) !== 'undefined' & typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

    try {        

        let deleteImgList = []

        async.mapSeries(deleteList, async (id, callback) => {
            const deleteSql = `SELECT * FROM mous WHERE id=${id}`;
            const [deleteResult, deleteFields] = await pool.query(deleteSql);

            const imgName = deleteResult[0].img_name;

            if (typeof(imgName) != 'undefined' && imgName != '' && imgName != null && imgName != 'null') {
                fs.unlink(`public/images/mou/${imgName}.${deleteResult[0].img_type}`, (err) => {
                    console.log(err);
                });
            } else {}

            const sql = `DELETE FROM mous WHERE id=${id}`;
            const [result, fields] = await pool.query((sql));

            return result;
        }
        , async (err, results) => {
            if (err) {
                
                console.log('mou delete fail');
                console.log(err);

                return res.json(0);
            }
            else {
                // 삭제 성공
                if (results.length != 0 && results[0].affectedRows > 0) {
                    
                    console.log('mou delete success');

                    return res.json(1);
                }
                // 삭제 실패
                else {
                    
                    console.log('mou delete fail');

                    return res.json(0);
                }
            }
        });

    } catch (err) {
        
        console.log('mou delete fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.delete('/banner/delete', async function (req, res, next) {
    let deleteList = req.body["bannerDeleteList[]"];

    if (typeof(deleteList) !== 'undefined' & typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

    try {        

        let deleteImgList = []

        async.mapSeries(deleteList, async (id, callback) => {
            const deleteSql = `SELECT * FROM banners WHERE id=${id}`;
            const [deleteResult, deleteFields] = await pool.query(deleteSql);

            const imgName = deleteResult[0].img_name;

            if (typeof(imgName) != 'undefined' && imgName != '' && imgName != null && imgName != 'null') {
                fs.unlink(`public/images/banner/${imgName}.${deleteResult[0].img_type}`, (err) => {
                    console.log(err);
                });
            } else {}

            const sql = `DELETE FROM banners WHERE id=${id}`;
            const [result, fields] = await pool.query((sql));

            return result;
        }
        , async (err, results) => {
            if (err) {
                
                console.log('banner delete fail');
                console.log(err);

                return res.json(0);
            }
            else {
                // 삭제 성공
                if (results.length != 0 && results[0].affectedRows > 0) {
                    
                    console.log('banner delete success');

                    return res.json(1);
                }
                // 삭제 실패
                else {
                    
                    console.log('banner delete fail');

                    return res.json(0);
                }
            }
        });

    } catch (err) {
        
        console.log('banner delete fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.delete('/program/delete', async function (req, res, next) {
    const { id } = req.body;

    try {

        const checkSql = `SELECT * FROM programapps WHERE program_id=${id}`;
        const [checkResult, f] = await pool.query(checkSql);

        if (checkResult.length > 0) {
            console.log('신청자가 있는 프로그램입니다.');
            return res.json(-1);
        }

        const sql = `DELETE FROM programs WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

        console.log(result)

        if (result.length != 0) {
            console.log('program delete success');

            return res.json(1);
        } else {
            console.log('program delete fail db');

            return res.json({data: 'not work db'});
        }

    } catch (err) {
        
        console.log('program delete fail');
        console.log(err);

        return res.json({data: 'not work db'});
    
    }
});

router.delete('/appCounsel/delete', async function (req, res, next) {
    const { id } = req.body;

    try {        

        const sql = `DELETE FROM counsels WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

        if (result.length != 0) {
            console.log('app counsel delete success');

            return res.json(1);
        } else {
            console.log('app counsel delete fail db');

            return res.json({data: 'not work db'});
        }

    } catch (err) {
        
        console.log('app counsel delete fail');
        console.log(err);

        return res.json({data: 'not work db'});
    
    }
});

router.delete('/appProgram/delete', async function (req, res, next) {
    const { id } = req.body;

    try {        

        const sql = `DELETE FROM programapps WHERE id=${id}`;
        const [result, fields] = await pool.query((sql));

        if (result.length != 0) {
            console.log('app program delete success');

            return res.json(1);
        } else {
            console.log('app program delete fail db');

            return res.json({data: 'not work db'});
        }

    } catch (err) {
        
        console.log('app program delete fail');
        console.log(err);

        return res.json({data: 'not work db'});
    
    }
});

router.delete('/network/delete', async function (req, res, next) {
    let deleteList = req.body["networkDeleteList[]"];

    if (typeof(deleteList) !== 'undefined' & typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

    try {        

        async.mapSeries(deleteList, async (id, callback) => {
            const sql = `DELETE FROM networks WHERE id=${id}`;
            const [result, fields] = await pool.query((sql));
            return result;
        }
        , async (err, results) => {
            if (err) {
                
                console.log('networks delete fail');
                console.log(err);

                return res.json(0);
            }
            else {
                // 삭제 성공
                if (results.length != 0 && results[0].affectedRows > 0) {
                    
                    console.log('networks delete success');

                    return res.json(1);
                }
                // 삭제 실패
                else {
                    
                    console.log('networks delete fail');

                    return res.json(0);
                }
            }
        });

    } catch (err) {
        
        console.log('networks delete fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.delete('/gallery/delete', async function (req, res, next) {
    let deleteList = req.body["galleryDeleteList[]"];

    if (typeof(deleteList) !== 'undefined' & typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

     

    try {        
        
        console.log(`삭제할 게시글 : ${deleteList.length}개`);
        if (deleteList.length != 0) {
            
            const deleteData = [];
            deleteList.forEach(id => {
                deleteData.push({id})
            });
            
            // 삭제할 게시글의 모든 파일 리스트 조회 sql 생성
            let sqls = "";
            const sqlForm = "SELECT * FROM images WHERE gallery_id=? UNION ALL ";
            
            deleteData.map( d => {
                sqls += mysql.format(sqlForm, [d.id]) + "\r\n";
            });

            sqls = sqls.slice(0, -12);
            console.log("sql : " + sqls);

            const [deleteFileList, df] = await pool.query(sqls);

            // 삭제할 게시글에 첨부된 파일이 있으면
            // 파일들 삭제
            console.log(`삭제할 파일 : ${deleteFileList.length}개`);
            if (deleteFileList.length != 0) {

                Array.from(deleteFileList).forEach(data => {
                    if (typeof(data) !== 'undefined' && typeof(data.img_url) !== 'undefined'
                        && data) {
                        fs.unlink(`public/images/gallery/${data.img_url}.${data.img_type}`, (err) => {
                            if (err) {
                                console.log(err);
                            } else {}
                        });
                    } else {
                        console.log('파일 없음');
                    }
                });

                // db에서 파일 row 모두 삭제
                let fileSql = "DELETE FROM images WHERE gallery_id IN ( \r\n";
                const sqlForm = "SELECT ? UNION ALL ";
                
                deleteData.map( d => {
                    fileSql += mysql.format(sqlForm, [d.id]) + "\r\n";
                });

                fileSql = fileSql.slice(0, -12);
                fileSql += ')';
                console.log("sql : " + fileSql);

                const [sqlResult, field] = await pool.query(fileSql);

                // console.log(sqlResult)

                if (sqlResult.affectedRows > 0) {
                    console.log('image delete success from gallery');
                    
                    // return res.json(1);
                } else {
                    console.log('image delete fail from gallery');
                    
                    return res.json(0);
                }
                
            } else {
                console.log('삭제할 이미지 없음');
            }

            // db에서 게시글 row 모두 삭제
            let boardSql = "DELETE FROM gallery WHERE id IN ( \r\n";
            const boardSqlForm = "SELECT ? UNION ALL ";
            
            deleteData.map( d => {
                boardSql += mysql.format(boardSqlForm, [d.id]) + "\r\n";
            });

            boardSql = boardSql.slice(0, -12);
            boardSql += ')';
            console.log("sql : " + boardSql);

            const [sqlResult, field] = await pool.query(boardSql);

            console.log(sqlResult)

            if (sqlResult.affectedRows > 0) {
                console.log('gallery delete success with image');
                
                return res.json(1);
            } else {
                console.log('gallery delete fail with image');
                
                return res.json(0);
            }

        } else {
            console.log('삭제할 게시글이 없음');
            return res.json(0);
        }

        // if (deleteList.length != 0) {
        //     async.mapSeries(deleteList, async (id, callback) => {
        //         const deleteSql = `SELECT * FROM images WHERE gallery_id=${id}`;
        //         const [deleteResult, deleteFields] = await pool.query(deleteSql);

        //         if (deleteResult.length != 0) {
        //             deleteResult.forEach((data) => {
        //                 fs.unlink(`public/images/gallery/${data.img_url}.${data.img_type}`, (err) => {
        //                     console.log(err);
        //                 });
        //             });
    
        //         } else {}

        //         const sql = `DELETE FROM images WHERE gallery_id=${id}`;

        //         console.log((sql))
        //         const [result, fields] = await pool.query((sql));

        //         console.log(result)
    
        //         return result;
        //     }
        //     , async (err, results) => {
        //         if (err) {
                    
        //             console.log('gallery delete fail');
        //             console.log(err);
    
        //             return res.json(0);
        //         }
        //         else {
        //             // 삭제 성공
        //             if (results.length != 0) {
        //                 console.log('gallery file delete success');

        //                 async.mapSeries(deleteList, async (id, callback) => {
        //                     const sql = `DELETE FROM gallery WHERE id=${id}`;
        //                     const [result, fields] = await pool.query((sql));
        //                     return result;
        //                 }
        //                 , async (err, results) => {
        //                     if (err) {
                                
        //                         console.log('gallery delete fail');
        //                         console.log(err);
                
        //                         return res.json(0);
        //                     }
        //                     else {
        //                         // 삭제 성공
        //                         if (results.length != 0 && results[0].affectedRows > 0) {
                                    
        //                             console.log('gallery delete success');
                
        //                             return res.json(1);
        //                         }
        //                         // 삭제 실패
        //                         else {
                                    
        //                             console.log('gallery delete fail');
                
        //                             return res.json(0);
        //                         }
        //                     }
        //                 });
        //             }
        //             // 삭제 실패
        //             else {
                        
        //                 console.log('gallery file delete fail');

        //                 return res.json(0);
        //             }
        //         }
        //     });
        // } else {}

    } catch (err) {
        console.log('gallery delete fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.delete('/advertGallery/delete', async function (req, res, next) {
    let deleteList = req.body["galleryDeleteList[]"];

    if (typeof(deleteList) !== 'undefined' & typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

     

    try {        
        
        console.log(`삭제할 게시글 : ${deleteList.length}개`);
        if (deleteList.length != 0) {
            
            const deleteData = [];
            deleteList.forEach(id => {
                deleteData.push({id})
            });
            
            // 삭제할 게시글의 모든 파일 리스트 조회 sql 생성
            let sqls = "";
            const sqlForm = "SELECT * FROM images WHERE gallery_id=? UNION ALL ";
            
            deleteData.map( d => {
                sqls += mysql.format(sqlForm, [d.id]) + "\r\n";
            });

            sqls = sqls.slice(0, -12);
            console.log("sql : " + sqls);

            const [deleteFileList, df] = await pool.query(sqls);

            // 삭제할 게시글에 첨부된 파일이 있으면
            // 파일들 삭제
            console.log(`삭제할 파일 : ${deleteFileList.length}개`);
            if (deleteFileList.length != 0) {

                Array.from(deleteFileList).forEach(data => {
                    if (typeof(data) !== 'undefined' && typeof(data.img_url) !== 'undefined'
                        && data) {
                        fs.unlink(`public/images/gallery/${data.img_url}.${data.img_type}`, (err) => {
                            if (err) {
                                console.log(err);
                            } else {}
                        });
                    } else {
                        console.log('파일 없음');
                    }
                });

                // db에서 파일 row 모두 삭제
                let fileSql = "DELETE FROM images WHERE gallery_id IN ( \r\n";
                const sqlForm = "SELECT ? UNION ALL ";
                
                deleteData.map( d => {
                    fileSql += mysql.format(sqlForm, [d.id]) + "\r\n";
                });

                fileSql = fileSql.slice(0, -12);
                fileSql += ')';
                console.log("sql : " + fileSql);

                const [sqlResult, field] = await pool.query(fileSql);

                // console.log(sqlResult)

                if (sqlResult.affectedRows > 0) {
                    console.log('image delete success from gallery');
                    
                    // return res.json(1);
                } else {
                    console.log('image delete fail from gallery');
                    
                    return res.json(0);
                }
                
            } else {
                console.log('삭제할 이미지 없음');
            }

            // db에서 게시글 row 모두 삭제
            let boardSql = "DELETE FROM gallery WHERE id IN ( \r\n";
            const boardSqlForm = "SELECT ? UNION ALL ";
            
            deleteData.map( d => {
                boardSql += mysql.format(boardSqlForm, [d.id]) + "\r\n";
            });

            boardSql = boardSql.slice(0, -12);
            boardSql += ')';
            console.log("sql : " + boardSql);

            const [sqlResult, field] = await pool.query(boardSql);

            console.log(sqlResult)

            if (sqlResult.affectedRows > 0) {
                console.log('gallery delete success with image');
                
                return res.json(1);
            } else {
                console.log('gallery delete fail with image');
                
                return res.json(0);
            }

        } else {
            console.log('삭제할 게시글이 없음');
            return res.json(0);
        }

        // if (deleteList.length != 0) {
        //     async.mapSeries(deleteList, async (id, callback) => {
        //         const deleteSql = `SELECT * FROM images WHERE gallery_id=${id}`;
        //         const [deleteResult, deleteFields] = await pool.query(deleteSql);

        //         if (deleteResult.length != 0) {
        //             deleteResult.forEach((data) => {
        //                 fs.unlink(`public/images/gallery/${data.img_url}.${data.img_type}`, (err) => {
        //                     console.log(err);
        //                 });
        //             });
    
        //         } else {}

        //         const sql = `DELETE FROM images WHERE gallery_id=${id}`;

        //         console.log((sql))
        //         const [result, fields] = await pool.query((sql));

        //         console.log(result)
    
        //         return result;
        //     }
        //     , async (err, results) => {
        //         if (err) {
                    
        //             console.log('gallery delete fail');
        //             console.log(err);
    
        //             return res.json(0);
        //         }
        //         else {
        //             // 삭제 성공
        //             if (results.length != 0) {
        //                 console.log('gallery file delete success');

        //                 async.mapSeries(deleteList, async (id, callback) => {
        //                     const sql = `DELETE FROM gallery WHERE id=${id}`;
        //                     const [result, fields] = await pool.query((sql));
        //                     return result;
        //                 }
        //                 , async (err, results) => {
        //                     if (err) {
                                
        //                         console.log('gallery delete fail');
        //                         console.log(err);
                
        //                         return res.json(0);
        //                     }
        //                     else {
        //                         // 삭제 성공
        //                         if (results.length != 0 && results[0].affectedRows > 0) {
                                    
        //                             console.log('gallery delete success');
                
        //                             return res.json(1);
        //                         }
        //                         // 삭제 실패
        //                         else {
                                    
        //                             console.log('gallery delete fail');
                
        //                             return res.json(0);
        //                         }
        //                     }
        //                 });
        //             }
        //             // 삭제 실패
        //             else {
                        
        //                 console.log('gallery file delete fail');

        //                 return res.json(0);
        //             }
        //         }
        //     });
        // } else {}

    } catch (err) {
        console.log('gallery delete fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.delete('/faq/delete', async function (req, res, next) {
    let deleteList = req.body["deleteList[]"];

    if (typeof(deleteList) !== 'undefined' & typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }

    try {        

        async.mapSeries(deleteList, async (id, callback) => {
            const sql = `DELETE FROM faqs WHERE id=${id}`;
            const [result, fields] = await pool.query((sql));

            return result;
        }
        , async (err, results) => {
            if (err) {
                
                console.log('faqs delete fail');
                console.log(err);

                return res.json(0);
            }
            else {
                // 삭제 성공
                if (results.length != 0 && results[0].affectedRows > 0) {
                    
                    console.log('faqs delete success');

                    return res.json(1);
                }
                // 삭제 실패
                else {
                    
                    console.log('faqs delete fail');

                    return res.json(0);
                }
            }
        });
    
    } catch (err) {
        
        console.log('faqs delete fail');
        console.log(err);

        return res.json(0);
    
    }
});

router.delete('/:board/delete', async function (req, res, next) {
    const { board } = req.params;

    if (!['research', 'notice', 'news', 'reference', 'review'].includes(board)) {
        return res.json(0);
    } else {}

    let deleteList = req.body["boardDeleteList[]"];

    if (typeof(deleteList) !== 'undefined' & typeof(deleteList) != 'object') {
        deleteList = [deleteList]
    } else { }
     

    try {        

        console.log(`삭제할 게시글 : ${deleteList.length}개`);
        if (deleteList.length != 0) {
            
            const deleteData = [];
            deleteList.forEach(id => {
                deleteData.push({id})
            });
            
            // 삭제할 게시글의 모든 파일 리스트 조회 sql 생성
            let sqls = "";
            const sqlForm = "SELECT * FROM files WHERE board_id=? UNION ALL ";
            
            deleteData.map( d => {
                sqls += mysql.format(sqlForm, [d.id]) + "\r\n";
            });

            sqls = sqls.slice(0, -12);
            console.log("sql : " + sqls);

            const [deleteFileList, df] = await pool.query(sqls);

            // 삭제할 게시글에 첨부된 파일이 있으면
            // 파일들 삭제
            console.log(`삭제할 파일 : ${deleteFileList.length}개`);
            if (deleteFileList.length != 0) {

                Array.from(deleteFileList).forEach(data => {
                    if (typeof(data) !== 'undefined' && typeof(data.file_url) !== 'undefined'
                        && data) {
                        fs.unlink(`public/uploads/board/${data.file_url}.${data.file_type}`, (err) => {
                            // console.log(err);
                        });
                    } else {
                        console.log('파일 없음');
                    }
                });

                // db에서 파일 row 모두 삭제
                let fileSql = "DELETE FROM files WHERE board_id IN ( \r\n";
                const sqlForm = "SELECT ? UNION ALL ";
                
                deleteData.map( d => {
                    fileSql += mysql.format(sqlForm, [d.id]) + "\r\n";
                });

                fileSql = fileSql.slice(0, -12);
                fileSql += ')';
                console.log("sql : " + fileSql);

                const [sqlResult, field] = await pool.query(fileSql);

                // console.log(sqlResult)

                if (sqlResult.affectedRows > 0) {
                    console.log('file delete success from board');
                    
                    // return res.json(1);
                } else {
                    console.log('file delete fail from board');
                    
                    return res.json(0);
                }
                
            } else {
                console.log('삭제할 파일 없음');
            }

            // db에서 게시글 row 모두 삭제
            let boardSql = "DELETE FROM boards WHERE id IN ( \r\n";
            const boardSqlForm = "SELECT ? UNION ALL ";
            
            deleteData.map( d => {
                boardSql += mysql.format(boardSqlForm, [d.id]) + "\r\n";
            });

            boardSql = boardSql.slice(0, -12);
            boardSql += ')';
            console.log("sql : " + boardSql);

            const [sqlResult, field] = await pool.query(boardSql);

            console.log(sqlResult)

            if (sqlResult.affectedRows > 0) {
                console.log('board delete success with file');
                
                return res.json(1);
            } else {
                console.log('board delete fail with file');
                
                return res.json(0);
            }

            // async.mapSeries(deleteList, async (id, callback) => {
            //     const deleteSql = `SELECT * FROM files WHERE board_id='${id}'`;
            //     const [deleteResult, deleteFields] = await pool.query(deleteSql);

            //     if (deleteResult.length != 0) {
            //         deleteResult.forEach((data) => {
            //             fs.unlink(`public/uploads/board/${data.file_url}.${data.file_type}`, (err) => {
            //                 console.log(err);
            //             });
            //         });

            //     } else {}

            //     const fileSql = `DELETE FROM files WHERE board_id=${id}`;
            //     const [result, fields] = await pool.query(fileSql);

            //     return result;
            // }
            // , async (err, results) => {
            //     if (err) {
                    
            //         console.log('boards file delete fail');
            //         console.log(err);

            //         return res.json(0);
            //     }
            //     else {
            //         // 삭제 성공
            //         if (results.length != 0) {
            //             console.log('boards file delete success');

            //             async.mapSeries(deleteList, async (id, callback) => {
            //                 const sql = `DELETE FROM boards WHERE id=${id}`;
            //                 const [result, fields] = await pool.query((sql));
            //                 return result;
            //             }
            //             , async (err, results) => {
            //                 if (err) {
            //                     // 
            //                     console.log('boards delete fail');
            //                     console.log(err);
                
            //                     return res.json(0);
            //                 }
            //                 else {
            //                     // 삭제 성공
            //                     if (results.length != 0 && results[0].affectedRows > 0) {
            //                         // 
            //                         console.log('boards delete success');
                
            //                         return res.json(1);
            //                     }
            //                     // 삭제 실패
            //                     else {
            //                         // 
            //                         console.log('boards delete fail');
                
            //                         return res.json(0);
            //                     }
            //                 }
            //             });
            //         }
            //         // 삭제 실패
            //         else {
            //             // 
            //             console.log('boards file delete fail');

            //             return res.json(0);
            //         }
            //     }
            // });
        } else {
            console.log('삭제할 게시글이 없음');
            return res.json(0);
        }
    } catch (err) {
        console.log('boards delete fail');
        console.log(err);

        return res.json(0);
    
    }
});

module.exports = router;