// DOM
const networkTable = document.getElementById('network-table');


// Button
const btnWriteNetwork = document.getElementById('btn-network-write');
const btnUpdateNetwork = document.getElementById('btn-network-update');
const btnDeleteNetwork = document.getElementById('btn-network-delete');


// Variable
let networkDeleteList = [];
let networkNotClick = true;


if(networkTable) {
    $("#network-table").DataTable({
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
        var t = $('#network-table').DataTable();
     
        // network list를 가져온다.
        $.ajax({
            url: `/admin/network/data`,
            data: { },
            type: "get",
            success: function (result) {

                // network list 값을 추출했으면
                if (typeof(result) == 'object') {
                    const networkList = result;

                    // grid에 network list 추가
                    networkList.forEach(element => {
                        t.row.add([
                            `<span class="text-gray-800 text-hover-primary w-500" style="cursor: pointer" onclick="preventNetworkActive(${element.id});">${element.name}</span>`,
                            `${element.adress}`,
                            `${element.phone_number}`,
                            `<span class="text-gray-800 text-hover-primary w-200 mb-0 text-ellipsis" style="cursor: pointer" onclick="preventNetworkUrlActive('${element.homepage_url}');">${element.homepage_url}</span>`,
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

        $('#network-table tbody').on( 'click', 'tr', function () {
            // 링크 이동이 아닐 경우만
            console.log(networkNotClick)
            if (networkNotClick) {
                const cl = this.classList.value.split(' ');
                // 선택되어 있다면 선택 취소
                if (cl.includes('selected')) {
                    this.classList.remove('selected');

                    const num = t.row( this ).data()[0].split('preventNetworkActive(')[1].split(')')[0];
                    const index = networkDeleteList.indexOf(num);

                    if (index > -1) {
                        networkDeleteList.splice(index, 1);
                    } else {}
                    
                }
                // 선택되어 있지 않다면 선택
                else {
                    this.classList.add('selected');
                    networkDeleteList.push( t.row( this ).data()[0].split('preventNetworkActive(')[1].split(')')[0] );
                    
                }
            }
        } );
    } );

}


/* Function */

function preventNetworkActive(id) {
    networkNotClick = false;
    location.href = `/admin/network/update?id=${id}`
}

function preventNetworkUrlActive(url) {
    networkNotClick = false;
    window.open(url);
}



/* Event */

const autoHyphen = (target) => {
    target.value = target.value
      .replace(/[^0-9]/, '')
      .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
   }

// network 추가

if (btnWriteNetwork) {
    btnWriteNetwork.addEventListener('click', () => {
        const name = document.getElementById('name');
        const adress = document.getElementById('adress');
        const phoneNumber = document.getElementById('phone-number');
        const url = document.getElementById('homepage_url');

        const phoneReg = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/
        const orderPhoneReg = /^(0(2|3[1-3]|4[1-4]|5[1-5]|6[1-4]))-(\d{3,4})-(\d{4})$/
        const urlReg = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

        if (name.value == '') {
            alert('협력체명을 입력해주세요.');
            name.focus();
        }
        else if (adress.value == '') {
            alert('협력체 주소를 입력해주세요.');
            adress.focus();
        }
        else if (phoneNumber.value == '') {
            alert('협력체 번호를 입력해주세요.');
            phoneNumber.focus();
        }
        else if (url.value == '') {
            alert('협력체 홈페이지 주소을 입력해주세요.');
            url.focus();
        }
        else if (name.value.length > 20) {
            alert('협력체명을 20자 이하로 설정해주세요.');
            name.focus();
        }
        else if (!phoneReg.test(phoneNumber.value) && !orderPhoneReg.test(phoneNumber.value)) {
            alert('올바른 번호를 입력해주세요.');
            phoneNumber.focus();
        }
        else if (!urlReg.test(url.value)) {
            alert('올바른 url을 입력해주세요.');
            url.focus();
        }
        else {
            downButton();

            // network 기관을 추가한다.
            $.ajax({
                url: `/admin/network/write`,
                data: {
                    name: name.value,
                    adress: adress.value,
                    phoneNumber: phoneNumber.value,
                    url: url.value,
                },
                type: "post",
                success: function (result) {

                    // 성공적으로 추가되었으면
                    if (result) {
                        alert('추가되었습니다.');
                        location.href = `/admin/network`
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


// netwrok 수정

if (btnUpdateNetwork) {
    btnUpdateNetwork.addEventListener('click', () => {
        const query = new URLSearchParams(location.search);

        const name = document.getElementById('name');
        const adress = document.getElementById('adress');
        const phoneNumber = document.getElementById('phone-number');
        const url = document.getElementById('homepage_url');

        const phoneReg = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/
        const orderPhoneReg = /^(0(2|3[1-3]|4[1-4]|5[1-5]|6[1-4]))-(\d{3,4})-(\d{4})$/
        const urlReg = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

        if (name.value == '') {
            alert('협력체명을 입력해주세요.');
            name.focus();
        }
        else if (adress.value == '') {
            alert('협력체 주소를 입력해주세요.');
            adress.focus();
        }
        else if (phoneNumber.value == '') {
            alert('협력체 번호를 입력해주세요.');
            phoneNumber.focus();
        }
        else if (url.value == '') {
            alert('협력체 홈페이지 주소을 입력해주세요.');
            url.focus();
        }
        else if (name.value.length > 20) {
            alert('협력체명을 20자 이하로 설정해주세요.');
            name.focus();
        }
        else if (!phoneReg.test(phoneNumber.value) && !orderPhoneReg.test(phoneNumber.value)) {
            alert('올바른 번호를 입력해주세요.');
            phoneNumber.focus();
        }
        else if (!urlReg.test(url.value)) {
            alert('올바른 url을 입력해주세요.');
            url.focus();
        }
        else {

            downButton();

            // network 기관 정보를 수정한다.
            $.ajax({
                url: `/admin/network/update`,
                data: {
                    id: query.get('id'),
                    name: name.value,
                    adress: adress.value,
                    phoneNumber: phoneNumber.value,
                    url: url.value,
                },
                type: "put",
                success: function (result) {

                    // 성공적으로 추가되었으면
                    if (result) {
                        alert('수정되었습니다.');
                        location.href = `/admin/network`
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


// netwrok 삭제

if (btnDeleteNetwork) {
    btnDeleteNetwork.addEventListener('click', () => {
        if (networkDeleteList.length != 0) {
            const isDelete = confirm(`${networkDeleteList.length}개 항목을 삭제하시겠습니까?`);
            
            if (isDelete) {

                downButton();

                // network 기관을 삭제한다.
                $.ajax({
                    url: `/admin/network/delete`,
                    data: { networkDeleteList },
                    type: "delete",
                    success: function (result) {

                        // network 기관이 성공적으로 삭제되었으면
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