(async () => {
  try {
    let url = 'https://unpkg.com/html-docx-js@0.3.1/dist/html-docx.js';
    let res = await fetch(url);
    console.log("0.3.1 version:", res.status);
  } catch(e) {
    console.error(e.message);
  }
})();
