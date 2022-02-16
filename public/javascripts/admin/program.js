
// DOM
const programTable = document.getElementById('program-table');


// Button
const btnDeleteProgram = document.getElementById('btn-program-delete');
const btnUpdateProgram = document.getElementById('btn-program-update');
const btnWriteProgram = document.getElementById('btn-program-write');
const btnCopyProgram = document.getElementById('btn-program-copy');


// Variable


// select2
$(document).ready(function() {
    $('#category-program').select2({
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


if(programTable) {
    $("#program-table").DataTable({
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
        var t = $('#program-table').DataTable();
     
        $.ajax({
            url: `/admin/program/data`,
            data: { },
            type: "get",
            success: function (result) {

                // program list 값을 추출했으면
                if (typeof(result) == 'object') {
                    const programList = result;

                    const today = new Date();
                    const todayToString = `${today.getFullYear()}-${addZero(today.getMonth()+1)}-${addZero(today.getDate())}`;
                    
                    console.log(todayToString)
                    // grid에 program list 추가
                    programList.forEach(element => {
                        const isDone = todayToString > element.day ? "done" : "";
                        const day = element.day == element.end_day ? element.day : `${element.day} ~ ${element.end_day}`;
                        
                        t.row.add([
                            `<span class="text-ellipsis ${isDone}" data-value="${element.id}">${element.category}</span>`,
                            `<span class="text-gray-800 w-400 text-ellipsis ${isDone}">${element.name}</span>`,
                            // `<span class="text-ellipsis);">${element.content}</span>`,
                            `<span class="${isDone}">${day}</span>`,
                            // `${isDone}`,
                            `<span class="${isDone}">${element.reg_date}</span>`,
                            `<span class="wpx-100 ${isDone}" style="padding-left: 10px">${element.app}</span>`
                        ]).draw( false );
                    });
                }
                // 오류로 인해 추가되지 않았으면
                else {
                    alert('오류 발생. 잠시 후 다시 요청해주세요.');
                }
            }
        });

        $('#program-table tbody').on( 'click', 'tr', function () {
            const num = t.row( this ).data()[0].split('data-value="')[1].split('"')[0];
            location.href = `/admin/program/update?id=${num}`;  
        } );
    } );

    // select2
    $(document).ready(function() {
        $('.select-category').select2({
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

    $(".select-category").append(`<option>기초 심리교육</option>`);
    $(".select-category").append(`<option>심층 심리교육</option>`);
    $(".select-category").append(`<option>심리특강</option>`);
    $(".select-category").append(`<option>힐링자조모임</option>`);
    $(".select-category").append(`<option>원데이힐링 프로그램</option>`);
    $(".select-category").append(`<option>돌봄 및 감정노동 종사자 심리지원</option>`);
    $(".select-category").append(`<option>고립노인 심리지원</option>`);

    $(document).on("select2:open", () => {
        document.querySelector(".select2-container--open .select2-search__field").focus()
    });
}

$(document).ready(function () {
    $.datepicker.setDefaults($.datepicker.regional['ko']);

    $("#program-day").datepicker({
        changeMonth: true,
        changeYear: true,
        nextText: '다음 달',
        prevText: '이전 달',
        dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dateFormat: "yymmdd",
        // minDate: -36500,
        yearRange: "-1:30+",
        minDate: -365, // 선택할수있는 최대날짜, ( 0 : 오늘 이후 날짜 선택 불가)
        showMonthAfterYear: true,
        onClose: function (selectedDate) {
            //시작일(startDate) datepicker가 닫힐때
            //종료일(endDate)의 선택할수있는 최소 날짜(minDate)를 선택한 시작일로 지정
            $("#program-end-day").datepicker("option", "minDate", selectedDate);
            document.getElementById('program-end-day').value = selectedDate;
        }
    });

    $("#program-end-day").datepicker({
        changeMonth: true,
        changeYear: true,
        nextText: '다음 달',
        prevText: '이전 달',
        dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dateFormat: "yymmdd",
        // minDate: -36500,
        yearRange: "-1:30+",
        minDate: -365, // 선택할수있는 최대날짜, ( 0 : 오늘 이후 날짜 선택 불가)
        showMonthAfterYear: true,
    });
});

/* Function */

function preventProgramActive(id) {
    programNotClick = false;
    location.href = `/admin/program/update?id=${id}`
}



/* Event */

// 프로그램 추가

if (btnWriteProgram) {
    btnWriteProgram.addEventListener('click', () => {
        downButton();

        const tempCategory = document.getElementById('category');
        const tempName = document.getElementById('name');
        const tempDate = document.getElementById('program-day');
        const tempEndDate = document.getElementById('program-end-day');
        const tempContent = document.getElementById('program-content');

        if (tempCategory.value == '') {
            alert('분류를 선택해주세요.');
            tempCategory.focus();
        }
        else if (tempName.value == '') {
            alert('프로그램 이름을 입력해주세요.');
            tempName.focus();
        }
        else if (tempDate.value == '') {
            alert('프로그램 시작 날짜를 선택해주세요.');
            tempDate.focus();
        }
        else if (tempEndDate.value == '') {
            alert('프로그램 종료 날짜를 선택해주세요.');
            tempEndDate.focus();
        }
        else if (!(tempDate.value.length == 8 || tempDate.value.length == 10)) {
            console.log(tempDate.value.length)
            alert('올바른 프로그램 날짜를 선택해주세요.');
            tempDate.focus();
        }
        else if (!(tempEndDate.value.length == 8 || tempEndDate.value.length == 10)) {
            console.log(tempEndDate.value.length)
            alert('올바른 프로그램 날짜를 선택해주세요.');
            tempEndDate.focus();
        }
        else if (tempContent.value == '') {
            alert('프로그램 설명을 입력해주세요.');
            tempContent.focus();
        }
        else {
            // 프로그램을 추가한다.
            $.ajax({
                url: `/admin/program/write`,
                data: {
                    category: tempCategory.value,
                    name: tempName.value,
                    date: tempDate.value,
                    end_date: tempEndDate.value,
                    content: tempContent.value,
                },
                type: "post",
                success: function (result) {

                    if (result == -1) {
                        alert('이미 같은 날짜에 같은 이름의 프로그램이 편성되어 있습니다.');
                    } else {
                        // 프로그램이 성공적으로 추가되었으면
                        if (result) {
                            if (document.getElementById('is-copy')) {
                                alert('복사되었습니다.');
                            } else {
                                alert('추가되었습니다.');
                            }
                            location.href = '/admin/program';
                        }
    
                        // 오류로 인해 추가되지 않았으면
                        else {
                            alert('오류 발생. 잠시 후 다시 요청해주세요.');
                        }
                    }
                }
            });
        }
        
        operateButton();
    });
}


// 프로그램 수정

if (btnUpdateProgram) {
    btnUpdateProgram.addEventListener('click', () => {
        const tempCategory = document.getElementById('category');
        const tempName = document.getElementById('name');
        const tempDate = document.getElementById('program-day');
        const tempEndDate = document.getElementById('program-end-day');
        const tempContent = document.getElementById('program-content');

        if (tempCategory.value == '') {
            alert('분류를 선택해주세요.');
            tempCategory.focus();
        }
        else if (tempName.value == '') {
            alert('프로그램 이름을 입력해주세요.');
            tempName.focus();
        }
        else if (tempDate.value == '') {
            alert('프로그램 시작 날짜를 선택해주세요.');
            tempDate.focus();
        }
        else if (tempEndDate.value == '') {
            alert('프로그램 종료 날짜를 선택해주세요.');
            tempEndDate.focus();
        }
        else if (!(tempDate.value.length == 8 || tempDate.value.length == 10)) {
            console.log(tempDate.value.length)
            alert('올바른 프로그램 날짜를 선택해주세요.');
            tempDate.focus();
        }
        else if (!(tempEndDate.value.length == 8 || tempEndDate.value.length == 10)) {
            console.log(tempEndDate.value.length)
            alert('올바른 프로그램 날짜를 선택해주세요.');
            tempEndDate.focus();
        }
        else if (tempContent.value == '') {
            alert('프로그램 설명을 입력해주세요.');
            tempContent.focus();
        }
        else {
            downButton();

            const query = new URLSearchParams(location.search);

            // 프로그램을 추가한다.
            $.ajax({
                url: `/admin/program/update`,
                data: {
                    id: query.get('id'),
                    category: tempCategory.value,
                    name: tempName.value,
                    date: tempDate.value,
                    end_date: tempEndDate.value,
                    content: tempContent.value,
                },
                type: "put",
                success: function (result) {

                    // 성공적으로 수정되었으면
                    if (result) {
                        alert('수정되었습니다.');
                        location.href = `/admin/program`
                    }

                    // 오류로 인해 추가되지 않았으면
                    else {
                        alert('오류 발생. 잠시 후 다시 요청해주세요.');
                    }
                }
            });

            operateButton();
        }
    });
}

if (btnDeleteProgram) {
    btnDeleteProgram.addEventListener('click', () => {
        const isDelete = confirm('정말 삭제하시겠습니까?');

        if(isDelete) {
            const query = new URLSearchParams(location.search);

            $.ajax({
                url: `/admin/program/delete`,
                data: { id: query.get('id') },
                type: "delete",
                success: function (result) {

                    if (result == -1) {
                        alert('신청자가 있는 프로그램은 삭제할 수 없습니다.');
                        return 0;
                    }

                    // 신청서 작성이 완료되었으면
                    if (result.data != 'not work db') {
                        alert('삭제가 완료되었습니다.');
                        window.location='/admin/program';
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

function addZero(num) { return (num < 10) ? '0' + num : num }
