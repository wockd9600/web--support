const init = {
    monList: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayList: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    today: new Date(),
    calYear: 2021,
    calMonth: 08,
    monForChange: new Date().getMonth(),
    activeDate: new Date(),
    getFirstDay: (yy, mm) => new Date(yy, mm, 1),
    getLastDay: (yy, mm) => new Date(yy, mm + 1, 0),
    nextMonth: function () {
        let d = new Date();
        d.setDate(1);
        d.setMonth(++this.monForChange);
        this.activeDate = d;
        return d;
    },
    prevMonth: function () {
        let d = new Date();
        d.setDate(1);
        d.setMonth(--this.monForChange);
        this.activeDate = d;
        return d;
    },
    addZero: (num) => (num < 10) ? '0' + num : num,
    activeDTag: null,
    getIndex: function (node) {
        let index = 0;
        while (node = node.previousElementSibling) {
            index++;
        }
        return index;
    }
};

// DOM
const calBody = document.querySelector('.ggdays');
const taskBox = document.querySelector('.detailTaskBox');
// const taskBoxLayout = document.querySelector('.layout');

// Button
const btnNext = document.querySelector('.btn-cal-next');
const btnPrev = document.querySelector('.btn-cal-prev');
// const btnSearch = document.querySelector('#btn-search');

let schedules = {};
let selectedDate;

/* Function */

// fullDate에 해당하는 달력 생성
/**
 * @param {date} fullDate
 */
function loadYYMM(fullDate) {
    yy = init.calYear = fullDate.getFullYear();
    mm = init.calMonth = fullDate.getMonth();
    let firstDay = init.getFirstDay(yy, mm);
    let lastDay = init.getLastDay(yy, mm);
    let markToday;

    if (mm === init.today.getMonth() && yy === init.today.getFullYear()) {
        markToday = init.today.getDate();
    } else { }

    // 달력 맨위에 년, 달 표시
    document.getElementsByClassName('month')[0].textContent = init.monList[mm];
    document.getElementsByClassName('year')[0].textContent = yy + "년";

    
    $.ajax({
        type: 'get',
        data: { 
                fullDate: `${yy}-${init.addZero(mm+1)}`,
        },
        url: '/calendar/monthList',
        dataType: "json"
        ,success: function(response) {
            //console.log(response);

            schedules = response.data;
            let startCount;
            let countDay = 0;

            let is_today = false;

            let trtd = '';
            // 달력을 주(week) 단위로 나눠서 구현한다.
            // 달력은 최대 6줄로 표현되므로 (달의 첫 날이 금, 토일에 있는 경우) 6번 반복한다.
            for (let i = 0; i < 6; i++) {
                trtd += '<ul class="gdays">';

                // 한 주는 7개 요일로 표현된다.
                for (let j = 0; j < 7; j++) {
                    // 첫째 주에 해당 달이 아닌 날은 패스한다.  [28 29, 30, 1, 2, 3, 4]에서 28, 29, 30
                    if (i === 0 && !startCount && j === firstDay.getDay()) {
                        startCount = 1;
                    } else {}

                    trtd += '<li';
                        // 달력에 날짜 데이터 삽입
                        // trtd += '<div';
                        // trtd += (markToday && markToday === countDay + 1) ? ' today" ' : '"';
                        // trtd += ` data-date="${countDay + 1}" data-fdate="${fullDate}"><div>`;
                    
                    // 달력에 날짜 텍스트 삽입
                    if (startCount) {
                        countDay++;
                    } else {}

                    let fullDate = yy + '-' + init.addZero(mm + 1) + '-' + init.addZero(countDay);

                    // if (init.today.getDate() == countDay) {
                    //     is_today = true;
                    // } else {
                    //     is_today = false;
                    // }
                    // db에서 업무나 일정 받아와서 넣는 code
                    // console.log(countDay, is_today)
                    if (countDay in schedules) {
                        trtd += `
                                    class="cdon ${is_today ? 'today' : ''} ${j == 0 ? 'sunday' : ''}">
                                        <span class="active">${countDay}</span>`;

                        schedules[countDay].forEach((value, index) => {
                            if (!value.is_done) {
                                trtd += `
                                        <a href="/online/program?id=${value.id}">
                                                ${value.name}
                                        </a>`;
                            } else {
                                trtd += `
                                        <a href="javascript:void(0);" onclick="alert('종료된 프로그램입니다.');">
                                                ${value.name}
                                        </a>`;
                            }
                        });

                        trtd += `</li>`;
                    } else {
                        // if (is_today) {
                        //     trtd += ' class="today" ';
                        // } else {}
                        trtd += (startCount) && (j == 0) ? ' class="sunday"' : '';
                        trtd += (startCount) ? '>' + (countDay) : ' class=\"pvm\">';
                    }

                    if (countDay >= lastDay.getDate()) {
                        startCount = 0;
                        countDay = -1;
                    } else { }

                    // trtd += '</div></li>';
                    trtd += '</li>';
                }

                trtd += '</ul>';
                
                if (countDay >= lastDay.getDate() || countDay == -1) {
                    break;
                } else { }
            }

            document.getElementsByClassName('test')[0].innerHTML = trtd;
            
        }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
        }  
    });
}

// function showProgram(dom) {
//     const fullDate = new Date(dom.getAttribute('data-date'));
//     console.log(fullDate);

//     $.ajax({
//         type: 'get',
//         data: { 
//                 fullDate: `${fullDate.getFullYear()}-${init.addZero(fullDate.getMonth()+1)}-${init.addZero(fullDate.getDate())}`,
//         },
//         url: '/calendar/dayList',
//         dataType: "json"
//         ,success: function(response) {

//         }, error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
//         }  
//     });
// }



// 기본 실행

loadYYMM(init.today, "", "");




/* ---------- Event ---------- */

// 버튼 클릭시 다음, 이전 달 달력을 출력하는 이벤트
btnNext.addEventListener('click', () => loadYYMM(init.nextMonth()));
btnPrev.addEventListener('click', () => loadYYMM(init.prevMonth()));