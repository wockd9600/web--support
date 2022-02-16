//버전1 = 자동 닫기
// ajax

// ajax 적용 후 밑의 내용 적용
$.ajax({
    type: 'GET',
    url: '/front/faq',
    // data:  {
    //     pBD6_Contents: input.value,
    //     pBD_IDs: GetParam('BD_IDs')
    // },
    dataType: "json"
    ,success: function(response) {
        // console.log(response);
        if(response.result != "faq-error") {

            if(response.data != null && response.data.length > 0) {
                // table.row.clear()

                for(var i=0; i<response.data.length; i++) {
                    var content = '' + 
                        '<li>' +
                        '    <div class="head">' +
                        '        <h3>Q</h3>' +
                        '        <a href="javascript:;" class="question" title="내용 보기">' + response.data[i].question + '</a>' +
                        '    </div>' +
                        '    <div class="cont" style="display: none;">' +
                        '        <div class="answer">' +
                        '           ' + response.data[i].answer +  
                        '        </div>' +
                        '    </div>' +
                        '</li>'

                    $("ul[name=ul-list]").append(content);
                }

                var $faq = $('.faq-list');
                var $faq_question = $faq.find('li .head');
            
                $faq_question.on('click', function (e) {
                    e.preventDefault();
            
                    $faq.find('.cont').slideUp();
                    $faq.find('.question').attr('title', '내용 보기');
                    $faq_question.removeClass('faqactive');
            
                    if (!$(this).next().is(':visible')) {
                        $(this).next().slideDown();
                        $(this).find('.question').attr('title', '내용 닫기');
                        $(this).addClass('faqactive');
                    }
                });
            } else {}
        } else {

        }
    }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
        
    }
});