// btn
const btnFirstCounsel = document.getElementById('btn-first-next-counsel');
const btnSecondCounsel = document.getElementById('btn-second-next-counsel');
const btnSecondCounselPre = document.getElementById('btn-second-previous-counsel');
const btnThirdCounselPre = document.getElementById('btn-third-previous-counsel');
const btnApplyCounsel = document.getElementById('btn-apply-counsel');

if (btnFirstCounsel) {
    btnFirstCounsel.addEventListener('click', () => {
        const check = document.getElementById('counsel-info-agree');
    
        if (!check.checked) {
            alert('정보 수집에 동의해주세요.');
        }
        else {
            moveAppPage(2);
        }
    });
} else {}


if (btnSecondCounselPre) {
    btnSecondCounselPre.addEventListener('click', () => {
        moveAppPage(1);
    });
} else {}


if (btnThirdCounselPre) {
    btnThirdCounselPre.addEventListener('click', () => {
        moveAppPage(2);
    });
} else {}


if (btnSecondCounsel) {
    btnSecondCounsel.addEventListener('click', () => {
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


        if (!checkBoxNullCheck('disability')) {
            alert('장애 여부를 선택해주세요.');
            document.getElementsByName('disability')[0].focus();
    
            return;
        } else {}


        if (!checkBoxNullCheck('support')) {
            alert('도움 받고 싶은 영역을 선택해주세요.');
            document.getElementsByName('support')[0].focus();
    
            return;
        } else {}
        

        if (!checkBoxNullCheck('inspect')) {
            alert('검사 영역을 선택해주세요.');
            document.getElementsByName('inspect')[0].focus();
    
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

        moveAppPage(3)
    });
} else {}


if (btnApplyCounsel) {
    btnApplyCounsel.addEventListener('click', () => {
        const check = document.getElementById('counsel-agree');
    
        if (!check.checked) {
            alert('상담 동의서에 동의해주세요.');
        }
        else {
            const category = document.getElementById('category').value;
            const name = document.getElementById('name').value;

            const tempGender = document.getElementsByName('gender'); //c

            let gender = ''
            if (tempGender[0].checked) {
                gender = '남';
            }
            else if (tempGender[1].checked) {
                gender = '여';
            }
            else {
                gender = document.getElementById('gender').value;
            }

            const data = {
                birth: document.getElementById('birth').value,
                age: document.getElementById('age').value,
                adress: document.getElementById('adress').value,
                phone: document.getElementById('phone').value,
                religion: radioValue('religion'), //c
                dwelling: radioValue('dwelling'), // c
                discharge: radioValue('discharge'), //c
                how: radioValue('how'), //c
                second_phone: document.getElementById('second_phone').value,
                counsel_way: checkValue('counsel_way'), //cc
                counsel_exp: radioValue('counsel_exp'),
                counsel_period: document.getElementById('counsel_period').value,
                counsel_category: checkValue('counsel_category'), //cc
                inspect_exp: radioValue('inspect_exp'),
                inspect_date: document.getElementById('inspect_date').value,
                inspect_category: checkValue('inspect_category'), //cc
                family: document.getElementById('family').value,
                condition: radioValue('condition'),
                desease: document.getElementById('desease').value,
                disability: checkValue('disability'), //cc
                support: checkValue('support'), // cc
                inspect: checkValue('inspect'),  //cc
                support_detail: document.getElementById('support_detail').value,
                expect_detail: document.getElementById('expect_detail').value,
                time: checkValue('time'),
            }

            // $.ajax({
            //     url: `/admin/counselApp/write???`,
            //     data: data,
            //     type: "get",
            //     success: function (result) {
    
            //         // 신청서 작성이 완료되었으면
            //         if (typeof(result) == 'object') {
                        
            //         }
            //         // 오류로 인해 완료되지 않았으면
            //         else {
            //             alert('오류 발생. 잠시 후 다시 요청해주세요.');
            //         }
            //     }
            // });
        }
    });
}


// function

function checkValue(name) {
    const temp = document.querySelectorAll(`input[name="${name}"]:checked`);

    if (temp.length != 0) {
        let result = '';

        temp.forEach((data) => {
            if (data.value == '기타') {
                result += document.getElementById(`${name}`).value;
            }
            else {
                result += `, ${data.value}`
            }
        });
        return result.substring(2, result.length);
    }
    else {
        return undefined;
    }
}

function radioValue(name) {
    const temp = document.querySelectorAll(`input[name="${name}"]:checked`);
    
    if (typeof(temp[0]) == 'undefined') {
        return undefined
    } else { }

    if (temp[0].value !== '기타') {
        return temp[0].value;
    }
    else {
        return document.getElementById(`${name}`).value;
    }
}

// counsel move page
function moveAppPage(index) {
    const chapter = document.getElementsByClassName('counsel-chapter');
    
    Object.values(chapter).forEach(element => {
        element.style.display = 'none';
    });
    window.scrollTo(0,0);
    chapter[index-1].style.display = 'block';
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


// const category = document.getElementById('category').value;
//             const name = document.getElementById('name').value;

//             const tempGender = document.getElementsByName('gender'); //c

//             let gender = ''
//             if (tempGender[0].checked) {
//                 gender = '남';
//             }
//             else if (tempGender[1].checked) {
//                 gender = '여';
//             }
//             else {
//                 gender = document.getElementById('gender').value;
//             }
// const birth = document.getElementById('birth').value;
//                 const age = document.getElementById('age').value;
//                 const adress = document.getElementById('adress').value;
//                 const phone = document.getElementById('phone').value;
//                 const religion = radioValue('religion') //c
//                 const dwelling = radioValue('dwelling'); // c
//                 const discharge = radioValue('discharge'); //c
//                 const how = radioValue('how'); //c
//                 const second_phone = document.getElementById('second_phone').value;
//                 const counsel_way = checkValue('counsel_way'); //cc
//                 const counsel_exp = radioValue('counsel_exp');
//                 const counsel_period = document.getElementById('counsel_period').value;
//                 const counsel_category = checkValue('counsel_category'); //cc
//                 const inspect_exp = radioValue('inspect_exp');
//                 const inspect_date = document.getElementById('inspect_date').value;
//                 const inspect_category = checkValue('inspect_category'); //cc
//                 const family = document.getElementById('family').value;
//                 const condition = radioValue('condition');
//                 const desease = document.getElementById('desease').value; 
//                 const disability = checkValue('disability'); //cc
//                 const support = checkValue('support'); // cc
//                 const inspect = checkValue('inspect');  //cc
//                 const support_detail = document.getElementById('support_detail').value;
//                 const expect_detail = document.getElementById('expect_detail').value;