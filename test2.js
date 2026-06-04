const r = /url\(['"]?(.*?)['"]?\)/i;
const s1 = 'url("https://github.com/user/repo/New Project (13).png")';
const s2 = 'url(https://github.com/user/repo/New Project (13).png)';
console.log("s1:", s1.match(r)[1]);
console.log("s2:", s2.match(r)[1]);
