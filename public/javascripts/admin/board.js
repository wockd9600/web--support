// DOM
const boardTable = document.getElementById('board-table');
const galleryTable = document.getElementById('gallery-table');
const inputFile = document.getElementById('file');


// Button
const btnDeleteBoard = document.getElementById('btn-board-delete');
const btnUpdateBoard = document.getElementById('btn-board-update');
const btnWriteBoard = document.getElementById('btn-board-write');


// Variable
let boardDeleteList = [];
let boardNotClick = true;




if(boardTable) {
    $("#board-table").DataTable({
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
        var t = $('#board-table').DataTable();
     
        const board = location.pathname.split('/')[2];

        // board list를 가져온다.
        $.ajax({
            url: `/admin/${board}/data`,
            data: { },
            type: "get",
            success: function (result) {

                // board list 값을 추출했으면
                if (typeof(result) == 'object') {
                    const boardList = result;

                    // grid에 board list 추가
                    boardList.forEach(element => {
                        t.row.add([
                            `<span class="text-gray-800 text-hover-primary w-500" style="cursor: pointer" onclick="preventBoardActive(${element.id});">${element.title}</span>`,
                            `${element.writer}`,
                            `${element.reg_date}`,
                            `<span style="padding-left: 5px">${element.hit}</span>`
                        ]).draw( false );
                    });
                }
                // 오류로 인해 추가되지 않았으면
                else {
                    alert('오류 발생. 잠시 후 다시 요청해주세요.');
                }
            }
        });

        $('#board-table tbody').on( 'click', 'tr', function () {
            // 링크 이동이 아닐 경우만
            if (boardNotClick) {
                const cl = this.classList.value.split(' ');

                // 선택되어 있다면 선택 취소
                if (cl.includes('selected')) {
                    this.classList.remove('selected');

                    const num = t.row( this ).data()[0].split('preventBoardActive(')[1].split(')')[0];
                    const index = boardDeleteList.indexOf(num);

                    if (index > -1) {
                        boardDeleteList.splice(index, 1);
                    } else {}
                    
                }
                // 선택되어 있지 않다면 선택
                else {
                    this.classList.add('selected');
                    boardDeleteList.push( t.row( this ).data()[0].split('preventBoardActive(')[1].split(')')[0] );
                    
                }
            }
        } );
    } );

}



/* Function */


function preventBoardActive(id) {
    const path = location.pathname.split('/');

    boardNotClick = false;
    location.href = `/admin/${path[2]}/update?id=${id}`
}

// 업로드 취소하기
function fileReset(dom) {
    dom.parentNode.removeChild(dom);
    let fileCount = parseInt(document.getElementsByClassName('file-count-value')[0].innerText);

    const deleteFileName = dom.children[0].innerText;
    const index = currentFiles.indexOf(deleteFileName);
    
    if (index > -1) {
        currentFiles.splice(index, 1);
        currentFilesUrl.splice(index, 1);
        currentFilesSize.splice(index, 1);
    } else {}

    fileCount -= 1;

    const filecount = document.getElementsByClassName('file-count-value')[0];
    filecount.innerText = fileCount;
}

function bytesToSize(bytes) { // 1
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 }

function popFile(id, upload=false) {
    document.getElementsByClassName(`fileIndex${id}`)[0].style.display = 'none';
    document.getElementsByClassName('file-count-value')[0].innerText -= 1;
    if(upload) {
        deleteFiles.push(id);
    } else {
        uploadFiles[id].is_delete = true;
    }
}


/* Event */

// 이미지 미리보기

const uploadFiles = [];
const deleteFiles = [];
let fileIndex = 0;
// 파일 업로드시 파일 이름 나열
if (inputFile) {
    inputFile.addEventListener('change', () => {
        
        const tempFiles = inputFile.files;
        const fileList = document.getElementById('file-list');

        const fileCount = document.getElementsByClassName('file-count-value')[0];
        // fileList.innerHTML = '';


        let fc = parseInt(fileCount.innerText);

        tempFiles.forEach((file) => {
            const size = bytesToSize(file.size);

            // formData.append("many", file);
            // 파일 하나당 input에 넣어서 저장하기
            //js로 input file에 위의 file 업로드

            fileList.innerHTML += `
                <div class="mb-4 fileIndex${fileIndex}" style="display: flex;">
                    <div class="d-flex align-items-center mb-n1">
                        <span class="bullet me-3"></span>
                        <a href="javascript:void(0)" style="cursor: default;"><div class="text-gray-600 fw-bold fs-6">${file.name}<span>(${size})</span></div></a>
                        <div class="cancel" onclick="popFile(${fileIndex++})"></div>
                    </div>
                </div>
                `;
                // <p style="margin-top: 4px; margin-right: 2px; font-size: 1.2rem;">${file.name}</p>
                // <p style="margin-top: 8px; margin-right: 2px; font-size: 1rem;">(${size})</p>
                // <div class="cancel cancel"></div>
                    
                uploadFiles.push(file);
                fc++;
        });

        // formData가 비어있지 않으면
        // if (formData.has('many')) {
        //     $.ajax({
        //         type: "post",
        //         url: "/admin/uploads",
        //         data: formData,
        //         processData: false,
        //         contentType: false,
        //         success: function (result) {
        //             const dataUrl = JSON.parse(result[0]);
        //             const dataName = JSON.parse(result[1]);
        //             const dataSize = JSON.parse(result[2]);
    
        //             // 파일이 성공적으로 업로드되었으면
        //             if (dataUrl) {
        //                 for (let i = 0; i < dataUrl.length; i++) {
        //                     uploadFiles.push(dataUrl[i])
        //                     currentFiles.push(dataName[i]);
        //                     currentFilesUrl.push(dataUrl[i]);
        //                     currentFilesSize.push(dataSize[i]);
        //                 }
    
        //                 inputFile.value = '';
        //             }
    
        //             // 오류로 인해 업로드되지 않았으면
        //             else {
        //                 alert('오류 발생. 잠시 후 다시 요청해주세요.');
        //             }
        //         }
        //     });
        // } else {}

        fileCount.innerText = fc;
        inputFile.value = '';
    });
} else {}


// $.ajax({
//     url: `/admin/research/write/test`,
//     type: 'post',
//     data: {},
//     //enctype:'multipart/form-data',
//     contentType: false,
//     processData: false,
//     dataType: 'json',
//     cache:false,
//     success: function (result) {

//         // mou가 성공적으로 추가되었으면
//         if (result) {
//             alert('추가 되었습니다.');
//             location.href = `/admin/${board}`;
//         }

//         // 오류로 인해 삭제되지 않았으면
//         else {
//             alert('오류 발생. 잠시 후 다시 요청해주세요.');
//         }
//     }
// });


// 게시글 추가

if (btnWriteBoard) {
    btnWriteBoard.addEventListener('click', () => {
        const title = document.getElementById('title');
        const writer = document.getElementById('writer');
        const content = window.editor.getData();

        if (title.value == '') {
            alert('제목을 입력해주세요.');
            title.focus();
        }
        else if (writer.value == '') {
            alert('작성자를 입력해주세요.');
            writer.focus();
        }
        else if (content == '') {
            alert('내용을 입력해주세요.');
            window.editor.focus();
        }
        else {
            const board = location.pathname.split('/')[2];
            const formData = new FormData(document.getElementById('board-write'));
            formData.append('contentValue', window.editor.getData());

            downButton();

            uploadFiles.forEach((file) => {
                if(!file.is_delete) {
                    formData.append('files', file)
                } else {}
            });

            $.ajax({
                url: `/admin/${board}/write`,
                type: 'post',
                data: formData,
                //enctype:'multipart/form-data',
                contentType: false,
                processData: false,
                dataType: 'json',
                cache:false,
                success: function (result) {

                    // mou가 성공적으로 추가되었으면
                    if (result) {
                        alert('추가 되었습니다.');
                        location.href = `/admin/${board}`;
                    }

                    // 오류로 인해 삭제되지 않았으면
                    else {
                        alert('오류 발생. 잠시 후 다시 요청해주세요.');
                    }
                }
            });

            operateButton();
            // axios.post(`/admin/${board}/write`, formData)
            // .then(function (response) {
            //     if (response) {
            //         alert('추가 되었습니다.');
            //         location.href = `/admin/${board}`;
            //     }

            //     // 오류로 인해 삭제되지 않았으면
            //     else {
            //         alert('오류 발생. 잠시 후 다시 요청해주세요.');
            //     } 
            // }).catch(function (error) {
            //     console.log(error);
            // }).then(function() {
            //     console.log('then');
            // });
        }
    });
}


// 게시글 수정

if (btnUpdateBoard) {
    btnUpdateBoard.addEventListener('click', () => {
        const board = location.pathname.split('/')[2];
        const query = new URLSearchParams(location.search);

        const title = document.getElementById('title');
        const writer = document.getElementById('writer');
        const content = window.editor.getData();

        if (title.value == '') {
            alert('제목을 입력해주세요.');
            title.focus();
        }
        else if (writer.value == '') {
            alert('작성자를 입력해주세요.');
            writer.focus();
        }
        else if (content == '') {
            alert('내용을 입력해주세요.');
            content.focus();
        }
        else {

            const board = location.pathname.split('/')[2];
            const formData = new FormData(document.getElementById('board-update'));
            formData.append('contentValue', window.editor.getData());

            downButton();

            uploadFiles.forEach((file) => {
                if(!file.is_delete) {
                    formData.append('files', file)
                } else {}
            });

            console.log(deleteFiles)
            deleteFiles.forEach(id => {
                formData.append('deleteFiles', id);
            });

            $.ajax({
                url: `/admin/${board}/update`,
                data: formData,
                type: "put",
                enctype: 'multipart/form-data',  
                processData: false,    
                contentType: false,
                success: function (result) {

                    // 게시글이 성공적으로 수정되었으면
                    if (result) {
                        alert('수정 되었습니다.');
                        location.href = `/admin/${board}`;
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


// 게시글 삭제

if (btnDeleteBoard) {
    btnDeleteBoard.addEventListener('click', () => {
        if (boardDeleteList.length != 0) {
            const isDelete = confirm(`${boardDeleteList.length}개 항목을 삭제하시겠습니까?`);
            
            if (isDelete) {
                const board = location.pathname.split('/')[2];

                downButton();

                // 게시글을 삭제한다.
                $.ajax({
                    url: `/admin/${board}/delete`,
                    data: { boardDeleteList },
                    type: "delete",
                    success: function (result) {

                        // 게시글 성공적으로 삭제되었으면
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
            } else {}
        }
        else {
            alert('삭제할 항목을 선택해주세요.');
        }
        operateButton();
    });
} else {}