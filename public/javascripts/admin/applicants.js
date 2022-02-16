// DOM
const appCounsel = document.querySelector('#appCounsel');
const appProgram = document.querySelector('#appProgram');


// Button
const btnSearchCounsel = document.getElementById('btn-counsel-search');
const btnInitCounsel = document.getElementById('btn-counsel-initialize');

const btnUpdateCounsel = document.getElementById('btn-counsel-update');
const btnDeleteCounsel = document.getElementById('btn-counsel-delete');
const btnUpdateProgram = document.getElementById('btn-program-update');
const btnDeleteProgram = document.getElementById('btn-program-delete');


if(appCounsel) {
    const query = new URLSearchParams(location.search);

    $("#appCounsel").DataTable({
        "language": {
            "lengthMenu": "_MENU_개 보기",
            "zeroRecords": "데이터가 없습니다.",
            "info": "_PAGE_ page of _PAGES_ page",
            "infoEmpty": "데이터가 없습니다.",
            "infoFiltered": "",
            "search": "<span style='margin-right:10px;'>검색 : </span>"
        },
        "order": [],
        "dom":
         "<'row'" +
         "<'col-sm-6 d-flex align-items-center justify-conten-start'l>" +
         "<'col-sm-6 d-flex align-items-center justify-content-end'f>" +
         ">" +
       
         "<'table-responsive'tr>" +
       
         "<'row'" +
         "<'col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'i>" +
         "<'col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'p>" +
         ">"
       });
    
    $(document).ready(function() {
        var t = $('#appCounsel').DataTable();

        // counsel list를 가져온다. 
        $.ajax({
            url: `/admin/appCounsel/data`,
            data: {
                category: query.get('category'),
                name: query.get('name'),
                gender: query.get('gender'),
                age: query.get('age'),
                startdate: query.get('startdate'),
                enddate: query.get('enddate'),
                done: query.get('done'),
            },
            type: "get",
            success: function (result) {
                
                // counsel list 값을 추출했으면
                if (typeof(result) == 'object') {
                    const counselList = result;

                    // grid에 counsel list 추가
                    counselList.forEach(element => {

                        t.row.add([
                            `<p class="text-ellipsis" data-value="${element.id}" style="margin-bottom: 0px;">${element.category}</p>`,
                            `${element.name}`,
                            // `<span class="text-gray-800 text-hover-primary" style="cursor: pointer">${element.question}</span>`,
                            `${element.gender}`,
                            `${element.age}`,
                            `<p class="text-ellipsis w-300" style="margin-bottom: 0px">${element.counsel_way}</p>`,
                            `${element.reg_date}`,
                        ]).draw( false );
                    });
                }
                // 오류로 인해 추가되지 않았으면
                else {
                    alert('오류 발생. 잠시 후 다시 요청해주세요.');
                }
            }
        });

        $('#appCounsel').on( 'click', 'tr', function () {
            const num = t.row( this ).data()[0].split('data-value="')[1].split('"')[0];
            location.href = `/admin/appCounsel/appForm?id=${num}`;    
        });
    } );

    // select2
    $(document).ready(function() {
        $('.select-category#category').select2({
            "language": {
                "noResults": function(){
                    return "결과없음";
                }
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            minimumResultsForSearch: -1
        });
    });

    $(".select-category#category").append(`<option value="개인상담">개인상담</option>`);
    $(".select-category#category").append(`<option value="심리검사">심리검사</option>`);
    // $(".select-category#category").append(`<option value="마음돌봄사업">마음돌봄사업</option>`);


    // select2
    $(document).ready(function() {
        $('.select-category#gender').select2({
            "language": {
                "noResults": function(){
                    return "결과없음";
                }
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            minimumResultsForSearch: -1
        });
    });

    // select2
    $(document).ready(function() {
        $('.select-category#done').select2({
            "language": {
                "noResults": function(){
                    return "결과없음";
                }
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            minimumResultsForSearch: -1
        });
    });

    $(document).on("select2:open", () => {
        document.querySelector(".select2-container--open .select2-search__field").focus()
    });

    // 검색 설정 유지
    $('#category').val(query.get('category')).trigger('change');
    $('#gender').val(query.get('gender')).trigger('change');
    $('#done').val(query.get('done')).trigger('change');
    document.getElementById('name').value = query.get('name');
    document.getElementById('age').value = query.get('age');
    document.getElementById('start-date').value = query.get('startdate');
    document.getElementById('end-date').value = query.get('enddate');
} else { }

if(appProgram) {
    const query = new URLSearchParams(location.search);

    $("#appProgram").DataTable({
        "language": {
            "lengthMenu": "_MENU_개 보기",
            "zeroRecords": "데이터가 없습니다.",
            "info": "_PAGE_ page of _PAGES_ page",
            "infoEmpty": "데이터가 없습니다.",
            "infoFiltered": "",
            "search": "<span style='margin-right:10px;'>검색 : </span>"
        },
        "order": [],
        "dom":
         "<'row'" +
         "<'col-sm-6 d-flex align-items-center justify-conten-start'l>" +
         "<'col-sm-6 d-flex align-items-center justify-content-end'f>" +
         ">" +
       
         "<'table-responsive'tr>" +
       
         "<'row'" +
         "<'col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'i>" +
         "<'col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'p>" +
         ">"
       });
    
       $(document).ready(function() {
        var t = $('#appProgram').DataTable();

        // counsel list를 가져온다. 
        $.ajax({
            url: `/admin/appProgram/data`,
            data: {
                category: query.get('category'),
                name: query.get('name'),
                gender: query.get('gender'),
                age: query.get('age'),
                startdate: query.get('startdate'),
                enddate: query.get('enddate'),
                done: query.get('done'),
            },
            type: "get",
            success: function (result) {
                
                // counsel list 값을 추출했으면
                if (typeof(result) == 'object') {
                    const counselList = result;

                    // grid에 counsel list 추가
                    counselList.forEach(element => {

                        t.row.add([
                            `<p class="text-ellipsis" data-value="${element.id}" style="margin-bottom: 0px;">${element.program_name}</p>`,
                            `${element.name}`,
                            // `<span class="text-gray-800 text-hover-primary" style="cursor: pointer">${element.question}</span>`,
                            `${element.gender}`,
                            `${element.age}`,
                            `<p class="text-ellipsis w-300" style="margin-bottom: 0px">${element.support}</p>`,
                            `${element.reg_date}`,
                        ]).draw( false );
                    });
                }
                // 오류로 인해 추가되지 않았으면
                else {
                    alert('오류 발생. 잠시 후 다시 요청해주세요.');
                }
            }
        });

        $('#appProgram').on( 'click', 'tr', function () {
            const num = t.row( this ).data()[0].split('data-value="')[1].split('"')[0];
            location.href = `/admin/appProgram/appForm?id=${num}`;    
        });
    } );

    // select2
    $(document).ready(function() {
        $('.select-category#category').select2({
            "language": {
                "noResults": function(){
                    return "결과없음";
                }
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            minimumResultsForSearch: -1
        });
    });

    $(".select-category#category").append(`<option value="기초 심리교육">기초 심리교육</option>`);
    $(".select-category#category").append(`<option value="심층 심리교육">심층 심리교육</option>`);
    $(".select-category#category").append(`<option value="심리특강">심리특강</option>`);
    $(".select-category#category").append(`<option value="힐링자조모임">힐링자조모임</option>`);
    $(".select-category#category").append(`<option value="원데이힐링 프로그램">원데이힐링 프로그램</option>`);
    $(".select-category#category").append(`<option value="돌봄 및 감정노동 종사자 심리지원">돌봄 및 감정노동 종사자 심리지원</option>`);
    $(".select-category#category").append(`<option value="고립노인 심리지원">고립노인 심리지원</option>`);

    // select2
    $(document).ready(function() {
        $('.select-category#gender').select2({
            "language": {
                "noResults": function(){
                    return "결과없음";
                }
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            minimumResultsForSearch: -1
        });
    });

    // select2
    $(document).ready(function() {
        $('.select-category#done').select2({
            "language": {
                "noResults": function(){
                    return "결과없음";
                }
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            minimumResultsForSearch: -1
        });
    });

    $(document).on("select2:open", () => {
        document.querySelector(".select2-container--open .select2-search__field").focus()
    });

    // 검색 설정 유지
    $('#category').val(query.get('category')).trigger('change');
    $('#gender').val(query.get('gender')).trigger('change');
    $('#done').val(query.get('done')).trigger('change');
    document.getElementById('name').value = query.get('name');
    document.getElementById('age').value = query.get('age');
    document.getElementById('start-date').value = query.get('startdate');
    document.getElementById('end-date').value = query.get('enddate');
} else { }


if(btnUpdateCounsel) {
    btnUpdateCounsel.addEventListener('click', () => {
        const category = document.getElementById('category');
    
        if (category.value == '') {
            alert('신청하는 심리지원서비스를 선택해주세요.');
            category.focus();

            return;
        } else {}

        
        const name = document.getElementById('name');

        if (name.value == '') {
            alert('이름을 입력해주세요.');
            name.focus();
    
            return;
        } else {}

        
        if (!checkBoxNullCheck('gender')) {
            alert('성별을 선택해주세요.');
            document.getElementsByName('gender')[0].focus();
    
            return;
        } else {}


        const birth = document.getElementById('birth');

        if (birth.value == '') {
            alert('생년월일을 입력해주세요.');
            birth.focus();
    
            return;
        } else {}


        const age = document.getElementById('age');

        if (age.value == '') {
            alert('나이를 입력해주세요.');
            age.focus();
    
            return;
        } else {}


        const adress = document.getElementById('adress');

        if (adress.value == '') {
            alert('주소를 입력해주세요.');
            adress.focus();
    
            return;
        } else {}


        const phone = document.getElementById('phone');

        if (phone.value == '') {
            alert('전화번호를 입력해주세요.');
            phone.focus();
    
            return;
        } else {}


        const email = document.getElementById('email');

        if (email.value == '') {
            alert('전화번호를 입력해주세요.');
            email.focus();
    
            return;
        } else {}


        const disability = document.getElementById('disability');

        if (disability.value == '') {
            alert('장애 여부를 선택해주세요.');
            disability.focus();
    
            return;
        } else {}


        const support = document.getElementById('support');

        if (support.value == '') {
            alert('도움 받고 싶은 영역을 선택해주세요.');
            support.focus();
    
            return;
        } else {}
        

        const inspect = document.getElementById('inspect');

        if (inspect.value == '') {
            alert('검사 영역을 선택해주세요.');
            inspect.focus();
    
            return;
        } else {}


        const support_detail = document.getElementById('support_detail');

        if (support_detail.value == '') {
            alert('도움 받고 싶은 내용을 입력해주세요.');
            support_detail.focus();
    
            return;
        } else {}


        const expect_detail = document.getElementById('expect_detail');

        if (expect_detail.value == '') {
            alert('기대하는 바를 입력해주세요.');
            expect_detail.focus();
    
            return;
        } else {}

        const query = new URLSearchParams(location.search);

        const data = {
            id: query.get('id'),
            category: document.getElementById('category').value,
            name: document.getElementById('name').value,
            gender: radioValue('gender'),
            birth: document.getElementById('birth').value,
            age: document.getElementById('age').value,
            adress: document.getElementById('adress').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            religion: radioValue('religion'), //c
            dwelling: radioValue('dwelling'), // c
            discharge: radioValue('discharge'), //c
            how: radioValue('how'), //10
            second_phone: document.getElementById('second_phone').value,
            counsel_way: document.getElementById('counsel_way').value, //cc
            counsel_exp: radioValue('counsel_exp'),
            counsel_period: document.getElementById('counsel_period').value,
            counsel_category: document.getElementById('counsel_category').value, //cc
            inspect_exp: radioValue('inspect_exp'),
            inspect_date: document.getElementById('inspect_date').value,
            inspect_category: document.getElementById('inspect_category').value, //cc
            family: document.getElementById('family').value, //15
            condi: radioValue('condi'),
            desease: document.getElementById('desease').value,
            disability: document.getElementById('disability').value, //cc
            support: document.getElementById('support').value, // cc
            inspect: document.getElementById('inspect').value,  //cc
            support_detail: document.getElementById('support_detail').value,
            expect_detail: document.getElementById('expect_detail').value,
            time: document.getElementById('time').value,
        }

        // console.log(data)

        downButton();

        $.ajax({
            url: `/admin/appCounsel/update`,
            data: data,
            type: "put",
            success: function (result) {

                // 신청서 작성이 완료되었으면
                if (result.data != 'not work db') {
                    alert('수정이 완료되었습니다.');
                    window.scrollTo(0,0);
                    window.location.reload();
                }
                // 오류로 인해 완료되지 않았으면
                else {
                    alert('오류 발생. 잠시 후 다시 요청해주세요.');
                    operateButton();
                }
            }
        });
    });
} else {}

if(btnDeleteCounsel) {
    btnDeleteCounsel.addEventListener('click', () => {
        const isDelete = confirm('정말 삭제하시겠습니까?');

        if(isDelete) {
            const query = new URLSearchParams(location.search);

            downButton();

            $.ajax({
                url: `/admin/appCounsel/delete`,
                data: { id: query.get('id') },
                type: "delete",
                success: function (result) {
    
                    // 신청서 작성이 완료되었으면
                    if (result.data != 'not work db') {
                        alert('삭제가 완료되었습니다.');
                        window.location='/admin/appCounsel';
                    }
                    // 오류로 인해 완료되지 않았으면
                    else {
                        alert('오류 발생. 잠시 후 다시 요청해주세요.');
                        operateButton();
                    }
                }
            });
        } else {}
    });
}

if(btnUpdateProgram) {
    btnUpdateProgram.addEventListener('click', () => {
        const program = document.getElementById('program');

        if (program.value == '') {
            alert('프로그램을 선택해주세요.');
            program.focus();
    
            return;
        } else {}
        
        const name = document.getElementById('name');

        if (name.value == '') {
            alert('이름을 입력해주세요.');
            name.focus();
    
            return;
        } else {}

        
        if (!checkBoxNullCheck('gender')) {
            alert('성별을 선택해주세요.');
            document.getElementsByName('gender')[0].focus();
    
            return;
        } else {}


        const birth = document.getElementById('birth');

        if (birth.value == '') {
            alert('생년월일을 입력해주세요.');
            birth.focus();
    
            return;
        } else {}


        const age = document.getElementById('age');

        if (age.value == '') {
            alert('나이를 입력해주세요.');
            age.focus();
    
            return;
        } else {}


        const adress = document.getElementById('adress');

        if (adress.value == '') {
            alert('주소를 입력해주세요.');
            adress.focus();
    
            return;
        } else {}


        const phone = document.getElementById('phone');

        if (phone.value == '') {
            alert('전화번호를 입력해주세요.');
            phone.focus();
    
            return;
        } else {}
        

        const email = document.getElementById('email');

        if (email.value == '') {
            alert('전화번호를 입력해주세요.');
            email.focus();
    
            return;
        } else {}


        if (!checkBoxNullCheck('how')) {
            alert('신청경위 선택해주세요.');
            document.getElementsByName('how')[0].focus();
    
            return;
        } else {}

        if (document.getElementById('support').value == '') {
            alert('도움 받고 싶은 영역을 선택해주세요.');
            document.getElementsByName('support')[0].focus();
    
            return;
        } else {}
        
        const expect_detail = document.getElementById('expect_detail');

        if (expect_detail.value == '') {
            alert('기대하는 바를 입력해주세요.');
            expect_detail.focus();
    
            return;
        } else {}

        const query = new URLSearchParams(location.search);

        const data = {
            // category: document.getElementById('category').value,
            id: query.get('id'),
            program_id: document.getElementById('program').value,
            name: document.getElementById('name').value,
            gender: radioValue('gender'),
            birth: document.getElementById('birth').value,
            age: document.getElementById('age').value,
            adress: document.getElementById('adress').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            how: radioValue('how'), //10
            support: document.getElementById('support').value, // cc
            expect_detail: document.getElementById('expect_detail').value,
        }

        $.ajax({
            url: `/admin/appProgram/update`,
            data: data,
            type: "put",
            success: function (result) {

                // 신청서 작성이 완료되었으면
                if (result.data != 'not work db') {
                    alert('수정이 완료되었습니다.');
                    window.scrollTo(0,0);
                    window.location.reload();
                }
                // 오류로 인해 완료되지 않았으면
                else {
                    alert('오류 발생. 잠시 후 다시 요청해주세요.');
                }
            }
        });
    });
}

if(btnDeleteProgram) {
    btnDeleteProgram.addEventListener('click', () => {
        const isDelete = confirm('정말 삭제하시겠습니까?');

        if(isDelete) {
            const query = new URLSearchParams(location.search);

            $.ajax({
                url: `/admin/appProgram/delete`,
                data: { id: query.get('id') },
                type: "delete",
                success: function (result) {

                    // 신청서 작성이 완료되었으면
                    if (result.data != 'not work db') {
                        alert('삭제가 완료되었습니다.');
                        window.location='/admin/appProgram';
                    }
                    // 오류로 인해 완료되지 않았으면
                    else {
                        alert('오류 발생. 잠시 후 다시 요청해주세요.');
                    }
                }
            });
        } else { }
    });
}
// Event

function ExcelTest(){
    const query = new URLSearchParams(location.search);
    const path = location.pathname.split('/');
    const url = path[2];


    $.ajax({
        url: `/admin/${url}/excel`,
        type: 'get',
        data:{
            category: query.get('category'),
            name: query.get('name'),
            gender: query.get('gender'),
            age: query.get('age'),
            startdate: query.get('startdate'),
            enddate: query.get('enddate'),
            done: query.get('done'),
        },
        dataType:'json',
        success:function(result){
            // result에 이름
            const el = document.createElement('a');
            el.href = `/uploads/${result}`;
            el.download = '신청내역';
            document.body.appendChild(el);
            el.click();
            document.body.removeChild(el);
        }
    });
};


if (btnSearchCounsel) {
    btnSearchCounsel.addEventListener('click', () => {
        const tempCategory = document.getElementById('category').value;
        const tempName = document.getElementById('name').value;
        const tempGender = document.getElementById('gender').value;
        const tempAge = document.getElementById('age').value;
        const tempDone = document.getElementById('done').value;
        const tempStartDate = document.getElementById('start-date').value;
        const tempEndDate = document.getElementById('end-date').value;

        const category = tempCategory ? `category=${tempCategory}&` : '';
        const name = tempName ? `name=${tempName}&` : '';
        const gender = tempGender ? `gender=${tempGender}&` : '';
        const age = tempAge ? `age=${tempAge}&` : '';
        const startdate = tempStartDate ? `startdate=${tempStartDate}&` : '';
        const enddate = tempEndDate ? `enddate=${tempEndDate}&` : '';

        const path = location.pathname.split('/');
        const url = path[2];

       location.href = `/admin/${url}?${category}${name}${gender}${age}${startdate}${enddate}done=${tempDone}`;
    }, true);
} else {}

if (btnInitCounsel) {
    btnInitCounsel.addEventListener('click', () => {
        $('#category').val('').trigger('change');
        $('#gender').val('').trigger('change');
        $('#done').val('').trigger('change');
        document.getElementById('name').value = '';
        document.getElementById('age').value = '';
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
    });
} else {}


function radioValue(name) {
    const temp = document.querySelectorAll(`input[name="${name}"]:checked`);
    
    if (typeof(temp[0]) == 'undefined') {
        return '';
    } else { }

    if (temp[0].value !== '기타') {
        return temp[0].value;
    }
    else {
        return document.getElementById(`${name}`).value;
    }
}

// checkbox null check
function checkBoxNullCheck(name) {
    const query = `input[name="${name}"]:checked`;
    const selectedEls = document.querySelectorAll(query);
    
    // 선택된 목록에서 value 찾기
    if (selectedEls.length != 0) {
        return true;
    }
    else {
        return false;
    }
}