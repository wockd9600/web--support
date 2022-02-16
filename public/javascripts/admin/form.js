// DOM
const formBox = document.querySelector('.form-box');

let checkUnload = false;

// function changeCheckUnload() {
//     checkUnload = true;
// }

if(formBox) {
    window.onbeforeunload=function() {

    if(checkUnload)
        return "페이지를 벗어나면 작성중인 글은 없어집니다.";
    }

    // faq- form
    const faqUpdate = document.getElementById('faq-update');

    if (faqUpdate) {
        faqUpdate.addEventListener('click', () => {
            const tempQuestion = document.querySelector('#title');
            const tempAnswer = document.querySelector('#content');

            if (tempQuestion.value == '') {
                alert('질문을 입력해주세요.');
                tempQuestion.focus();
            }
            else if (tempAnswer.value == '') {
                alert('답변 입력해주세요.');
                tempAnswer.focus();
            }
            else {
                // ajax
                // true
                alert('수정되었습니다.');
                // false
                // alert('오류 발생. 잠시 후 다시 요청해주세요.');
            
                location.href='/admin/faq';
            }
                });
        } else {}

} else {}