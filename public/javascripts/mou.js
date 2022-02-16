// ajax

// ajax 적용 후 밑의 내용 적용
$.ajax({
    type: 'GET',
    url: '/front/mou',
    // data:  {
    //     pBD6_Contents: input.value,
    //     pBD_IDs: GetParam('BD_IDs')
    // },
    dataType: "json"
    ,success: function(response) {
        //console.log(response);
        if(response.result != "mou-error") {

            if(response.data != null) {
                // table.row.clear()

                if(response.data.length > 0) {
                    for(var i=0; i<response.data.length; i++) {

                        var img_url = `${response.data[i].img_name}`;

                        if(img_url == undefined || img_url == "" || img_url == "unknown") {
                            img_url = "/images/empty.png";
                        } else {
                            img_url = "/images/mou/" + img_url + "." + response.data[i].img_type;
                        }

                        var content = ''
                        + '<div class="mouwrap">'
                        + '    <div class="moulft tbcelltop">'
                        + '        <div class="thumbnail-wrap-main relative">'
                        + '        <div class="thumbnail-main">'
                        + '            <div class="centered">'
                        + '            <img src="' + img_url + '" class="portrait">'
                        + '            </div>'
                        + '        </div>'
                        + '        </div>'
                        + '    </div>'
                        + '    <div class="mourgt tbcelltop">'
                        + '        <div class="moutt">'
                        + '        <h2>' + response.data[i].name + '</h2>'
                        + '        </div>'
                        + '        <div class="moucon">'
                        +              response.data[i].content
                        + '        </div>'
                        + '        <div class="mouurl">'
                        + '        <a target="_blank" href="' + response.data[i].url + '">홈페이지</a>'
                        + '        </div>'
                        + '    </div>'
                        + '</div>'

                        $("div[name=div-mou-list]").append(content);
                    }
                } else {
                    var content = ''
                        + '<div class="mouwrap">'
                        + '<h3 style="text-align: center; margin-bottom:20px">MOU 기관이 없습니다.<h3>'
                        + '</div>'

                        $("div[name=div-mou-list]").append(content);
                }
            } else {}
        } else {

        }
    }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
        
    }
});