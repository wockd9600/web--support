// DOM
const btnReviewWrite = document.getElementsByClassName('review-write')[0];
const btnReviewUpdate = document.getElementsByClassName('review-update')[0];

if (btnReviewWrite) {
    btnReviewWrite.addEventListener('click', (e) => {
        e.preventDefault();

        const wname = document.getElementsByName('wname')[0];

        if (wname.value == '') {
            alert('이름을 입력해주세요.');
            wname.focus();
            
            return;
        } else {}

        const wpw = document.getElementsByName('wpw')[0];

        if (wpw.value == '') {
            alert('비밀번호를 입력해주세요.');
            wpw.focus();
            
            return;
        } else {}

        const wtt = document.getElementsByName('wtt')[0];

        if (wtt.value == '') {
            alert('제목을 입력해주세요.');
            wtt.focus();
            
            return;
        } else {}

        const wcon = document.getElementsByName('wcon')[0];

        if (wcon.value == '') {
            alert('내용을 입력해주세요.');
            wcon.focus();
            
            return;
        } else {
            $.ajax({
                url: `/commu/review/write`,
                data: {
                    title: wtt.value,
                    writer: wname.value,
                    content: wcon.value,
                    pwd: wpw.value,
                },
                type: "post",
                success: function(response) {
                    //console.log(response);
                    console.log(response.data)
                    if(response.result != `board-error`) {
        
                        if(response.data != null && response.data > 0) {
                            alert('후기 작성이 완료되었습니다.');
                            console.log(response.data)
                            location.href = `/commu/review/detail?id=${response.data}`
                        } else {
                            alert('오류 발생')
                        }
                    } else {
                        alert('오류 발생')
    
                    }
                }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
                    
                }
            });
        }
    });
}

if (btnReviewUpdate) {
    btnReviewUpdate.addEventListener('click', (e) => {
        e.preventDefault();

        const wname = document.getElementsByName('wname')[0];

        if (wname.value == '') {
            alert('이름을 입력해주세요.');
            wname.focus();
            
            return;
        } else {}

        const wpw = document.getElementsByName('wpw')[0];

        if (wpw.value == '') {
            alert('비밀번호를 입력해주세요.');
            wpw.focus();
            
            return;
        } else {}

        const wtt = document.getElementsByName('wtt')[0];

        if (wtt.value == '') {
            alert('제목을 입력해주세요.');
            wtt.focus();
            
            return;
        } else {}

        const wcon = document.getElementsByName('wcon')[0];

        if (wcon.value == '') {
            alert('내용을 입력해주세요.');
            wcon.focus();
            
            return;
        } else {
            const query = new URLSearchParams(location.search);

            $.ajax({
                url: `/commu/review/update`,
                data: {
                    id: query.get('id'),
                    title: wtt.value,
                    writer: wname.value,
                    content: wcon.value,
                    pwd: wpw.value,
                },
                type: "post",
                success: function(response) {
                    //console.log(response);
                    console.log(response.data)
                    if(response.result != `review-error`) {
        
                        if(response.data != null) {
                            alert('후기 수정이 완료되었습니다.');
                            location.href = `/commu/review/detail?id=${response.data}`
                        } else {
                            alert('오류 발생')
                        }
                    } else {
                        alert('오류 발생')
    
                    }
                }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
                    
                }
            });
        }
    });
}