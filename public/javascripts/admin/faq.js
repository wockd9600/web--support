// DOM
const faqTable = document.querySelector('#faq-table');


// Button
const btnAddAnswer = document.querySelector('#btn-add-answer');
const btnUpdateAnswer = document.querySelector('#btn-faq-update');
const btnDeleteAnswer = document.querySelector('#btn-delete-answer');

let deleteList = [];
let notClick = true;

if(faqTable) {
    $("#faq-table").DataTable({
        "language": {
            "lengthMenu": "_MENU_개 보기",
            "zeroRecords": "데이터가 없습니다.",
            "info": "_PAGE_ page of _PAGES_ page",
            "infoEmpty": "데이터가 없습니다.",
            "infoFiltered": "",
            "search": "<span style='margin-right:10px;'>검색 : </span>"
        },
        "order": [[ 3, "desc" ]],
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
        var t = $('#faq-table').DataTable();

        // faq list를 가져온다.
        $.ajax({
            url: `/admin/faq/data`,
            data: { },
            type: "get",
            success: function (result) {

                // faq list 값을 추출했으면
                if (typeof(result) == 'object') {
                    const faqList = result;

                    // grid에 faq list 추가
                    faqList.forEach(element => {
                        t.row.add([
                            `<span class="text-gray-800 text-hover-primary" style="cursor: pointer" onclick="preventTrActive(${element.id});">${element.question}</span>`
                            , element.answer
                            , element.show_order
                            , `<span sytle="width:100px !important;overflow: hidden;">${element.reg_date}</span>`
                        ]).draw( false );
                    });
                }
                // 오류로 인해 추가되지 않았으면
                else {
                    alert('오류 발생. 잠시 후 다시 요청해주세요.');
                }
            }
        });

        $('#faq-table tbody').on( 'click', 'tr', function () {
            // 링크 이동이 아닐 경우만
            if (notClick) {
                const cl = this.classList.value.split(' ');

                // 선택되어 있다면 선택 취소
                if (cl.includes('selected')) {
                    this.classList.remove('selected');

                    const num = t.row( this ).data()[0].split('preventTrActive(')[1].split(')')[0];
                    const index = deleteList.indexOf(num);

                    if (index > -1) {
                        deleteList.splice(index, 1);
                    } else {}
                    
                }
                // 선택되어 있지 않다면 선택
                else {
                    this.classList.add('selected');
                    deleteList.push( t.row( this ).data()[0].split('preventTrActive(')[1].split(')')[0] );
                    
                }
            }
        });
    });
}


/* Function */

function preventTrActive(id) {
    notClick = false;
    location.href = `/admin/faq/update?id=${id}`
}



/* Event */

// FAQ 추가

if (btnAddAnswer) {
    btnAddAnswer.addEventListener('click', () => {
        const tempQuestion = document.querySelector('#question');
        const tempAnswer = document.querySelector('#answer');
        const tempOrder = document.querySelector('#order');
    
        if (tempQuestion.value == '') {
            alert('질문을 입력해주세요.');
            tempQuestion.focus();
        }
        else if (tempAnswer.value == '') {
            alert('답변 입력해주세요.');
            tempAnswer.focus();
        }
        else if (tempOrder.value == '') {
            alert('순서 입력해주세요.');
            tempOrder.focus();
        }
        else {

            downButton();

            // faq를 추가한다.
            $.ajax({
                url: `/admin/faq/write`,
                data: {
                    question: tempQuestion.value,
                    answer: tempAnswer.value,
                    order: tempOrder.value,
                },
                type: "post",
                success: function (result) {

                    // faq가 성공적으로 추가되었으면
                    if (result) {
                        alert('추가되었습니다.');
                        location.href = '/admin/faq';
                        // const today = new Date();
                        // $(document).ready(function() {
                        //     var t = $('#faq-table').DataTable();
                            
                        //     t.row.add([
                        //         `<span class="text-gray-800 text-hover-primary" style="cursor: pointer" onclick="preventTrActive(${result});">${tempQuestion.value}</span>`
                        //         , tempAnswer.value
                        //         , 1
                        //         , `<p sytle="overflow-x: hidden;">${today}</p>`
                        //     ]).draw( false );
                        // });

                        // document.querySelector('.btn-add').click();
        
                        // 그리드에 입력이 끝나면 값 초기화
                        setTimeout(() => {
                            tempQuestion.value = '';
                            tempAnswer.value = '';
                        }, 0);
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
} else { }


// FAQ 수정

if (btnUpdateAnswer) {
    btnUpdateAnswer.addEventListener('click', () => {
        const tempQuestion = document.querySelector('#question');
        const tempAnswer = document.querySelector('#answer');
        const tempOrder = document.querySelector('#order');
    
        if (tempQuestion.value == '') {
            alert('질문을 입력해주세요.');
            tempQuestion.focus();
        }
        else if (tempAnswer.value == '') {
            alert('답변 입력해주세요.');
            tempAnswer.focus();
        }
        else if (tempOrder.value == '') {
            alert('순서 입력해주세요.');
            tempOrder.focus();
        }
        else {
            const query = new URLSearchParams(location.search);

            downButton();

            // faq를 수정한다.
            $.ajax({
                url: "/admin/faq/update",
                data: {
                    id: query.get('id'),
                    question: tempQuestion.value,
                    answer: tempAnswer.value,
                    order: tempOrder.value,
                },
                type: "put",
                success: function (result) {

                    // faq가 성공적으로 수정되었으면
                    if (result) {
                        alert('수정되었습니다.');

                        location.href = '/admin/faq';
                    }

                    // 오류로 인해 수정되지 않았으면
                    else {
                        alert('오류 발생. 잠시 후 다시 요청해주세요.');
                    }
                }
            });

            operateButton();
        }
    });
} else { }


// FAQ 삭제

if (btnDeleteAnswer) {
    btnDeleteAnswer.addEventListener('click', () => {
        if (deleteList.length != 0) {
            const isDelete = confirm(`${deleteList.length}개 항목을 삭제하시겠습니까?`);
            
            if (isDelete) {

                downButton();

                // faq를 삭제한다.
                $.ajax({
                    url: `/admin/faq/delete`,
                    data: { deleteList },
                    type: "delete",
                    success: function (result) {

                        // faq가 성공적으로 삭제되었으면
                        if (result) {
                            alert('삭제되었습니다.');
                            location.reload();
                        }

                        // 오류로 인해 삭제되지 않았으면
                        else {
                            alert('오류 발생. 잠시 후 다시 요청해주세요.');
                        }
                    }
                });

                operateButton();
            } else {}
        }
        else {
            alert('삭제할 항목을 선택해주세요.');
        }
    });
} else {}