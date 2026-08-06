// 중개사 복습 — 화면. 규칙은 전부 핵심.js에 있고 여기서는 그리기만 한다.

const 단원들 = (window.단원자료 || []).map((단원) => ({ ...단원 }));
const 문제있는단원들 = 단원들.filter((ㄱ) => ㄱ.문제들.length > 0);
const 전체묶음 = 문제있는단원들.flatMap(묶음나누기);
const 묶음찾기 = new Map(전체묶음.map((묶) => [묶.키, 묶]));
// 주소에는 이름 대신 순번을 쓴다. 묶음키에 '|'와 '#'가 들어 있어 주소에 그대로 못 넣는다.
const 묶음차례 = new Map(전체묶음.map((묶, 순번) => [묶.키, 순번]));
const 묶음주소 = (묶음키) => `풀기/${묶음차례.get(묶음키)}`;

const 뿌리 = document.getElementById('뿌리');
const 번호표 = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

// ── 잔심부름 ────────────────────────────────────────────────
const 안전글 = (글) =>
  String(글).replace(/[&<>"']/g, (ㄱ) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ㄱ])
  );

const 요일 = ['일', '월', '화', '수', '목', '금', '토'];
function 날짜말(밀리) {
  const 날 = new Date(밀리);
  return `${날.getMonth() + 1}/${날.getDate()}(${요일[날.getDay()]})`;
}
const 짧은날짜말 = (밀리) => {
  const 날 = new Date(밀리);
  return `${날.getMonth() + 1}/${날.getDate()}`;
};
function 일시말(밀리) {
  const 날 = new Date(밀리);
  const 두자리 = (수) => String(수).padStart(2, '0');
  return `${날짜말(밀리)} ${두자리(날.getHours())}:${두자리(날.getMinutes())}`;
}
function 초를말로(초) {
  const 분 = Math.floor(초 / 60);
  const 나머지 = Math.floor(초 % 60);
  if (분 > 0 && 나머지 > 0) return `${분}분 ${나머지}초`;
  if (분 > 0) return `${분}분`;
  return `${나머지}초`;
}
const 시계말 = (초) =>
  `${Math.floor(초 / 60)}:${String(Math.floor(초 % 60)).padStart(2, '0')}`;
const 회차말 = (회차) => (회차 === 0 ? '추가 연습' : 회차 === 1 ? '1차 학습' : `${회차}차 복습`);
const 막대 = (백분율) => {
  const 찬칸 = Math.round(Math.min(100, Math.max(0, 백분율)) / 10);
  return '█'.repeat(찬칸) + '░'.repeat(10 - 찬칸);
};
const 날짜입력값 = (밀리) => {
  const 날 = new Date(밀리);
  const 두자리 = (수) => String(수).padStart(2, '0');
  return `${날.getFullYear()}-${두자리(날.getMonth() + 1)}-${두자리(날.getDate())}`;
};

/** 단원의 회차별 점수를 "8/4 1차 88점 · 8/7 2차 92점"으로.
 *  단원 안에 묶음이 여럿이라 회차마다 그 회차를 마친 묶음들의 평균을 낸다. */
function 회차점수줄(단원) {
  const 회차별 = new Map();
  묶음나누기(단원).forEach((묶) => {
    저장소.회차별기록(묶.키).forEach((기) => {
      const 칸 = 회차별.get(기.회차) || { 점수들: [], 마지막: 0 };
      if (기.평균점수 !== null && 기.평균점수 !== undefined) 칸.점수들.push(기.평균점수);
      칸.마지막 = Math.max(칸.마지막, 기.일시밀리);
      회차별.set(기.회차, 칸);
    });
  });
  return [...회차별.entries()]
    .sort((ㄱ, ㄴ) => ㄱ[0] - ㄴ[0])
    .map(([회차, 칸]) => {
      const 평균 = 칸.점수들.length
        ? 칸.점수들.reduce((ㄱ, ㄴ) => ㄱ + ㄴ, 0) / 칸.점수들.length
        : null;
      return `${짧은날짜말(칸.마지막)} ${회차}차 ${점수말(평균)}`;
    })
    .join(' · ');
}

// ── 화면 이동 ───────────────────────────────────────────────
function 이동(주소) {
  location.hash = 주소;
}

function 그리기() {
  // location.hash는 한글을 %EA%B3%84... 로 돌려주므로 풀어서 봐야 한다
  let 길 = '집';
  try {
    길 = decodeURIComponent(location.hash.slice(1)) || '집';
  } catch (오류) {
    길 = '집';
  }
  const 자리 = 길.indexOf('/');
  const 화면 = 자리 < 0 ? 길 : 길.slice(0, 자리);
  const 값 = 자리 < 0 ? '' : 길.slice(자리 + 1);
  window.scrollTo(0, 0);
  if (화면 === '묶음') 묶음목록화면(값);
  else if (화면 === '풀기') 풀기화면(값);
  else if (화면 === '결과') 결과화면();
  else if (화면 === '계획') 계획화면();
  else if (화면 === '기록') 기록화면();
  else 집화면();
}

window.addEventListener('hashchange', 그리기);

// ── 집(첫 화면) ─────────────────────────────────────────────
function 집화면() {
  const 현 = 현황계산(전체묶음);
  const 조각 = [];

  조각.push(오늘할일카드(현));

  단원들.forEach((단원, 순번) => {
    const 앞단원 = 단원들[순번 - 1];
    if (!앞단원 || 앞단원.과목 !== 단원.과목) {
      const 있는수 = 단원들.filter((ㄱ) => ㄱ.과목 === 단원.과목 && ㄱ.문제들.length).length;
      const 전체수 = 단원들.filter((ㄱ) => ㄱ.과목 === 단원.과목).length;
      조각.push(`<h2 class="부제목">${안전글(단원.과목)} <span class="흐림">(${있는수}/${전체수})</span></h2>`);
    }
    조각.push(단원줄(단원));
  });

  뿌리.innerHTML = `
    <header class="머리">
      <h1>중개사 복습</h1>
      <div class="머리단추">
        <button class="선단추" onclick="이동('계획')">🗓 그냥 풀자</button>
        <button class="선단추" onclick="이동('기록')">🔁 풀고 또 풀자</button>
      </div>
    </header>
    ${조각.join('')}
    <p class="꼬리">전체 ${현.전체문제수}문제 · ${현.전체묶음수}묶음</p>
  `;
}

function 오늘할일카드(현) {
  if (!현.전체묶음수) return '<p class="흐림">아직 문제가 없습니다.</p>';

  if (!현.계획) {
    return `<section class="카드">
      <h2>🗓 1회독 목표일을 정해 주세요</h2>
      <p class="흐림">전체 ${현.전체문제수}문제(${현.전체묶음수}묶음)입니다.<br>
        목표일을 정하면 하루에 풀 묶음을 정해 드립니다.</p>
      <button class="찬단추" onclick="이동('계획')">학습계획 세우기</button>
    </section>`;
  }

  const 할일들 = 현.오늘할일들;
  const 첫할일 = 할일들[0];
  const 제목 = 할일들.length
    ? `📌 오늘 할 일 ${할일들.length}묶음 (${현.오늘문제수}문제)`
    : '오늘 할 일 — 다 끝냈습니다 🎉';
  const 설명 = 할일들.length
    ? `복습 ${현.복습할일들.length}묶음 · 새 진도 ${현.새할일들.length}묶음`
    : 현.회독끝
      ? `${현.계획.회독}회독을 다 마쳤습니다!`
      : '오늘 몫은 끝났습니다. 푹 쉬세요.';

  const 단추 = 첫할일
    ? `<button class="찬단추" onclick="이동('${묶음주소(첫할일.묶.키)}')">
         시작: ${안전글(첫할일.묶.단원.이름)} ${안전글(첫할일.묶.짧은이름)}
         (${첫할일.복습회차 ? `${첫할일.복습회차}차 복습` : '새 진도'})
       </button>`
    : `<button class="선단추" onclick="이동('계획')">학습계획 보기</button>`;

  return `<section class="카드">
    <h2>${제목}</h2>
    <p class="흐림">${설명}<br>
      <span class="막대">${막대(현.진행률)}</span>
      ${현.계획.회독}회독 ${현.푼묶음수}/${현.전체묶음수}묶음 (${현.진행률}%)
      ${현.목표지남 ? '<br><span class="빨강">⚠ 목표일이 지났습니다</span>' : ''}</p>
    ${단추}
  </section>`;
}

function 단원줄(단원) {
  if (!단원.문제들.length) {
    return `<div class="줄 흐림더">
      <div class="줄제목">${안전글(단원.이름)}</div>
      <div class="줄설명">아직 문제 없음${단원.총문항 ? ` (책에는 ${단원.총문항}문항)` : ''}</div>
    </div>`;
  }
  const 묶음들 = 묶음나누기(단원);
  const 완료 = 묶음들.filter((묶) => 저장소.완주횟수(묶.키) > 0).length;
  const 지금 = Date.now();
  const 복습 = 묶음들.filter((묶) =>
    저장소.남은일정(묶.키).some((ㄱ) => ㄱ.예정밀리 < 지금 + 하루밀리)
  ).length;

  const 조각들 = [`문제 ${단원.문제들.length}개 · ${묶음들.length}묶음`];
  조각들.push(완료 === 묶음들.length ? '다 풀었습니다 ✅' : `${완료}/${묶음들.length}묶음 완료`);
  if (복습) 조각들.push(`복습할 묶음 ${복습}`);

  const 점수줄 = 회차점수줄(단원);
  return `<div class="줄 누름" onclick="이동('묶음/${단원들.indexOf(단원)}')">
    <div class="줄제목">${안전글(단원.이름)}</div>
    <div class="줄설명">${조각들.join(' · ')}</div>
    ${점수줄 ? `<div class="줄점수">${안전글(점수줄)}</div>` : ''}
  </div>`;
}

// ── 묶음 목록 ───────────────────────────────────────────────
function 묶음목록화면(순번글) {
  const 단원 = 단원들[Number(순번글)];
  if (!단원 || !단원.문제들.length) return 이동('집');
  const 묶음들 = 묶음나누기(단원);
  const 지금 = Date.now();

  const 줄들 = 묶음들.map((묶) => {
    const 완주 = 저장소.완주횟수(묶.키);
    const 남은문제 = 미숙달문제들(묶).length;
    const 다음일정 = 저장소.남은일정(묶.키)[0];
    const 급함 = 다음일정 && 다음일정.예정밀리 < 지금 + 하루밀리 && 남은문제 > 0;

    const 설명 = [`${묶.문제들.length}문제`];
    if (!완주) 설명.push('아직 안 풀었습니다');
    else 설명.push(남은문제 === 0 ? '모두 숙달 ✅' : `복습할 문제 ${남은문제}개`);

    const 일정줄 = 완주 && 다음일정
      ? `<div class="줄설명 ${다음일정.예정밀리 < 지금 ? '빨강' : ''}">
           다음: ${다음일정.회차}차 복습 ${날짜말(다음일정.예정밀리)}
           ${다음일정.예정밀리 < 지금 ? '⚠ 오늘 하세요' : ''}</div>`
      : '';
    const 점수줄 = 저장소.회차별기록(묶.키)
      .map((기) => `${짧은날짜말(기.일시밀리)} ${기.회차}차 ${점수말(기.평균점수)}`)
      .join(' · ');

    return `<div class="줄 누름 ${급함 ? '급함' : ''}"
                 onclick="이동('${묶음주소(묶.키)}')">
      <div class="줄제목">${안전글(묶.짧은이름)}</div>
      <div class="줄설명">${설명.join(' · ')}</div>
      ${일정줄}
      ${점수줄 ? `<div class="줄점수">${안전글(점수줄)}</div>` : ''}
    </div>`;
  });

  뿌리.innerHTML = `
    <header class="머리">
      <button class="뒤로" onclick="이동('집')">← 목록</button>
      <h1>${안전글(단원.이름)}</h1>
    </header>
    <p class="흐림">${안전글(단원.과목)} · 문제 ${단원.문제들.length}개를
      ${묶음들.length}묶음으로 나눴습니다. 묶음을 눌러 푸세요.</p>
    ${줄들.join('')}
  `;
}

// ── 문제 풀기 ───────────────────────────────────────────────
let 풀이 = null;   // 지금 풀고 있는 상태

function 풀기화면(순번글) {
  const 묶 = 전체묶음[Number(순번글)];
  if (!묶) return 이동('집');

  // 복습이면 아직 숙달하지 않은 문제만 낸다.
  // 다 숙달했는데도 직접 눌러 들어온 경우엔 전체를 다시 푼다(추가 연습).
  const 처음인가 = 저장소.완주횟수(묶.키) === 0;
  const 남은문제들 = 미숙달문제들(묶);
  const 낼문제들 = 처음인가 || !남은문제들.length ? 묶.문제들 : 남은문제들;

  풀이 = {
    묶,
    문제들: [...낼문제들],
    이전이력: 저장소.문제기록전체(),
    현재번호: 0,
    정답수: 0,
    오답번호들: [],
    결과들: 낼문제들.map(() => null),
    쌓인초들: 낼문제들.map(() => 0),   // 건너뛴 문제가 쓴 시간을 모아 둔다
    넘긴적: 낼문제들.map(() => false),
    고른순번: -1,
    누적밀리: 0,
    구간시작: Date.now(),
    문제시작밀리: 0,
    마무리됨: false,
  };
  문제그리기();
  시계시작();
}

function 경과밀리() {
  return 풀이.누적밀리 + (풀이.구간시작 ? Date.now() - 풀이.구간시작 : 0);
}
const 이번문제초 = () => Math.floor((경과밀리() - 풀이.문제시작밀리) / 1000);

let 시계표 = null;
function 시계시작() {
  clearInterval(시계표);
  시계표 = setInterval(시계그리기, 250);
}
function 시계멈춤() {
  clearInterval(시계표);
  시계표 = null;
}

// 화면을 벗어나면 시계를 멈춘다 (전화 오면 억울하지 않게)
document.addEventListener('visibilitychange', () => {
  if (!풀이 || 풀이.마무리됨) return;
  if (document.hidden) {
    풀이.누적밀리 = 경과밀리();
    풀이.구간시작 = 0;
    시계멈춤();
  } else {
    풀이.구간시작 = Date.now();
    시계시작();
  }
});

function 시계그리기() {
  if (!풀이) return 시계멈춤();
  const 전체칸 = document.getElementById('전체시계');
  const 문제칸 = document.getElementById('문제시계');
  if (!전체칸 || !문제칸) return;
  전체칸.textContent = 시계말(경과밀리() / 1000);
  const 초 = 이번문제초();
  문제칸.textContent =
    풀이.고른순번 < 0 ? `이 문제 ${초}초 · ${문제점수(true, 초)}점` : `이 문제 ${초}초`;
  문제칸.className = 초 > 90 ? '문제시계 빨강' : 초 > 60 ? '문제시계 주황' : '문제시계 초록';
}

function 문제그리기() {
  const { 묶, 문제들, 현재번호 } = 풀이;
  풀이.고른순번 = -1;
  풀이.문제시작밀리 = 경과밀리() - (풀이.쌓인초들[현재번호] || 0) * 1000;
  const 문제 = 문제들[현재번호];
  const 넘길수있나 = !풀이.넘긴적[현재번호];

  뿌리.innerHTML = `
    <div class="시계줄">
      <span class="진행">${현재번호 + 1} / ${문제들.length}</span>
      <span id="문제시계" class="문제시계 초록"></span>
      <span id="전체시계" class="전체시계">0:00</span>
    </div>
    <p class="흐림작게">${안전글(묶.단원.이름)} ${안전글(묶.짧은이름)} ·
      ${배점안내}</p>

    <article class="지면">
      <div class="문제머리">
        <span class="문제번호">${String(현재번호 + 1).padStart(2, '0')}</span>
        <div class="문제몸">
          ${질문HTML(문제.질문)}
        </div>
      </div>
      <ol class="보기목록">
        ${문제.보기.map((글, 순번) =>
          `<li><button class="보기" data-순번="${순번}">
             <span class="보기번호">${번호표[순번] || 순번 + 1}</span>
             <span class="보기글">${안전글(글)}</span>
           </button></li>`
        ).join('')}
      </ol>
    </article>

    <div id="넘김칸" class="넘김칸">
      ${넘길수있나
        ? '<button class="넘김단추" id="넘김단추">건너뛰기 (뒤에서 다시 냅니다)</button>'
        : '<p class="흐림작게가운데">이미 한 번 건너뛴 문제입니다. 답을 골라 주세요.</p>'}
    </div>
    <div id="해설칸"></div>
    <button class="뒤로가운데" onclick="그만두기()">그만두기</button>
  `;
  document.querySelectorAll('.보기').forEach((단추) => {
    단추.addEventListener('click', () => 답고르기(Number(단추.dataset.순번)));
  });
  const 넘김 = document.getElementById('넘김단추');
  if (넘김) 넘김.addEventListener('click', 건너뛰기);
  시계그리기();
}

/**
 * 질문 글을 문제집 지면처럼 나눠 그린다.
 * 문제집은 발문 아래에 ㉠㉡㉢ 지문을 네모 상자로 따로 싣는데, 우리 자료도
 * 발문 다음에 빈 줄을 두고 지문이 이어지는 형태라 그대로 갈라 쓸 수 있다.
 */
function 질문HTML(질문) {
  const 조각 = 질문.split(/\n\s*\n/);
  const 발문 = 조각[0];
  const 지문 = 조각.slice(1).join('\n').trim();

  // "(36회)", "(28회 수정)", "(36회 대표기출)" 같은 회차 표시는 문제집처럼 오른쪽에 작게
  const 회차맞음 = 발문.match(/\s*\(([^()]*\d+회[^()]*)\)\s*$/);
  const 본문 = 회차맞음 ? 발문.slice(0, 회차맞음.index).trim() : 발문.trim();
  const 회차 = 회차맞음 ? 회차맞음[1] : '';

  return `
    <p class="발문">${강조HTML(본문)}</p>
    ${회차 ? `<p class="회차">• ${안전글(회차)}</p>` : ''}
    ${지문 ? `<div class="지문상자">${안전글(지문).replace(/\n/g, '<br>')}</div>` : ''}
  `;
}

/**
 * 문제집은 발문에서 '틀린 / 옳은 / 아닌' 같은 판단 낱말만 굵게+밑줄로 찍는다.
 * 그 낱말을 놓쳐서 틀리는 일이 많아서다. 똑같이 그 낱말만 강조한다.
 */
function 강조HTML(글) {
  return 안전글(글).replace(
    /(옳지 않은|틀린|옳은|아닌|모두 고른)/g,
    '<strong>$1</strong>'
  );
}

function 답고르기(누른순번) {
  if (풀이.고른순번 >= 0) return;
  const { 묶, 문제들, 현재번호 } = 풀이;
  const 문제 = 문제들[현재번호];
  const 걸린초 = 이번문제초();
  const 맞음 = 누른순번 + 1 === 문제.정답;

  풀이.고른순번 = 누른순번;
  풀이.결과들[현재번호] = { 문제, 맞음, 걸린초 };
  if (맞음) 풀이.정답수++;
  else 풀이.오답번호들.push(현재번호 + 1);

  document.querySelectorAll('.보기').forEach((단추, 순번) => {
    단추.disabled = true;
    if (순번 + 1 === 문제.정답) 단추.classList.add('정답');
    else if (순번 === 누른순번) 단추.classList.add('오답');
  });
  const 넘김칸 = document.getElementById('넘김칸');
  if (넘김칸) 넘김칸.innerHTML = '';   // 답을 골랐으면 건너뛰기는 감춘다

  const 딴점수 = 문제점수(맞음, 걸린초);
  document.getElementById('해설칸').innerHTML = `
    <div class="판정 ${맞음 ? '초록' : '빨강'}">
      ${맞음 ? '⭕ 정답!' : `❌ 오답 — 정답은 ${번호표[문제.정답 - 1] || 문제.정답}`}
      ${딴점수}점 <span class="흐림">${안전글(숙달안내(묶, 문제, 맞음, 걸린초))}</span>
    </div>
    <div class="해설">${안전글(문제.해설 || '(해설 없음)').replace(/\n/g, '<br>')}</div>
    <button class="찬단추" id="다음단추">
      ${현재번호 === 문제들.length - 1 ? '결과 보기' : '다음 문제'}
    </button>
  `;
  document.getElementById('다음단추').addEventListener('click', 다음으로);
  document.getElementById('해설칸').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** 이 답으로 이 문제가 복습에서 빠지는지 한 줄로 알려 준다 */
function 숙달안내(묶, 문제, 맞음, 걸린초) {
  if (!맞음) return '→ 다음 복습에 다시 나옵니다';
  const 새연속 = (풀이.이전이력[문제키(묶.단원, 문제)]?.연속정답 ?? 0) + 1;
  if (걸린초 <= 숙달기준초) return `⚡ ${걸린초}초 — 이제 복습에서 빠집니다`;
  if (새연속 >= 숙달연속횟수) return `🏅 연속 ${새연속}번째 정답 — 이제 복습에서 빠집니다`;
  return `연속 ${새연속}번째 정답 (${숙달연속횟수}번이면 제외)`;
}

/**
 * 건너뛰기: 이 문제를 이번 묶음의 맨 뒤로 미룬다 (2026-08-06 사장님 요청).
 * 지금까지 이 문제에 쓴 시간은 쌓아 두었다가 다시 왔을 때 이어서 잰다.
 * 같은 문제는 한 번만 건너뛸 수 있다.
 */
function 건너뛰기() {
  if (풀이.고른순번 >= 0) return;
  const 자리 = 풀이.현재번호;
  풀이.쌓인초들[자리] = 이번문제초();
  풀이.넘긴적[자리] = true;

  // 이 문제를 맨 뒤로 옮기고, 딸린 값들도 같이 옮긴다
  const 옮길것 = {
    문제: 풀이.문제들[자리],
    쌓인초: 풀이.쌓인초들[자리],
    넘김: true,
  };
  풀이.문제들.splice(자리, 1);
  풀이.쌓인초들.splice(자리, 1);
  풀이.넘긴적.splice(자리, 1);
  풀이.결과들.splice(자리, 1);
  풀이.문제들.push(옮길것.문제);
  풀이.쌓인초들.push(옮길것.쌓인초);
  풀이.넘긴적.push(true);
  풀이.결과들.push(null);

  // 자리를 뺐으므로 현재번호는 그대로 두면 다음 문제를 가리킨다
  if (풀이.현재번호 >= 풀이.문제들.length) 풀이.현재번호 = 0;
  문제그리기();
}

function 다음으로() {
  if (풀이.고른순번 < 0) return;
  if (풀이.현재번호 >= 풀이.문제들.length - 1) 마무리();
  else {
    풀이.현재번호++;
    문제그리기();
  }
}

function 그만두기() {
  if (!confirm('여기서 그만두면 이번 기록은 저장되지 않습니다.\n그만둘까요?')) return;
  시계멈춤();
  풀이 = null;
  이동('집');
}

let 마지막결과 = null;

function 마무리() {
  if (풀이.마무리됨) return;   // 두 번 눌러도 기록이 두 번 저장되지 않게
  풀이.마무리됨 = true;
  시계멈춤();

  const { 묶, 결과들, 정답수, 오답번호들 } = 풀이;
  const 걸린초 = Math.floor(경과밀리() / 1000);
  const 평균 = 평균점수계산(결과들);
  const 처음인가 = 저장소.완주횟수(묶.키) === 0;
  // 복습 회차는 '완주 횟수'가 아니라 복습 일정표를 보고 정한다
  const 복습회차 = 처음인가 ? null : 저장소.이번복습회차(묶.키);
  const 기록회차 = 처음인가 ? 1 : 복습회차 ?? 0;

  // 문제별 정답·시간을 먼저 반영해야 남은 문제 수가 제대로 계산된다
  저장소.결과반영(묶.단원, 결과들);
  const 남은수 = 미숙달문제들(묶).length;

  저장소.기록추가({
    묶음키: 묶.키,
    과목: 묶.단원.과목,
    목차이름: 묶.단원.이름,
    묶음이름: 묶.짧은이름,
    일시밀리: Date.now(),
    걸린초,
    문제수: 결과들.length,
    정답수,
    회차: 기록회차,
    평균점수: 평균,
  });
  if (처음인가) 저장소.일정만들기(묶);
  else if (복습회차) 저장소.일정완료표시(묶.키, 복습회차);
  // 전부 숙달했으면 남은 일정을 지운다(다시 내 봐야 볼 문제가 없다)
  if (남은수 === 0) 저장소.일정삭제(묶.키);

  마지막결과 = { 묶음키: 묶.키, 걸린초, 문제수: 결과들.length, 정답수, 평균, 회차: 기록회차, 남은수, 오답번호들 };
  풀이 = null;
  이동('결과');
}

// ── 결과 ────────────────────────────────────────────────────
function 결과화면() {
  if (!마지막결과) return 이동('집');
  const ㄱ = 마지막결과;
  const 묶 = 묶음찾기.get(ㄱ.묶음키);
  const 현 = 현황계산(전체묶음);
  const 다음할일 = 현.오늘할일들[0];

  const [판정글, 판정색] =
    ㄱ.평균 >= 90 ? ['⚡ 최고입니다! 대부분 30초 안에 맞혔습니다.', '초록']
    : ㄱ.평균 >= 75 ? ['👍 좋습니다. 조금만 더 빠르게!', '초록']
    : ㄱ.평균 >= 50 ? ['🙂 보통입니다. 틀린 문제 해설을 꼭 보세요.', '주황']
    : ㄱ.평균 >= 0 ? ['⏰ 시간이 걸렸습니다. 다음엔 문제당 1분을 노려 보세요.', '주황']
    : ['❌ 오답이 많습니다. 해설을 보고 다시 풀어 보세요.', '빨강'];

  const 총문제수 = 묶 ? 묶.문제들.length : ㄱ.문제수;
  const 다음일정 = 저장소.남은일정(ㄱ.묶음키)[0];
  const 일정줄 =
    ㄱ.남은수 === 0 ? '이 묶음은 모두 숙달했습니다! 🎉 더 안 나옵니다.'
    : 다음일정 ? `다음 복습: ${날짜말(다음일정.예정밀리)} (${다음일정.회차}차)`
    : `예정된 복습을 모두 마쳤습니다. 아직 ${ㄱ.남은수}문제가 남았으니 가끔 다시 보세요.`;

  const 다음단추 = 다음할일
    ? `<button class="찬단추" onclick="이동('${묶음주소(다음할일.묶.키)}')">
         다음: ${안전글(다음할일.묶.짧은이름)}
         (${다음할일.복습회차 ? `${다음할일.복습회차}차 복습` : '새 진도'})
       </button>`
    : `<button class="선단추" onclick="이동('${묶음주소(ㄱ.묶음키)}')">이 묶음 다시 풀기</button>`;

  뿌리.innerHTML = `
    <header class="머리"><h1>결과</h1></header>
    <p class="흐림">${묶 ? `${안전글(묶.단원.과목)} · ${안전글(묶.단원.이름)} ${안전글(묶.짧은이름)}` : ''}</p>
    <h2>${회차말(ㄱ.회차)} 완료</h2>
    <div class="큰점수">${점수말(ㄱ.평균)}</div>
    <p class="흐림가운데">평균점수 (30초 90점 · 1분 60점 · 90초 10점 · 90초 초과 감점(정답이면 +10))<br>
      걸린 시간 ${초를말로(ㄱ.걸린초)} · 문제당 평균 ${초를말로(Math.floor(ㄱ.걸린초 / Math.max(1, ㄱ.문제수)))}</p>
    <p class="판정 ${판정색}">${판정글}</p>
    <p class="가운데">정답률 ${ㄱ.정답수}/${ㄱ.문제수}</p>
    <p class="흐림가운데">${ㄱ.오답번호들.length
      ? `틀린 문제: ${ㄱ.오답번호들.join(', ')}번 — 해설을 다시 봐 두세요`
      : '틀린 문제 없음 — 전부 정답! 🎉'}</p>
    <section class="카드">
      <p>🏅 이 묶음 숙달: ${총문제수 - ㄱ.남은수}/${총문제수}문제
        <span class="흐림">(20초 안에 정답 또는 연속 5회 정답 — 복습에서 제외)</span></p>
      <p>${일정줄}</p>
      <p>${!현.계획 ? '학습계획을 세우면 하루치를 정해 드립니다.'
        : 현.오늘할일들.length ? `📌 오늘 남은 할 일: ${현.오늘할일들.length}묶음 (${현.오늘문제수}문제)`
        : '📌 오늘 할 일을 다 끝냈습니다! 푹 쉬세요.'}</p>
    </section>
    ${다음단추}
    <button class="선단추" onclick="이동('집')">목록으로</button>
  `;
}

// ── 학습계획(그냥 풀자) ──────────────────────────────────────
function 계획화면() {
  const 현 = 현황계산(전체묶음);
  const 조각 = [`<header class="머리">
      <button class="뒤로" onclick="이동('집')">← 목록</button>
      <h1>그냥 풀자</h1></header>`];

  if (!현.전체묶음수) {
    뿌리.innerHTML = `${조각.join('')}<p class="흐림">아직 문제가 없습니다.</p>`;
    return;
  }

  if (!현.계획) {
    조각.push(`<h2>🗓 1회독 목표일을 정해 주세요</h2>
      <p class="흐림">1회독은 PART 1부터 PART 4까지 전체를 한 번 도는 것입니다.<br>
      전체 ${현.전체문제수}문제를 ${현.전체묶음수}묶음(묶음당 5문제 안팎)으로 나눠 뒀습니다.<br>
      목표일을 정하면 하루에 풀 묶음을 정해 드립니다.</p>`);
    [30, 60, 90].forEach((일수) => {
      const 하루 = Math.ceil(현.전체묶음수 / 일수);
      const 문제 = Math.ceil(현.전체문제수 / 일수);
      조각.push(`<button class="선단추" onclick="목표일빠르게(${일수})">
        ${일수}일 안에 — 하루 ${하루}묶음(약 ${문제}문제)</button>`);
    });
    조각.push(날짜고르기칸(Date.now() + 59 * 하루밀리, false));
    뿌리.innerHTML = 조각.join('');
    날짜칸붙이기();
    return;
  }

  const 계 = 현.계획;
  조각.push(`<h2>🗓 ${계.회독}회독 계획</h2>
    <p class="${현.목표지남 ? '빨강' : '흐림'}">목표일 ${날짜말(계.목표일밀리)}
      ${현.목표지남 ? '⚠ 지났습니다' : `· ${현.남은일수}일 남음`}</p>
    <div class="큰점수">${현.푼묶음수} / ${현.전체묶음수}묶음</div>
    <p class="흐림가운데"><span class="막대">${막대(현.진행률)}</span> ${현.진행률}%
      (전체 ${현.전체문제수}문제)</p>`);

  if (현.회독끝) {
    조각.push(`<p>🎉 ${계.회독}회독을 다 마쳤습니다!<br>
      다음 회독을 시작하면 처음부터 다시 계획을 세웁니다.</p>`);
    조각.push(날짜고르기칸(Date.now() + 59 * 하루밀리, true));
  } else {
    조각.push('<h2>📌 오늘 할 일</h2>');
    if (!현.오늘할일들.length) {
      조각.push('<p>오늘 몫은 끝났습니다. 푹 쉬세요! 🎉</p>');
    } else {
      조각.push(`<p class="흐림">복습 ${현.복습할일들.length}묶음 · 새 진도 ${현.새할일들.length}묶음
        = 모두 ${현.오늘할일들.length}묶음 (${현.오늘문제수}문제)<br>
        위에서부터 순서대로 누르시면 됩니다. 복습이 먼저입니다.</p>`);
      현.오늘할일들.forEach((할일) => {
        const 낼수 = 할일.복습회차 ? 미숙달문제들(할일.묶).length : 할일.묶.문제들.length;
        조각.push(`<div class="줄 누름 ${할일.복습회차 ? '급함' : ''}"
             onclick="이동('${묶음주소(할일.묶.키)}')">
          <div class="줄제목">${할일.복습회차 ? `🔁 ${할일.복습회차}차 복습` : '🆕 새 진도'}
            ${안전글(할일.묶.단원.이름)}</div>
          <div class="줄설명">${안전글(할일.묶.짧은이름)} · ${낼수}문제</div>
        </div>`);
      });
    }
    if (현.목표지남) {
      조각.push(`<p class="흐림">목표일이 지나서 남은 ${현.남은묶음수}묶음을 오늘 몫으로 잡았습니다.
        목표일을 다시 정하셔도 됩니다.</p>`);
    }
    조각.push(시작지점칸(현));
    조각.push(날짜고르기칸(계.목표일밀리, false));
  }

  뿌리.innerHTML = 조각.join('');
  날짜칸붙이기();
  시작칸붙이기();
}

/** 새 진도를 어디부터 나갈지 고르는 칸 (2026-08-06 사장님 요청) */
function 시작지점칸(현) {
  const 지금키 = 현.계획?.시작묶음키;
  const 지금묶 = 지금키 ? 묶음찾기.get(지금키) : null;
  const 고르개 = 문제있는단원들.map((단원) => {
    const 첫묶 = 묶음나누기(단원)[0];
    const 골랐나 = 지금묶 && 지금묶.단원 === 단원;
    return `<option value="${묶음차례.get(첫묶.키)}" ${골랐나 ? 'selected' : ''}>
      ${안전글(단원.과목)} · ${안전글(단원.이름)}</option>`;
  }).join('');
  return `<div class="날짜칸">
    <label>새 진도를 시작할 곳
      <select id="시작칸">${고르개}</select>
    </label>
    <p class="흐림작게">지금: ${지금묶 ? 안전글(`${지금묶.단원.과목} · ${지금묶.단원.이름}`) : '맨 앞(01 권리의 변동)'}
      — 고른 곳부터 순서대로 나가고, 끝까지 가면 앞쪽으로 돌아옵니다.</p>
    <button class="선단추" id="시작단추">여기부터 새 진도 나가기</button>
  </div>`;
}

function 시작칸붙이기() {
  const 단추 = document.getElementById('시작단추');
  if (!단추) return;
  단추.addEventListener('click', () => {
    const 차례 = Number(document.getElementById('시작칸').value);
    const 묶 = 전체묶음[차례];
    if (!묶) return;
    저장소.시작지점정하기(묶.키);
    계획화면();
  });
}

function 날짜고르기칸(기준밀리, 다음회독) {
  const 오늘 = 자정밀리();
  const 보일밀리 = Math.max(기준밀리, 오늘);
  return `<div class="날짜칸">
    <label>${다음회독 ? '다음 회독 목표일' : '목표일'}
      <input type="date" id="목표일칸" value="${날짜입력값(보일밀리)}" min="${날짜입력값(오늘)}">
    </label>
    <button class="${다음회독 ? '찬단추' : '선단추'}" id="목표일단추"
      data-다음회독="${다음회독 ? '1' : ''}">
      ${다음회독 ? '다음 회독 시작하기' : '이 날짜로 정하기'}</button>
  </div>`;
}

function 날짜칸붙이기() {
  const 단추 = document.getElementById('목표일단추');
  if (!단추) return;
  단추.addEventListener('click', () => {
    const 값 = document.getElementById('목표일칸').value;
    if (!값) return alert('날짜를 골라 주세요');
    // 그 날 정오로 잡아 시간대 차이로 하루가 밀리는 걸 막는다
    const 밀리 = new Date(`${값}T12:00:00`).getTime();
    if (단추.dataset.다음회독) 저장소.다음회독시작(밀리);
    else 저장소.목표일정하기(밀리);
    계획화면();
  });
}

function 목표일빠르게(일수) {
  저장소.목표일정하기(자정밀리(일수 - 1) + 12 * 3600 * 1000);
  계획화면();
}

// ── 기록(풀고 또 풀자) ───────────────────────────────────────
function 기록화면() {
  const 조각 = [`<header class="머리">
      <button class="뒤로" onclick="이동('집')">← 목록</button>
      <h1>풀고 또 풀자</h1></header>`];

  조각.push(`<h2>🏅 단원별 진행과 회차 점수</h2>
    <p class="흐림">점수: 30초 90점 · 1분 60점 · 90초 10점 · 90초 초과 감점(정답이면 +10)<br>
      20초 안에 맞혔거나 연속 5번 맞힌 문제는 복습에서 빠집니다.</p>`);

  let 푼단원있음 = false;
  문제있는단원들.forEach((단원) => {
    const 묶음들 = 묶음나누기(단원);
    const 완료 = 묶음들.filter((묶) => 저장소.완주횟수(묶.키) > 0).length;
    if (!완료) return;
    푼단원있음 = true;
    const 남은문제 = 묶음들.reduce((합, 묶) => 합 + 미숙달문제들(묶).length, 0);
    const 숙달 = 단원.문제들.length - 남은문제;
    const 점수줄 = 회차점수줄(단원);
    조각.push(`<div class="줄">
      <div class="줄제목">${안전글(단원.과목)} · ${안전글(단원.이름)}</div>
      <div class="줄설명">${완료}/${묶음들.length}묶음 완료 · 숙달 ${숙달}/${단원.문제들.length}문제
        ${남은문제 === 0 ? ' — 모두 숙달 ✅' : ''}</div>
      ${점수줄 ? `<div class="줄점수">${안전글(점수줄)}</div>` : ''}
    </div>`);
  });
  if (!푼단원있음) 조각.push('<p class="흐림">아직 끝까지 푼 묶음이 없습니다.</p>');

  조각.push('<h2>📅 다가오는 복습</h2>');
  const 남은 = 저장소.남은일정();
  if (!남은.length) {
    조각.push(`<p class="흐림">예정된 복습이 없습니다.<br>
      묶음 하나를 처음 끝내면 3·7·15·30일 뒤 일정이 잡힙니다.</p>`);
  } else {
    const 지금 = Date.now();
    남은.slice(0, 30).forEach((일정) => {
      const 지남 = 일정.예정밀리 < 지금;
      조각.push(`<div class="줄설명 ${지남 ? '빨강' : ''}">
        ${날짜말(일정.예정밀리)} — ${안전글(일정.목차이름)} ${안전글(일정.묶음이름)}
        (${일정.회차}차)${지남 ? ' ⚠ 밀렸습니다!' : ''}</div>`);
    });
    if (남은.length > 30) 조각.push(`<p class="흐림">… 그리고 ${남은.length - 30}건 더</p>`);
  }

  조각.push('<h2>📖 완주 기록</h2>');
  const 기록들 = 저장소.전체기록();
  if (!기록들.length) {
    조각.push('<p class="흐림">아직 기록이 없습니다. 첫 묶음을 풀어 보세요!</p>');
  } else {
    기록들.slice(0, 60).forEach((ㄱ) => {
      조각.push(`<div class="줄">
        <div class="줄설명">${일시말(ㄱ.일시밀리)} · ${안전글(ㄱ.목차이름)} ${안전글(ㄱ.묶음이름)}</div>
        <div class="줄설명">${회차말(ㄱ.회차)} · 정답률 ${ㄱ.정답수}/${ㄱ.문제수} ·
          ${초를말로(ㄱ.걸린초)} · 평균 ${점수말(ㄱ.평균점수)} ${점수평가(ㄱ.평균점수)}</div>
      </div>`);
    });
    if (기록들.length > 60) 조각.push(`<p class="흐림">… 그리고 ${기록들.length - 60}건 더</p>`);
  }

  조각.push(`<h2>💾 기록 옮기기</h2>
    <p class="흐림">기록은 이 기기의 브라우저에만 저장됩니다.
      폰을 바꾸거나 다른 기기에서 이어서 하시려면 내보낸 파일을 가져오세요.</p>
    <button class="선단추" onclick="기록내보내기()">기록 파일로 내보내기</button>
    <label class="선단추 파일단추">기록 파일 가져오기
      <input type="file" accept="application/json" id="가져오기칸" hidden>
    </label>`);

  뿌리.innerHTML = 조각.join('');
  document.getElementById('가져오기칸').addEventListener('change', 기록가져오기);
}

function 기록내보내기() {
  const 글 = JSON.stringify(저장소.전부내보내기(), null, 2);
  const 주소 = URL.createObjectURL(new Blob([글], { type: 'application/json' }));
  const 링크 = document.createElement('a');
  링크.href = 주소;
  링크.download = `중개사복습-기록-${날짜입력값(Date.now())}.json`;
  링크.click();
  URL.revokeObjectURL(주소);
}

function 기록가져오기(사건) {
  const 파일 = 사건.target.files[0];
  if (!파일) return;
  const 읽개 = new FileReader();
  읽개.onload = () => {
    try {
      저장소.전부가져오기(JSON.parse(읽개.result));
      alert('기록을 가져왔습니다.');
      기록화면();
    } catch (오류) {
      alert(`가져오지 못했습니다: ${오류.message}`);
    }
  };
  읽개.readAsText(파일);
}

// ── 시작 ────────────────────────────────────────────────────
그리기();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch((오류) =>
    console.warn('오프라인 준비 실패', 오류)
  );
}
