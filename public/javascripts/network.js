// ajax

// ajax 적용 후 밑의 내용 적용
$.ajax({
    type: 'GET',
    url: '/front/network',
    // data:  {
    //     pBD6_Contents: input.value,
    //     pBD_IDs: GetParam('BD_IDs')
    // },
    dataType: "json"
    ,success: function(response) {
        //console.log(response);
        if(response.result != "network-error") {

            if(response.data != null && response.data.length > 0) {
                // table.row.clear()

                for(var i=0; i<response.data.length; i++) {
                    var content = '' + 
                    '<div class="netwrap" >'
                    + '    <div class="tbcellm nettt">'
                    + '    <h3>' + response.data[i].name + '</h3>'
                    + '    </div>'
                    + '    <div class="tbcellm netadd">'
                    + '    ' + response.data[i].adress
                    + '    </div>'
                    + '    <div class="tbcellm netcont">'
                    + '    ' + response.data[i].phone_number
                    + '    </div>'
                    + '    <div class="tbcellm neturl">'
                    + '         <a href="' + response.data[i].homepage_url + '" target="_blank">바로가기</a>'
                    + '    </div>'
                    + '</div>'

                    $("div[name=div-network-list]").append(content);
                }
            } else {
                
                var content = ''
                + '<div class="netwrap">'
                + '<h3 style="text-align: center; margin-bottom:20px">지역사회 네트워크가 없습니다.<h3>'
                + '</div>'

                $("div[name=div-network-list]").append(content);
            }
        } else {

        }
    }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
        
    }
});