// DOM
const stressResult = document.getElementById('stress-result');

let sscore = 0;
let ascore = 0;
let bscore = 0;
let anscore = 0;

if (stressResult) {
    stressResult.addEventListener('click', () => {
        

        const allCheck = true;

        let sum = 0;
        for (let i=1; i<=10; i++) {
            const stress_q = document.querySelectorAll(`input[name="stress_q${i}"]:checked`);

            if (typeof(stress_q[0]) == 'undefined') {
                alert(`${i}번 항목을 선택해주세요.`)
                document.getElementsByName(`stress_q${i}`)[0].focus();

                allCheck = false;
                return;
            } else {
            }
            
            sum += 5 - parseInt(stress_q[0].value);
        }

        if (!allCheck) {
            return;
        } else {}


        document.getElementsByClassName('test-result')[0].style.display = 'block';
        document.getElementsByClassName('activetab')[0].classList.remove('activetab');

        let resultName = '';

        switch (true) {
            case (sum <= 13):
                resultName = '정상범위';
                break;
            case (sum <= 16):
                resultName = '경도 스트레스';
                break;
            case (sum <= 18):
                resultName = '중등도 스트레스'
                break;
            case (sum < 100):
                resultName = '심한 스트레스'
                break;
            default:
        }
        
        document.getElementsByClassName('test-result')[0].innerHTML = `
                <div class="gg_mind_result">
                    <i class="fa fa-check-circle" aria-hidden="true"></i>
                    본 자가 검사는 자신의 정신건강을 스스로 점검해보기 위해 제공된 것이며, 정신건강의학과 전문의의 진단을 대신할 수 없습니다.
                    <div class="mindtbox">
                    <img src="/images/gg_customer.png" alt="" />
                    <h2>결과보기</h2>
                    <span>
                        스트레스 척도 검진결과는 <span class="pink bold">${sum}</span>점으로,<br>
                        <span class="pink bold">${resultName}</span> 입니다.<br>
                        상담을 원하시는 경우 아래로 문의해 주세요.
                    </span>
                    <div class="lineb"></div>
                    <h2 class="pink">${resultName}</h2>
                    <span>
                        심한 스트레스를 경험하고 있는 것으로 보입니다.<br>
                        최근의 스트레스 요인 등 주변 환경에 대한 점검이 필요할 것으로 보이며,<br>
                        우울이나 불안과 관련된 정신과적 문제로 발전하지 않도록 아래 번호로 연락 주시기 바랍니다.
                    </span>
                    </div>
                    <div class="mindtbox">
                    <img src="/images/gg_love.png" alt="" />
                    <h2>자가 검사 점수기준</h2>
                    <span>
                        0점 ~ 13점 : 정상범위<br>
                        14점 ~ 16점 : 경도 스트레스<br>
                        17점 ~ 18점 : 중등도 스트레스<br>
                        19점 ~ 40점 : 심한 스트레스<br>
                    </span>
                    </div>
                    <div class="tb">
                    <div class="tbcelltop mcall01">
                        <h3>경기도 심리지원센터</h3>
                        <button type="button">031-111-1111</button>
                    </div>
                    <div class="tbcelltop mcall02">
                        <h3>정신건강위기상담전</h3>
                        <button type="button">1577-0199</button>
                    </div>
                    <div class="tbcelltop mcall03">
                        <h3>온라인 상담실</h3>
                        <button type="button">바로가기</button>
                    </div>
                    <div class="tbcelltop mcall04">
                        <h3>자살예방 상담전</h3>
                        <button type="button">1393</button>
                    </div>
                    </div>
                    <div>
                        <button type="button" class="appbtn" onclick="location.href='/online/counsel'">신청하기</button>
                    </div>
                </div>
            `;
    });
} else {}


let stressScore = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

for (let i=1; i<=10; i++) {
    const radios = document.getElementsByName(`stress_q${i}`);
    
    radios.forEach(radio => radio.addEventListener('change', () => {
        const scoreDOM = document.getElementsByClassName('stress_score')[0];
        sscore =  sscore - stressScore[i];
        sscore = sscore + parseInt(radio.value);
        scoreDOM.innerText = parseInt(sscore);
        stressScore[i] = parseInt(radio.value);
    }));
}

let anxietyScore = [0, 0, 0, 0, 0, 0, 0, 0];

for (let i=1; i<=7; i++) {
    const radios = document.getElementsByName(`anxiety_q${i}`);
    
    radios.forEach(radio => radio.addEventListener('change', () => {
        const scoreDOM = document.getElementsByClassName('anxiety_score')[0];
        ascore =  ascore - anxietyScore[i];
        ascore = ascore + parseInt(radio.value);
        scoreDOM.innerText = ascore;
        anxietyScore[i] = parseInt(radio.value);
    }));
}


let bbScore = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

for (let i=1; i<=9; i++) {
    const radios = document.getElementsByName(`blackbile_q${i}`);
    
    radios.forEach(radio => radio.addEventListener('change', () => {
        const scoreDOM = document.getElementsByClassName('bb_score')[0];
        bscore =  bscore - bbScore[i];
        bscore = bscore + parseInt(radio.value);
        scoreDOM.innerText = bscore;
        bbScore[i] = parseInt(radio.value);
    }));
}


let angerScore = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

for (let i=1; i<=12; i++) {
    const radios = document.getElementsByName(`anger_q${i}`);
    
    radios.forEach(radio => radio.addEventListener('change', () => {
        const scoreDOM = document.getElementsByClassName('anger_score')[0];
        anscore =  anscore - angerScore[i];
        anscore = anscore + 1 - parseInt(radio.value);
        scoreDOM.innerText = anscore;
        angerScore[i] = 1 - parseInt(radio.value);
    }));
}
