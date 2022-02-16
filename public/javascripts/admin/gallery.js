// DOM
const galleryTable = document.getElementById('gallery-table');


// Button
const btnDeleteGallery = document.getElementById('btn-gallery-delete');
const btnUpdateGallery = document.getElementById('btn-gallery-update');
const btnWriteGallery = document.getElementById('btn-gallery-write');


// Variable
let galleryDeleteList = [];
let galleryNotClick = true;




if(galleryTable) {
    $("#gallery-table").DataTable({
        "language": {
            "lengthMenu": "_MENU_개 보기",
            "zeroRecords": "데이터가 없습니다.",
            "info": "_PAGE_ page of _PAGES_ page",
            "infoEmpty": "데이터가 없습니다.",
            "infoFiltered": "",
            "search": "검색: "
        },
        // "order": [[ 1, "desc" ]],
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
        var t = $('#gallery-table').DataTable();
     
        const gallery = location.pathname.split('/')[2];

        // boagalleryrd list를 가져온다.
        $.ajax({
            url: `/admin/${gallery}/data`,
            data: { },
            type: "get",
            success: function (result) {

                // gallery list 값을 추출했으면
                if (typeof(result) == 'object') {
                    const galleryList = result;

                    console.log(result)
                    // grid에 gallery list 추가
                    galleryList.forEach(element => {
                        t.row.add([
                            `<img src="/images/gallery/${element.img_url}.${element.img_type}" style="width: 200px; height: 100px; cursor: pointer; object-fit: cover;" onclick="preventGalleryActive(${element.id});" class="preview-img <% if(spaths.title == '홍보 갤러리') { %>advert-img<% } %>" alt=""/>`,
                            `<span class="text-gray-800 text-hover-primary grid-font" style="cursor: pointer;" onclick="preventGalleryActive(${element.id});">${element.title}</span>`,
                            // `${element.writer}`,
                            `<span class="grid-font" style="font-size: 1.1rem"> ${element.reg_date}</span>`,
                            // `<span style="padding-left: 5px">${element.hit}</span>`
                        ]).draw( false );
                    });
                }
                // 오류로 인해 추가되지 않았으면
                else {
                    alert('오류 발생. 잠시 후 다시 요청해주세요.');
                }
            }
        });

        $('#gallery-table tbody').on( 'click', 'tr', function () {
            // 링크 이동이 아닐 경우만
            if (galleryNotClick) {
                const cl = this.classList.value.split(' ');

                // 선택되어 있다면 선택 취소
                if (cl.includes('selected')) {
                    this.classList.remove('selected');

                    const num = t.row( this ).data()[0].split('preventGalleryActive(')[1].split(')')[0];
                    const index = galleryDeleteList.indexOf(num);

                    if (index > -1) {
                        galleryDeleteList.splice(index, 1);
                    } else {}
                    
                }
                // 선택되어 있지 않다면 선택
                else {
                    this.classList.add('selected');
                    galleryDeleteList.push( t.row( this ).data()[0].split('preventGalleryActive(')[1].split(')')[0] );
                    
                }
            }
        } );
    } );

}


/* Function */


function preventGalleryActive(id) {
    const gallery = location.pathname.split('/')[2];

    galleryNotClick = false;
    location.href = `/admin/${gallery}/update?id=${id}`
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


/* Event */

// 이미지 미리보기


// 파일 업로드시 파일 이름 나열



// 게시글 추가

if (btnWriteGallery) {
    btnWriteGallery.addEventListener('click', () => {
        const title = document.getElementById('name');
        const content = document.getElementById('gallery_content');
        const fileImg = document.getElementById('file-img');

        if (title.value == '') {
            alert('제목을 입력해주세요.');
            title.focus();
        }
        else if (content.value == '') {
            alert('내용을 넣어주세요.');
            content.focus();
        }
        else {
            const gallery = location.pathname.split('/')[2];
            const formData = new FormData(document.getElementById('gallery-write'));
            
            downButton();

            let is_img = false;
            uploadImages.forEach((file) => {
                if(!file.is_delete) {
                    formData.append('files', file)
                    is_img = true;
                } else {}
            });

            if (!is_img) {
                alert('사진을 넣어주세요.');
                fileImg.focus();
                operateButton();
                return 0;
            } else {}

            $.ajax({
                url: `/admin/${gallery}/write`,
                data: formData,
                type: "post",
                enctype: 'multipart/form-data',  
                processData: false,    
                contentType: false,
                success: function (result) {
                    console.log('resut : ' + result)
                    // 이미지가 성공적으로 추가되었으면
                    if (result) {
                        alert('추가 되었습니다.');
                        // location.reload();
                        location.href = `/admin/${gallery}`;
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

// 게시글 수정

if (btnUpdateGallery) {
    btnUpdateGallery.addEventListener('click', () => {
        const query = new URLSearchParams(location.search);

        const title = document.getElementById('name');
        const fileImg = document.getElementById('file-img');

        if (title.value == '') {
            alert('제목을 입력해주세요.');
            title.focus();
        }
        // else if (fileImg.value == '') {
        //     alert('사진을 넣어주세요.');
        //     fileImg.focus();
        // }
        else {
            const gallery = location.pathname.split('/')[2];
            const formData = new FormData(document.getElementById('gallery-update'));

            downButton();

            let d = 0;
            uploadImages.forEach((file) => {
                if(!file.is_delete) {
                    formData.append('files', file)
                } else {
                    d++;
                }
            });

            
            deleteImages.forEach(id => {
                formData.append('deleteImages', id);
            });

            const totalImgCount = document.getElementsByClassName('pv')[0].children.length;
            
            if (totalImgCount == d + deleteImages.length) {
                alert('사진을 넣어주세요.');
                fileImg.focus();
                operateButton();
                return 0;
            } else {}

            $.ajax({
                url: `/admin/${gallery}/update`,
                data: formData,
                type: "put",
                enctype: 'multipart/form-data',  
                processData: false,    
                contentType: false,
                success: function (result) {

                    // 게시글이 성공적으로 수정되었으면
                    if (result) {
                        alert('수정 되었습니다.');
                        location.href = `/admin/${gallery}`;
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

if (btnDeleteGallery) {
    btnDeleteGallery.addEventListener('click', () => {
        if (galleryDeleteList.length != 0) {
            const isDelete = confirm(`${galleryDeleteList.length}개 항목을 삭제하시겠습니까?`);
            
            if (isDelete) {

                const gallery = location.pathname.split('/')[2];

                downButton();

                // 게시글을 삭제한다.
                $.ajax({
                    url: `/admin/${gallery}/delete`,
                    data: { galleryDeleteList },
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

                operateButton();
            } else {}
        }
        else {
            alert('삭제할 항목을 선택해주세요.');
        }
    });
} else {}