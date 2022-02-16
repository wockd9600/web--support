
window.onload = function() {
    // ajax 적용 후 밑의 내용 적용
$.ajax({
    type: 'GET',
    url: '/front/notice',
    // data:  {
    //     pBD6_Contents: input.value,
    //     pBD_IDs: GetParam('BD_IDs')
    // },
    dataType: "json"
    ,success: function(response) {
        //console.log(response);
        if(response.result != "notice-error") {

            if(response.data != null) {
                if (response.data.length > 0) {
                    // table.row.clear()

                    for(var i=0; i<response.data.length; i++) {
                        var content = '' + 
                        '<li class="lt1 ep">'
                        + '    <a href="' + "/commu/notice/detail?id=" + response.data[i].id + '">'
                        + '        <span class="tBox">'
                        + '            ' + response.data[i].title
                        + '        </span>'
                        + '        <span class="ggmdate">' + response.data[i].reg_date.substr(0,10) + '</span>'
                        + '    </a>'
                        + '</li>'

                        $("ul[name=ul-notice-list]").append(content);
                    }
                } else {
                    var content = '공지사항이 없습니다.' 

                    $("ul[name=ul-notice-list]").append(content);
                }
            } else {}
        } else {

        }
    }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
        
    }
});

$.ajax({
    type: 'GET',
    url: '/front/program',
    // data:  {
    //     pBD6_Contents: input.value,
    //     pBD_IDs: GetParam('BD_IDs')
    // },
    dataType: "json"
    ,success: function(response) {
        //console.log(response);
        if(response.result != "program-error") {

            if(response.data != null) {
                if(response.data.length > 0) {
                // table.row.clear()

                    for(var i=0; i<response.data.length; i++) {
                        var content = '' + 
                        '<li class="lt1 ep">'
                        + '    <a href="' + "/online/program?id=" + response.data[i].id + '">'
                        + '        <span class="tBox">'
                        + '            ' + response.data[i].name
                        + '        </span>'
                        + '        <span class="ggmdate">' + response.data[i].day + '</span>'
                        + '    </a>'
                        + '</li>'

                        $("ul[name=ul-program-list]").append(content);
                    }
                } else {
                    var content = '프로그램 일정이 없습니다.' 

                    $("ul[name=ul-program-list]").append(content);
                }
            } else {}
        } else {

        }
    }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
        
    }
});

$.ajax({
    type: 'GET',
    url: '/front/advert',
    // data:  {
    //     pBD6_Contents: input.value,
    //     pBD_IDs: GetParam('BD_IDs')
    // },
    dataType: "json"
    ,success: function(response) {
        //console.log(response);
        if(response.result != "advert-error") {

            if(response.data != null) {
                if(response.data.length > 0) {
                    // table.row.clear()
                    const data = response.data;

                    const slide = document.getElementsByClassName('slide-in')[0];
                    const dot = document.getElementsByClassName('ggslide_btn')[0];

                    slide.innerHTML = '';
                    dot.innerHTML = '';

                    for(let i=0; i<response.data.length; i++) {
                        const disp = i == 0 ? "" : "style=\"display: none\";";
                        const acti = i == 0 ? "active" : "";
                        var content = `
                            <div class="mySlides fade" ${disp}>
                                <a href="/commu/advertGallery/detail?id=${data[i].id}">
                                <img width="500px" height="500px" src="/images/gallery/${data[i].img_url}.${data[i].img_type}" alt="놀러오세요 속마음의 숲" />
                                </a>
                            </div>
                        `;

                        slide.innerHTML += content;

                        dot.innerHTML += `<span class="dot ${acti}" onclick="currentSlide(${i+1})"></span>`
                    }
                } else {
                // 여기 빈 이미지 넣어야함.
                    var content = '' 

                    $("ul[name=ul-program-list]").append(content);
                }
            } else {}
        } else {

        }
    }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
        
    }
});

$.ajax({
    type: 'GET',
    url: '/front/banner',
    // data:  {
    //     pBD6_Contents: input.value,
    //     pBD_IDs: GetParam('BD_IDs')
    // },
    dataType: "json"
    ,success: function(response) {
        //console.log(response);
        if(response.result != "advert-error") {

            if(response.data != null) {
                if(response.data.length > 0) {
                    // table.row.clear()
                    const data = response.data;

                    const banner = document.getElementsByClassName('gg_ccompany_in')[0];

                    banner.innerHTML = '';

                    let i = 0;
                    for(i=0; i<response.data.length; i++) {
                        var content = `
                            <li><a href="${data[i].url}"><img src="images/banner/${data[i].img_name}.${data[i].img_type}" style="width: 248px; height: 29px;" alt="협력사 배너1" /></a></li>
                        `;

                        banner.innerHTML += content;
                    }
                    while ( i < 4 ) {
                        var content = `
                            <li><a href=""></a></li>
                        `;

                        banner.innerHTML += content;
                        i++;
                    }
                } else {
                    var content = '' ;

                    $("ul[name=ul-program-list]").append(content);
                }
            } else {}
        } else {

        }
    }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
        
    }
});
}