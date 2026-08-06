// 오프라인용 서비스 워커.
// 지하철·시험장처럼 인터넷이 없어도 문제를 풀 수 있게 앱 전체를 캐시에 담아 둔다.
// 판번호는 배포할 때 GitHub Actions가 커밋 번호로 바꿔 넣는다(파일이 바뀌면 새로 받아옴).
// 배포할 때 워크플로가 커밋 번호로 바꿔 넣는다. 안 바뀌어도 동작은 한다.
const 판 = '__판번호__';
const 곳간 = `중개사복습-${판}`;
const 담을것 = [
  './',
  './index.html',
  './모양.css',
  './데이터.js',
  './핵심.js',
  './화면.js',
  './manifest.webmanifest',
  './아이콘-180.png',
  './아이콘-192.png',
  './아이콘-512.png',
];

self.addEventListener('install', (사건) => {
  사건.waitUntil(
    caches.open(곳간).then((통) => 통.addAll(담을것)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (사건) => {
  사건.waitUntil(
    caches.keys()
      .then((이름들) => Promise.all(
        이름들.filter((이름) => 이름 !== 곳간).map((이름) => caches.delete(이름))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (사건) => {
  if (사건.request.method !== 'GET') return;
  사건.respondWith(
    caches.match(사건.request).then((담긴것) => {
      if (담긴것) {
        // 캐시로 바로 답하고, 뒤에서 조용히 새것을 받아 둔다
        사건.waitUntil(
          fetch(사건.request)
            .then((답) => 답.ok && caches.open(곳간).then((통) => 통.put(사건.request, 답)))
            .catch(() => {})
        );
        return 담긴것;
      }
      return fetch(사건.request).catch(() => caches.match('./index.html'));
    })
  );
});
