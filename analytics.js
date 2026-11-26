window.va = window.va || function () {
  (window.vaq = window.vaq || []).push(arguments);
};

window.va('beforeSend', (event) => {
  const url = new URL(event.url);
  url.search = '';
  url.hash = '';
  return { ...event, url: url.href };
});

const analyticsScript = document.createElement('script');
analyticsScript.src = '/_vercel/insights/script.js';
document.head.append(analyticsScript);
