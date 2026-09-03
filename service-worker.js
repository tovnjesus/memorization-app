const CACHE_NAME = "ajang-church-memory-v3";

const FILES_TO_CACHE = [
"/",
"/index.html",
"/manifest.json"
];

/* ==========================================
설치
========================================== */

self.addEventListener("install", event => {

event.waitUntil(

caches
  .open(CACHE_NAME)
  .then(cache => {

    return cache.addAll(
      FILES_TO_CACHE
    );

  })


);

self.skipWaiting();

});

/* ==========================================
활성화
이전 캐시 삭제
========================================== */

self.addEventListener("activate", event => {

event.waitUntil(

caches
  .keys()
  .then(keys => {

    return Promise.all(

      keys
        .filter(
          key =>
            key !== CACHE_NAME
        )
        .map(
          key =>
            caches.delete(key)
        )

    );

  })


);

self.clients.claim();

});

/* ==========================================
요청 처리

HTML / 앱 파일:
최신 파일을 먼저 가져오고
실패하면 캐시 사용

Supabase / 영상:
Service Worker가 캐시하지 않음
========================================== */

self.addEventListener(
"fetch",
event => {

const request =
  event.request;

const url =
  new URL(
    request.url
  );


/* --------------------------------------
   Supabase 요청은 그대로 통과
-------------------------------------- */

if (
  url.hostname.endsWith(
    ".supabase.co"
  )
) {

  return;

}


/* --------------------------------------
   GET 요청만 처리
-------------------------------------- */

if (
  request.method !== "GET"
) {

  return;

}


/* --------------------------------------
   HTML / 앱 파일
   Network First
-------------------------------------- */

event.respondWith(

  fetch(request)
    .then(response => {

      if (
        response &&
        response.status === 200
      ) {

        const responseClone =
          response.clone();

        caches
          .open(CACHE_NAME)
          .then(cache => {

            cache.put(
              request,
              responseClone
            );

          });

      }

      return response;

    })

    .catch(() => {

      return caches.match(
        request
      );

    })

);


}
);
