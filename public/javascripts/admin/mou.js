// DOM
const mouTable = document.getElementById('mou-table');
const mouPreviewImg = document.getElementById('image');


// Button
const btnWriteMou = document.getElementById('btn-mou-write');
const btnUpdateMou = document.getElementById('btn-mou-update');
const btnDeleteMou = document.getElementById('btn-mou-delete');


// Variable
let mouDeleteList = [];
let mouNotClick = true;


if(mouTable) {
    $("#mou-table").DataTable({
        "language": {
            "lengthMenu": "_MENU_개 보기",
            "zeroRecords": "데이터가 없습니다.",
            "info": "_PAGE_ page of _PAGES_ page",
            "infoEmpty": "데이터가 없습니다.",
            "infoFiltered": "",
            "search": "<span style='margin-right:10px;'>검색 : </span>"
        },
        "order":[],
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
        const t = $('#mou-table').DataTable();
     
        // mou list를 가져온다.
        $.ajax({
            url: `/admin/mou/data`,
            data: { },
            type: "get",
            success: function (result) {

                // mou list 값을 추출했으면
                if (typeof(result) == 'object') {
                    const faqList = result;

                    // grid에 mou list 추가
                    faqList.forEach(element => {
                        t.row.add([
                            `<span class="text-gray-800 text-hover-primary w-500" style="cursor: pointer" onclick="preventMouActive(${element.id});">${element.name}</span>`,
                            `<span class="text-gray-800 text-hover-primary w-500 mb-0 text-ellipsis" style="cursor: pointer" onclick="preventMouUrlActive('${element.url}');">${element.url}</span>`,
                            `<span sytle="width:100px !important;overflow: hidden;">${element.reg_date}</span>`
                        ]).draw( false );
                    });
                }
                // 오류로 인해 추가되지 않았으면
                else {
                    alert('오류 발생. 잠시 후 다시 요청해주세요.');
                }
            }
        });

        $('#mou-table tbody').on( 'click', 'tr', function () {
            // 링크 이동이 아닐 경우만
            if (mouNotClick) {
                const cl = this.classList.value.split(' ');
                // 선택되어 있다면 선택 취소
                if (cl.includes('selected')) {
                    this.classList.remove('selected');

                    const num = t.row( this ).data()[0].split('preventMouActive(')[1].split(')')[0];
                    const index = mouDeleteList.indexOf(num);

                    if (index > -1) {
                        mouDeleteList.splice(index, 1);
                    } else {}
                    
                }
                // 선택되어 있지 않다면 선택
                else {
                    this.classList.add('selected');
                    mouDeleteList.push( t.row( this ).data()[0].split('preventMouActive(')[1].split(')')[0] );
                    
                }
            }
        } );
    } );

}


/* Function */

function preventMouActive(id) {
    mouNotClick = false;
    location.href = `/admin/mou/update?id=${id}`
}

function preventMouUrlActive(url) {
    mouNotClick = false;
    window.open(url);
}



/* Event */


// 이미지 미리보기

if (mouPreviewImg) {
    mouPreviewImg.addEventListener('change', (e) => {

        const obj = e.target;

        let file_kind = obj.value.lastIndexOf('.');
        let file_name = obj.value.substring(file_kind+1,obj.length);
        let file_type = file_name.toLowerCase();

        let check_file_type=new Array();

        check_file_type=['jpg','gif','png','jpeg','bmp'];

        if(check_file_type.indexOf(file_type)==-1){
            alert('이미지 파일만 선택할 수 있습니다.');
            let parent_Obj=obj.parentNode
            let node=parent_Obj.replaceChild(obj.cloneNode(true),obj);
            
            return false;
        }

        const reader = new FileReader();

        reader.onload = function(event) {
            const img = document.getElementsByClassName("preview-img")[0];
            img.setAttribute("src", event.target.result);
            img.style.display = 'block';
        };

        reader.readAsDataURL(event.target.files[0]);
    });
} else {}

// MOU 추가

if (btnWriteMou) {
    btnWriteMou.addEventListener('click', () => {
        const name = document.getElementById('name');
        const content = document.getElementById('mou_content');
        const url = document.getElementById('url');

        const urlReg = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

        if (name.value == '') {
            alert('기관명을 입력해주세요.');
            name.focus();
        }
        else if (content.value == '') {
            alert('내용을 입력해주세요.');
            content.focus();
        }
        else if (url.value == '') {
            alert('기관 url을 입력해주세요.');
            url.focus();
        }
        else if (name.value.length > 20) {
            alert('기관명을 20자 이하로 설정해주세요.');
            name.focus();
        }
        else if (!urlReg.test(url.value)) {
            alert('올바른 url을 입력해주세요.');
            url.focus();
        }
        else {
            const formData = new FormData(document.getElementById('mou-write'));

            downButton();

            $.ajax({
                url: `/admin/mou/write`,
                data: formData,
                type: "post",
                enctype: 'multipart/form-data',  
                processData: false,    
                contentType: false,
                success: function (result) {

                    // mou가 성공적으로 추가되었으면
                    if (result) {
                        alert('추가 되었습니다.');
                        location.href = '/admin/mou';
                    }

                    // 오류로 인해 삭제되지 않았으면
                    else {
                        alert('오류 발생. 잠시 후 다시 요청해주세요.');
                    }
                }
            });

            operateButton();
        }
    });
}


// MOU 수정

if (btnUpdateMou) {
    btnUpdateMou.addEventListener('click', () => {
        const query = new URLSearchParams(location.search);

        const name = document.getElementById('name');
        const content = document.getElementById('mou_content');
        const url = document.getElementById('url');

        const urlReg = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

        if (name.value == '') {
            alert('기관명을 입력해주세요.');
            name.focus();
        }
        else if (content.value == '') {
            alert('내용을 입력해주세요.');
            content.focus();
        }
        else if (url.value == '') {
            alert('기관 url을 입력해주세요.');
            url.focus();
        }
        else if (name.value.length > 20) {
            alert('기관명을 20자 이하로 설정해주세요.');
            name.focus();
        }
        else if (!urlReg.test(url.value)) {
            alert('올바른 url을 입력해주세요.');
            url.focus();
        }
        else {
            // mou 기관 정보를 수정한다.
            const formData = new FormData(document.getElementById('mou-update'));

            downButton();

            $.ajax({
                url: `/admin/mou/update`,
                data: formData,
                type: "put",
                enctype: 'multipart/form-data',  
                processData: false,    
                contentType: false,
                success: function (result) {

                    // mou가 성공적으로 수정되었으면
                    if (result) {
                        alert('수정 되었습니다.');
                        location.href = '/admin/mou';
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
}


// MOU 삭제

if (btnDeleteMou) {
    btnDeleteMou.addEventListener('click', () => {
        if (mouDeleteList.length != 0) {
            const isDelete = confirm(`${mouDeleteList.length}개 항목을 삭제하시겠습니까?`);
            
            if (isDelete) {

                downButton();

                // mou 기관을 삭제한다.
                $.ajax({
                    url: `/admin/mou/delete`,
                    data: { mouDeleteList },
                    type: "delete",
                    success: function (result) {

                        // mou 기관이 성공적으로 삭제되었으면
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