"user strict"

// const axios = require('axios');

// Button

const loginButton = document.getElementById('login-button');
const userChangeButton = document.getElementById('user-change-button');
const passwordCheckButton = document.getElementById('password-check-button');


// Evnet



// 관리자 로그인
if (loginButton) {
    loginButton.addEventListener('click', (e) => {
        e.preventDefault();

        const tempId = document.querySelector('#id');
        const tempPwd = document.querySelector('#pwd');
    
        if (tempId.value == '') {
            alert('아이디를 입력해주세요.');
            tempId.focus();
        }
        else if (tempPwd.value == '') {
            alert('비밀번호를 입력해주세요.');
            tempPwd.focus();
        }
        else {
            const userId = tempId.value;
            const userPwd = tempPwd.value;


            // 계정이 맞는지 확인한다.
            // axios.post("/admin/loginAction", {
            //     userId,
            //     userPwd
            // })
            // .then((res) => {
            //     // 비밀번호가 맞다면 페이지 이동
            //     if (res.data) {
            //         location.href = '/admin/main';
            //     }
            //     // 틀리면 알림
            //     else {
            //         alert('아이디 또는 비밀번호를 확인해주세요.');
            //     }
            // })
            // .catch(error => {
            //     alert('접속 불가');
            //     console.log(error);
            // });
            
            $.ajax({
                url: '/admin/loginAction',
                data: {
                    userId,
                    userPwd,
                },
                type: "post",
                success: function (res) {

                    // 비밀번호가 일치하면
                    if (res.data) {
                        location.href = '/admin/main';
                    }

                    // 일치하지 않으면
                    else {
                        alert('아이디 또는 비밀번호를 확인해주세요.');
                    }
                }
            });
        }
    });
} else {}


// 관리자 계정 변경을 위한 비밀번호 확인
if (passwordCheckButton) {
    passwordCheckButton.addEventListener('click', (e) => {
        const tempPwd = document.querySelector('#pwd');

        if (tempPwd.value == '') {
            alert('비밀번호를 입력해주세요.');
            tempPwd.focus();
        }
        else {
            // 비밀번호 확인
            $.ajax({
                url: '/admin/checkPwdAction',
                data: {
                    pwd: tempPwd.value,
                },
                type: "post",
                success: function (result) {

                    // 비밀번호가 일치하면
                    if (result) {
                        location.href = '/admin/changeUser';
                    }

                    // 일치하지 않으면
                    else {
                        alert('비밀번호를 확인해주세요.');
                    }
                }
            });
        }
    });
} else {}


// 관리자 계정 변경
if (userChangeButton) {
    userChangeButton.addEventListener('click', (e) => {
        const tempId = document.getElementById('id');
        const tempPwd = document.getElementById('pwd');
        const tempConfirmPwd = document.getElementById('confirm-pwd')
    
        if (tempId.value == '') {
            alert('아이디를 입력해주세요.');
            tempId.focus();
        }
        else if (tempPwd.value == '') {
            alert('비밀번호를 입력해주세요.');
            tempPwd.focus();
        }
        else if (tempConfirmPwd.value == '') {
            alert('비밀번호 확인을 입력해주세요.');
            tempConfirmPwd.focus();
        }
        else if (tempPwd.value != tempConfirmPwd.value) {
            alert('비밀번호가 일치하지 않습니다.');
            tempConfirmPwd.focus();
        }
        else {
            //관리자 계정 변경
            $.ajax({
                url: '/admin/changeUserAction',
                data: {
                    id: tempId.value,
                    pwd: tempPwd.value,
                    confirmPwd: tempConfirmPwd.value,
                },
                type: "put",
                success: function (result) {

                    // 비밀번호가 일치하면
                    if (result) {
                        alert('관리자 계정이 변경되었습니다. 다시 로그인해 주세요.')
                        location.href = '/admin';
                    }

                    // 일치하지 않으면
                    else {
                        alert('오류. 다시 로그인해 주세요.');
                    }
                }
            });
        }
    });
} else {}



document.getElementById('id').addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        clickLoginButton();
    } else {}
});

document.getElementById('pwd').addEventListener('keydown', (e) => {

    if (e.key == 'Enter') {
        clickLoginButton();
    } else {}
});

function clickLoginButton() {
    document.getElementById('login-button').click();
}