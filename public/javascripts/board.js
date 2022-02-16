// getBoardData();

function getBoardData() {
    // ajax
    // ajax 적용 후 밑의 내용 적용
    const path = location.pathname.split('/');
    let board = '';

    if (path[1] == 'research') {
        board = path[1];
    } else {
        board = path[2];
    }
    $.ajax({
        type: 'GET',
        url: `/front/${board}/data`,
        // data:  {
        //     pBD6_Contents: input.value,
        //     pBD_IDs: GetParam('BD_IDs')
        // },
        dataType: "json"
        ,success: function(response) {
            //console.log(response);
            
            if(response.result != `board-error`) {

                if(response.data != null && response.data.length > 0) {
                    // table.row.clear()
                    let html = '';
                    
                    Object.values(response.data).forEach((data) => {
                        const is_new = data.is_new ? '<span class="new">NEW</span>' : '';

                        const url = board !== 'research' ? `/commu/${board}/detail?id=${data.id}` : `/research/detail?id=${data.id}`
                        html += `
                            <li class="lt1 ep">
                            <a href="${url}">
                                <span class="ltnum">${data.id}</span>
                                <span class="tBox">
                                    <strong>${data.title}</strong>
                                    ${is_new}
                                </span>
                                <span class="ltdate">${data.reg_date}</span>
                            </a>
                        </li>
                        `;
                    });

                    document.getElementsByClassName('rank')[0].innerHTML = html;
                } else {}
            } else {

            }
        }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
            
        }
    });
}


function getBoardDataPage(page) {
    // ajax
    // ajax 적용 후 밑의 내용 적용
    const path = location.pathname.split('/');
    let board = '';

    if (path[1] == 'research') {
        board = path[1];
    } else {
        board = path[2];
    }
    $.ajax({
        type: 'GET',
        url: `/front/${board}/data/page`,
        data:  {
            page
        },
        dataType: "json"
        ,success: function(response) {
            console.log(response);
            
            if(response.result != `board-error`) {

                if(response.data != null && response.data.length > 0) {
                    // table.row.clear()
                    let html = '';
                    
                    Object.values(response.data).forEach((data) => {
                        const is_new = data.is_new ? '<span class="new">NEW</span>' : '';

                        const url = board !== 'research' ? `/commu/${board}/detail?id=${data.id}` : `/research/detail?id=${data.id}`
                        html += `
                            <li class="lt1 ep">
                            <a href="${url}">
                                <span class="ltnum">${data.id}</span>
                                <span class="tBox">
                                    <strong>${data.title}</strong>
                                    ${is_new}
                                </span>
                                <span class="ltdate">${data.reg_date}</span>
                            </a>
                        </li>
                        `;
                    });

                    document.getElementsByClassName('rank')[0].innerHTML = html;
                } else {}
            } else {

            }
        }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
            
        }
    });
}

function boardFilter(page, board) {
    const query = new URLSearchParams(location.search);
    const search = query.get('search')
    const cate = query.get('cate')

    if (board == 'research') {
        location.href = `/research?page=${page}&search=${search}&cate=${cate}`;
    } else {
        location.href = `/commu/${board}?page=${page}&search=${search}&cate=${cate}`;
    }
}