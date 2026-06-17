const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// STEP 1 - Embed libraries
const step1_libraries = `
<script>
// ============ displacement-utils.js ============
function getDisplacementMap({ height, width, radius, depth }) {
    const svg = \`<svg height="\${height}" width="\${width}" viewBox="0 0 \${width} \${height}" xmlns="http://www.w3.org/2000/svg">
        <style>.mix { mix-blend-mode: screen; }</style>
        <defs>
            <linearGradient id="Y" x1="0" x2="0" y1="\${Math.ceil((radius / height) * 15)}%" y2="\${Math.floor(100 - (radius / height) * 15)}%">
                <stop offset="0%" stop-color="#0F0" />
                <stop offset="100%" stop-color="#000" />
            </linearGradient>
            <linearGradient id="X" x1="\${Math.ceil((radius / width) * 15)}%" x2="\${Math.floor(100 - (radius / width) * 15)}%" y1="0" y2="0">
                <stop offset="0%" stop-color="#F00" />
                <stop offset="100%" stop-color="#000" />
            </linearGradient>
        </defs>
        <rect x="0" y="0" height="\${height}" width="\${width}" fill="#808080" />
        <g filter="blur(2px)">
          <rect x="0" y="0" height="\${height}" width="\${width}" fill="#000080" />
          <rect x="0" y="0" height="\${height}" width="\${width}" fill="url(#Y)" class="mix" />
          <rect x="0" y="0" height="\${height}" width="\${width}" fill="url(#X)" class="mix" />
          <rect x="\${depth}" y="\${depth}" height="\${height - 2 * depth}" width="\${width - 2 * depth}" fill="#808080" rx="\${radius}" ry="\${radius}" filter="blur(\${depth}px)" />
        </g>
    </svg>\`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function getDisplacementFilter({ height, width, radius, depth, strength = 100, chromaticAberration = 0 }) {
    const displacementMapUrl = getDisplacementMap({ height, width, radius, depth });
    const svg = \`<svg height="\${height}" width="\${width}" viewBox="0 0 \${width} \${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="displace" color-interpolation-filters="sRGB">
                <feImage x="0" y="0" height="\${height}" width="\${width}" href="\${displacementMapUrl}" result="displacementMap" />
                <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="\${strength + chromaticAberration * 2}" xChannelSelector="R" yChannelSelector="G" />
                <feColorMatrix type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="displacedR" />
                <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="\${strength + chromaticAberration}" xChannelSelector="R" yChannelSelector="G" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="displacedG" />
                <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="\${strength}" xChannelSelector="R" yChannelSelector="G" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="displacedB" />
                <feBlend in="displacedR" in2="displacedG" mode="screen"/>
                <feBlend in2="displacedB" mode="screen"/>
            </filter>
        </defs>
    </svg>\`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg) + "#displace";
}

window.DisplacementUtils = { getDisplacementMap, getDisplacementFilter };
</script>

<script>
// ============ glass-element.js ============
class GlassElement extends HTMLElement {
    constructor() {
        super();
        this.clicked = false;
        this.attachShadow({ mode: 'open' });
        if (GlassElement._svgFilterSupport === undefined) {
            GlassElement._svgFilterSupport = this.detectSVGFilterSupport();
        }
    }
    detectSVGFilterSupport() {
        const testElement = document.createElement('div');
        testElement.style.backdropFilter = 'blur(1px)';
        if (!testElement.style.backdropFilter) return false;
        const ua = navigator.userAgent.toLowerCase();
        const isChrome = /chrome|chromium|crios|edg/.test(ua) && !/firefox|fxios/.test(ua);
        if (isChrome) return true;
        if (/firefox|fxios|safari/.test(ua)) return false;
        try {
            testElement.style.backdropFilter = 'url(#test)';
            return testElement.style.backdropFilter.includes('url');
        } catch(e) { return false; }
    }
    get hasSVGFilterSupport() { return GlassElement._svgFilterSupport; }
    static get observedAttributes() {
        return ['width','height','radius','depth','blur','strength','chromatic-aberration','debug','background-color','responsive','base-width','base-height','auto-size','min-width','min-height'];
    }
    connectedCallback() { this.render(); this.setupEventListeners(); }
    attributeChangedCallback() { if (this.shadowRoot) this.render(); }
    get width() { return parseInt(this.getAttribute('width')) || 200; }
    get height() { return parseInt(this.getAttribute('height')) || 200; }
    get radius() { return parseInt(this.getAttribute('radius')) || 50; }
    get baseDepth() { return parseInt(this.getAttribute('depth')) || 10; }
    get blur() { return parseInt(this.getAttribute('blur')) || 2; }
    get strength() { return parseInt(this.getAttribute('strength')) || 100; }
    get chromaticAberration() { return parseInt(this.getAttribute('chromatic-aberration')) || 0; }
    get debug() { return this.getAttribute('debug') === 'true'; }
    get backgroundColor() { return this.getAttribute('background-color') || 'rgba(255,255,255,0.4)'; }
    get autoSize() { return this.hasAttribute('auto-size'); }
    get minWidth() { return parseInt(this.getAttribute('min-width')) || 0; }
    get minHeight() { return parseInt(this.getAttribute('min-height')) || 0; }
    get depth() { return this.baseDepth / (this.clicked ? 0.7 : 1); }
    setupEventListeners() {
        const glassBox = this.shadowRoot.querySelector('.glass-box');
        glassBox.addEventListener('mousedown', () => { this.clicked = true; this.updateStyles(); });
        glassBox.addEventListener('mouseup', () => { this.clicked = false; this.updateStyles(); });
        glassBox.addEventListener('mouseleave', () => { this.clicked = false; this.updateStyles(); });
        document.addEventListener('mouseup', () => { if (this.clicked) { this.clicked = false; this.updateStyles(); } });
    }
    updateStyles() {
        const glassBox = this.shadowRoot.querySelector('.glass-box');
        if (glassBox) this.applyDynamicStyles(glassBox);
    }
    applyDynamicStyles(element) {
        const { getDisplacementFilter, getDisplacementMap } = window.DisplacementUtils;
        element.style.borderRadius = \`\${this.radius}px\`;
        if (this.autoSize) {
            element.style.backdropFilter = 'none';
            element.offsetWidth;
            const rect = element.getBoundingClientRect();
            let actualWidth = Math.max(Math.ceil(rect.width), this.minWidth, 50);
            let actualHeight = Math.max(Math.ceil(rect.height), this.minHeight, 30);
            if (rect.width === 0) { requestAnimationFrame(() => this.updateStyles()); return; }
            if (!this.hasSVGFilterSupport) {
                element.style.backdropFilter = \`blur(\${this.blur * 2}px)\`;
                element.style.background = this.backgroundColor;
                element.style.boxShadow = '1px 1px 1px 0px rgba(255,255,255,0.60) inset, -1px -1px 1px 0px rgba(255,255,255,0.60) inset';
            } else {
                element.style.backdropFilter = \`blur(\${this.blur / 2}px) url('\${getDisplacementFilter({ height: actualHeight, width: actualWidth, radius: this.radius, depth: this.depth, strength: this.strength, chromaticAberration: this.chromaticAberration })}') blur(\${this.blur}px) brightness(1.1) saturate(1.5)\`;
                element.style.background = this.backgroundColor;
                element.style.boxShadow = '1px 1px 1px 0px rgba(255,255,255,0.60) inset, -1px -1px 1px 0px rgba(255,255,255,0.60) inset';
            }
        } else {
            element.style.height = \`\${this.height}px\`;
            element.style.width = \`\${this.width}px\`;
            if (!this.hasSVGFilterSupport) {
                element.style.backdropFilter = \`blur(\${this.blur * 2}px)\`;
                element.style.background = this.backgroundColor;
                element.style.boxShadow = '1px 1px 1px 0px rgba(255,255,255,0.60) inset, -1px -1px 1px 0px rgba(255,255,255,0.60) inset';
            } else {
                element.style.backdropFilter = \`blur(\${this.blur / 2}px) url('\${getDisplacementFilter({ height: this.height, width: this.width, radius: this.radius, depth: this.depth, strength: this.strength, chromaticAberration: this.chromaticAberration })}') blur(\${this.blur}px) brightness(1.1) saturate(1.5)\`;
                element.style.background = this.backgroundColor;
                element.style.boxShadow = '1px 1px 1px 0px rgba(255,255,255,0.60) inset, -1px -1px 1px 0px rgba(255,255,255,0.60) inset';
            }
        }
    }
    render() {
        this.shadowRoot.innerHTML = \`
            <style>
                :host { display: \${this.autoSize ? 'inline-block' : 'block'}; }
                .glass-box {
                    background: rgba(255,255,255,0.4);
                    cursor: pointer;
                    position: relative;
                    \${this.autoSize ? \`display: inline-block; width: fit-content; min-width: \${this.minWidth}px; min-height: \${this.minHeight}px;\` : ''}
                }
                .glass-box:active { transform: scale(0.98); }
                .content {
                    \${this.autoSize ? '' : 'width: 100%; height: 100%;'}
                    display: flex; align-items: center; justify-content: center;
                    color: white; text-align: center; font-family: sans-serif;
                    \${this.autoSize ? 'padding: var(--glass-padding, 16px 24px);' : ''}
                }
            </style>
            <div class="glass-box">
                <div class="content"><slot></slot></div>
            </div>\`;
        const glassBox = this.shadowRoot.querySelector('.glass-box');
        if (this.autoSize) {
            requestAnimationFrame(() => requestAnimationFrame(() => this.applyDynamicStyles(glassBox)));
        } else {
            this.applyDynamicStyles(glassBox);
        }
    }
}
customElements.define('glass-element', GlassElement);
</script>
`;

let targetLine = "window.liquidGlassStrength = 1.0;";
html = html.replace(targetLine, step1_libraries + "\\n  " + targetLine);

// STEP 2 - Wrap dock
html = html.replace('<div class="dock-container" id="dock">',
  '<glass-element id="dock-glass-wrapper" style="position:fixed; bottom:20px; left:50%; transform:translateX(-50%); z-index:2147483647;" radius="24" depth="8" blur="4" strength="60" background-color="rgba(255,255,255,0.25)" chromatic-aberration="1">\\n<div class="dock-container" id="dock" style="margin-bottom:0; background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; box-shadow:none; border-radius:0; position:relative;">'
);
let indexSvg = html.indexOf('<filter id="icon-transparent-filter"');
let dockCloseDivStr = '</div>\\n\\n<svg style="position: absolute; width: 0; height: 0; pointer-events: none;">\\n  <filter id="icon-transparent-filter"';
html = html.replace(dockCloseDivStr, '</div>\\n</glass-element>\\n\\n<svg style="position: absolute; width: 0; height: 0; pointer-events: none;">\\n  <filter id="icon-transparent-filter"');

// STEP 3 - Wrap context menu
html = html.replace('<div class="context-menu" id="context-menu">',
  '<glass-element id="context-menu-glass" style="position:fixed; z-index:100000; display:none;" radius="8" depth="5" blur="3" strength="40" background-color="rgba(255,255,255,0.15)" chromatic-aberration="1" auto-size>\\n<div class="context-menu" id="context-menu" style="position:relative; background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; box-shadow:none; border:none; opacity:1; pointer-events:auto; transform:none; border-radius:0;">'
);
html = html.replace('<div class="context-menu-item" id="ctx-change-bg">Change Desktop Background...</div>\\n</div>', '<div class="context-menu-item" id="ctx-change-bg">Change Desktop Background...</div>\\n</div>\\n</glass-element>');

let ctxReplLeft = "contextMenu.style.left = `${e.clientX}px`;\\n    contextMenu.style.top = `${e.clientY}px`;\\n\\n    const cgw = document.getElementById('context-menu-glass');\\n    cgw.style.left = `${e.clientX}px`;\\n    cgw.style.top = `${e.clientY}px`;";
html = html.replace("contextMenu.style.left = `${e.clientX}px`;\\n    contextMenu.style.top = `${e.clientY}px`;", ctxReplLeft);

html = html.replace(/contextMenu\.classList\.add\('show'\);/g, "contextMenu.classList.add('show');\\n    const cgw_add = document.getElementById('context-menu-glass');\\n    if(cgw_add) { cgw_add.style.display = 'block'; cgw_add.style.left = contextMenu.style.left; cgw_add.style.top = contextMenu.style.top; }");
html = html.replace(/contextMenu\.classList\.remove\('show'\);/g, "contextMenu.classList.remove('show');\\n    const cgw_rem = document.getElementById('context-menu-glass');\\n    if(cgw_rem) cgw_rem.style.display = 'none';");

// STEP 4 - Wrap Apple menu
html = html.replace('<div class="menu-dropdown" id="apple-dropdown">',
  '<glass-element id="apple-dropdown-glass" style="position:absolute; top:28px; left:10px; z-index:99999; display:none;" radius="8" depth="5" blur="3" strength="40" background-color="rgba(255,255,255,0.15)" chromatic-aberration="1" auto-size>\\n<div class="menu-dropdown" id="apple-dropdown" style="position:relative; top:0; left:0; background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; box-shadow:none; border:none; opacity:1; pointer-events:auto; transform:none;">'
);
html = html.replace('<div class="menu-dropdown-item">Log Out...</div>\\n  </div>', '<div class="menu-dropdown-item">Log Out...</div>\\n  </div>\\n</glass-element>');

html = html.replace(/appleDropdown\.classList\.toggle\('show'\);/g, "appleDropdown.classList.toggle('show');\\n    document.getElementById('apple-dropdown-glass').style.display = appleDropdown.classList.contains('show') ? 'block' : 'none';");
html = html.replace(/appleDropdown\.classList\.remove\('show'\);/g, "appleDropdown.classList.remove('show');\\n    document.getElementById('apple-dropdown-glass').style.display = 'none';");

// STEP 5 - Wrap File menu
html = html.replace('<div class="menu-dropdown" id="file-dropdown" style="left: 80px;">',
  '<glass-element id="file-dropdown-glass" style="position:absolute; top:28px; left:80px; z-index:99999; display:none;" radius="8" depth="5" blur="3" strength="40" background-color="rgba(255,255,255,0.15)" chromatic-aberration="1" auto-size>\\n<div class="menu-dropdown" id="file-dropdown" style="position:relative; top:0; left:0; background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; box-shadow:none; border:none; opacity:1; pointer-events:auto; transform:none;">'
);
html = html.replace('<div class="menu-dropdown-item" id="file-download">Download to PC...</div>\\n  </div>', '<div class="menu-dropdown-item" id="file-download">Download to PC...</div>\\n  </div>\\n</glass-element>');

html = html.replace(/fileDropdown\.classList\.toggle\('show'\);/g, "fileDropdown.classList.toggle('show');\\n    document.getElementById('file-dropdown-glass').style.display = fileDropdown.classList.contains('show') ? 'block' : 'none';");
html = html.replace(/fileDropdown\.classList\.remove\('show'\);/g, "fileDropdown.classList.remove('show');\\n    document.getElementById('file-dropdown-glass').style.display = 'none';");

// STEP 6 - Wrap New folder modal
html = html.replace('<div class="modal-overlay" id="new-folder-modal">\\n  <div class="modal">',
  '<div class="modal-overlay" id="new-folder-modal">\\n  <glass-element radius="12" depth="6" blur="3" strength="45" background-color="rgba(255,255,255,0.15)" chromatic-aberration="1" auto-size>\\n<div class="modal" style="background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; box-shadow:none; border:none; border-radius:0;">'
);
let newFCloseModal = `<button class="modal-btn primary" id="new-folder-create">Create</button>
    </div>
  </div>
</div>`;
html = html.replace(newFCloseModal, `<button class="modal-btn primary" id="new-folder-create">Create</button>
    </div>
  </div>
</glass-element>
</div>`);

// STEP 7 - Wrap Save As modal
html = html.replace('<div class="modal-overlay" id="save-file-modal">\\n  <div class="modal">',
  '<div class="modal-overlay" id="save-file-modal">\\n  <glass-element radius="12" depth="6" blur="3" strength="45" background-color="rgba(255,255,255,0.15)" chromatic-aberration="1" auto-size>\\n<div class="modal" style="background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; box-shadow:none; border:none; border-radius:0;">'
);
let saveFCloseModal = `<button class="modal-btn primary" id="save-file-confirm">Save</button>
    </div>
  </div>
</div>`;
html = html.replace(saveFCloseModal, `<button class="modal-btn primary" id="save-file-confirm">Save</button>
    </div>
  </div>
</glass-element>
</div>`);

// STEP 8 - Wrap About This Mac window
html = html.replace('<div class="window about-window" id="about-window">',
  '<glass-element id="about-glass" style="position:absolute; top:50%; left:50%; margin-left:-150px; margin-top:-200px; z-index:10000; display:none;" radius="12" depth="6" blur="3" strength="45" background-color="rgba(255,255,255,0.15)" chromatic-aberration="1" auto-size>\\n<div class="window about-window" id="about-window" style="position:relative; top:0; left:0; margin:0; background:transparent; backdrop-filter:none; -webkit-backdrop-filter:none; box-shadow:none; border-radius:0; opacity:1; pointer-events:auto; transform:none;">'
);
let aboutMacCloseHtml = `<div class="about-footer">
      <button class="about-btn">More Info...</button>
    </div>
  </div>
</div>`;
html = html.replace(aboutMacCloseHtml, `<div class="about-footer">
      <button class="about-btn">More Info...</button>
    </div>
  </div>
</div>
</glass-element>`);

html = html.replace(/aboutWindow\.classList\.add\('show'\);/g, "aboutWindow.classList.add('show');\\n    document.getElementById('about-glass').style.display = 'block';");
html = html.replace(/document\.getElementById\('about-window'\)\.classList\.remove\('show'\);/g, "document.getElementById('about-window').classList.remove('show');\\n    document.getElementById('about-glass').style.display = 'none';");

fs.writeFileSync('index.html', html);
console.log('Transform successful!');
