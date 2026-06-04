(async () => {
    let url = "https://wsrv.nl/?url=" + encodeURIComponent("https://512pixels.net/wp-content/uploads/2025/06/26-Tahoe-Light-6K-thumb.jpeg");
    let res = await fetch(url, { method: 'HEAD' });
    console.log(res.status, [...res.headers.entries()]);
})();
