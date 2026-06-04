import React, { useEffect, useState, Component, ErrorInfo, useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { GlassContainer } from 'liquid-glass/src/components/GlassContainer';
import { LiquidGlass } from 'liquid-glass/src/components/LiquidGlass';
import { toBlob } from 'html-to-image';

class ErrorBoundary extends Component<{children: React.ReactNode, fallback: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {}
  // @ts-ignore
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

declare global {
  interface Window {
    registerLiquidGlass: (selector: string, blur: number) => void;
  }
}

type GlassElement = {
  selector: string;
  blur: number;
};

function FallbackRenderer({ elements, onFallback }: { elements: GlassElement[], onFallback: () => void }) {
  useEffect(() => {
    onFallback();
  }, [onFallback]);
  return null;
}

export function LiquidGlassApp() {
  const [bgUrl, setBgUrl] = useState('');
  const [elements, setElements] = useState<GlassElement[]>([]);
  const [useFallback, setUseFallback] = useState(false);
  const [glassStrength, setGlassStrength] = useState(() => (window as any).liquidGlassStrength ?? 3.2);
  const [foundElements, setFoundElements] = useState<{
    el: HTMLElement;
    selector: string;
    blur: number;
    parsedRadius: number;
    tintBg: string;
    originalBg: string;
  }[]>([]);

  useEffect(() => {
    const onSettingsChanged = () => {
      setGlassStrength((window as any).liquidGlassStrength ?? 3.2);
    };
    window.addEventListener('liquid-glass-settings-changed', onSettingsChanged);
    return () => window.removeEventListener('liquid-glass-settings-changed', onSettingsChanged);
  }, []);

  const rafRef = useRef<number | null>(null);

  // 1. Fetching background URL
  useEffect(() => {
    if (useFallback) return;
    
    let currentProxyUrl = '';
    const updateBg = async () => {
      const activeLayer = Array.from(document.querySelectorAll('.bg-layer')).find(el => el.classList.contains('active')) as HTMLElement || document.querySelector('.bg-layer') as HTMLElement;
      if (!activeLayer) return;
      let url = activeLayer.style.backgroundImage;
      if (url) {
        url = url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
        if (currentProxyUrl === proxyUrl) return; // Prevent infinite re-fetching
        currentProxyUrl = proxyUrl;
        
        try {
          const res = await fetch(proxyUrl);
          if (!res.ok) throw new Error('Proxy failed');
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          setBgUrl(oldUrl => {
            if (oldUrl && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
            return objectUrl;
          });
        } catch (error) {
          try {
            const backupRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
             if (!backupRes.ok) throw new Error('Proxy failed');
            const blob = await backupRes.blob();
            const objectUrl = URL.createObjectURL(blob);
            setBgUrl(oldUrl => {
              if (oldUrl && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
              return objectUrl;
            });
          } catch (e) {
            setBgUrl(''); 
            setUseFallback(true);
          }
        }
      }
    };
    updateBg();
    
    const layers = document.querySelectorAll('.bg-layer');
    const obs = new MutationObserver(updateBg);
    layers.forEach(layer => obs.observe(layer, { attributes: true, attributeFilter: ['style', 'class'] }));
    
    return () => obs.disconnect();
  }, [useFallback]);

  // 2. Setting CSS overrides based on elements
  useEffect(() => {
    if (useFallback || !bgUrl) {
      const existing = document.getElementById('liquid-glass-hide-bg');
      if (existing) existing.remove();
      return;
    }
    const styleEl = document.createElement('style');
    styleEl.id = 'liquid-glass-hide-bg';
    styleEl.textContent = `
      .bg-layer { display: none !important; }
      .window::after, .dock-container::after { display: none !important; }
      ${elements.map(e => `${e.selector} { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`).join('\n')}
    `;
    document.head.appendChild(styleEl);
    return () => {
      styleEl.remove();
    };
  }, [useFallback, elements, bgUrl]);

  useEffect(() => {
    // 2. Setup the global registration function
    const existing = new Set<string>();
    
    window.registerLiquidGlass = (selector: string, blur: number) => {
      setElements((prev) => {
        if (existing.has(selector)) {
          // update blur if it exists
          return prev.map(p => p.selector === selector ? { ...p, blur } : p);
        }
        existing.add(selector);
        return [...prev, { selector, blur }];
      });
    };

    // If it was already called by initial vanilla JS before React mounted:
    if ((window as any)._pendingGlassElements) {
      (window as any)._pendingGlassElements.forEach((args: any[]) => {
        window.registerLiquidGlass(args[0], args[1]);
      });
    }

    // Force re-render periodically in case dynamic elements appear a bit late
    const interval = setInterval(() => {
      setElements(prev => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Manage caching and styled overrides for elements outside the render cycle
  useEffect(() => {
    if (useFallback || !bgUrl) return;

    const findAndStyle = () => {
      const results: {
        el: HTMLElement;
        selector: string;
        blur: number;
        parsedRadius: number;
        tintBg: string;
        originalBg: string;
      }[] = [];

      elements.forEach(item => {
        const nodeList = document.querySelectorAll(item.selector);
        nodeList.forEach(el => {
          const element = el as HTMLElement;
          if (['input', 'img', 'video', 'br', 'hr', 'meta', 'link'].includes(element.tagName.toLowerCase())) {
            const finalBlur = item.blur < 10 ? 20 : item.blur;
            const blurStr = finalBlur > 0 ? `blur(${finalBlur}px)` : '';
            if (element.style.backdropFilter !== blurStr) {
              element.style.backdropFilter = blurStr;
              (element.style as any).webkitBackdropFilter = blurStr;
            }
            return;
          }

          const cs = window.getComputedStyle(element);
          let currentBg = element.getAttribute('data-original-bg') || '';
          if (!currentBg) {
            currentBg = cs.backgroundColor || '';
            if (currentBg && currentBg !== 'rgba(0, 0, 0, 0)' && currentBg !== 'transparent') {
              element.setAttribute('data-original-bg', currentBg);
            }
          }

          const currentPosition = cs.position;
          let newStyle = (element.getAttribute('style') || '').replace(/;\s*$/, '');
          let styleChanged = false;
          if (currentPosition === 'static') {
            newStyle += '; position: relative;';
            styleChanged = true;
          }
          if (cs.zIndex === 'auto') {
             newStyle += '; z-index: 1;';
             styleChanged = true;
          }
          if (styleChanged) {
            element.setAttribute('style', newStyle);
          }

          if (currentBg && currentBg !== 'rgba(0, 0, 0, 0)' && currentBg !== 'transparent') {
            if (element.style.backgroundColor !== 'transparent') {
              element.style.setProperty('background-color', 'transparent', 'important');
              element.style.setProperty('background-image', 'none', 'important');
            }
          }

          let parsedRadius = 24;
          const br = cs.borderRadius || '';
          const match = br.match(/(\d+)px/);
          if (match) parsedRadius = parseInt(match[1]);

          let tintBg = currentBg;
          if (item.selector === '#launchpad-window') {
            tintBg = 'rgba(255, 255, 255, 0.75)'; // Beautiful custom white tint for Apps window
          } else if (item.selector === '#terminal-window') {
            tintBg = 'rgba(15, 15, 15, 0.85)'; // Darker tint for Terminal window
          }

          results.push({
            el: element,
            selector: item.selector,
            blur: item.blur,
            parsedRadius,
            tintBg,
            originalBg: currentBg
          });
        });
      });

      setFoundElements(results);
    };

    findAndStyle();

    const interval = setInterval(findAndStyle, 500);

    const handleForce = () => {
      findAndStyle();
    };
    document.addEventListener('force-liquid-glass', handleForce, true);

    return () => {
      clearInterval(interval);
      document.removeEventListener('force-liquid-glass', handleForce, true);
    };
  }, [useFallback, bgUrl, elements]);

  // If WebGL fails, we iterate and apply basic CSS backdrop filters
  useEffect(() => {
    if (useFallback) {
      elements.forEach(item => {
        const nodeList = document.querySelectorAll(item.selector);
        nodeList.forEach(el => {
          const e = el as HTMLElement;
          const finalBlur = item.blur < 10 ? 20 : item.blur;
          const blurStr = finalBlur > 0 ? `blur(${finalBlur}px)` : '';
          e.style.backdropFilter = blurStr;
          (e.style as any).webkitBackdropFilter = blurStr;
        });
      });
    }
  }, [useFallback, elements]);

  if (!bgUrl && !useFallback) return null;

  if (useFallback) {
    return null; // Do not render GlassContainer
  }

  return (
    <ErrorBoundary fallback={
      <FallbackRenderer elements={elements} onFallback={() => setUseFallback(true)} />
    }>
      <GlassContainer 
        imageSrc={bgUrl} 
        style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0, zIndex: -100 }}
      >
        {foundElements.map((item, index) => {
          return createPortal(
            <LiquidGlass
              blurRadiusPx={item.blur}
              edgeMapStart={1.0}
              edgeMapMaxPx={Math.min(item.parsedRadius * 1.5, 40) * glassStrength}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
                borderRadius: 'inherit',
                pointerEvents: 'none',
                width: '100%',
                height: '100%'
              }}
            >
              {/* Tint overlay to restore the element's original background color */}
              {item.tintBg && item.tintBg !== 'rgba(0, 0, 0, 0)' && item.tintBg !== 'transparent' && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: item.tintBg, pointerEvents: 'none', borderRadius: 'inherit' }} />
              )}
            </LiquidGlass>,
            item.el,
            `${item.selector}-${index}`
          );
        })}
      </GlassContainer>
    </ErrorBoundary>
  );
}

// Initialization script
const root = document.createElement('div');
root.id = 'react-liquid-glass-root';
root.style.position = 'fixed';
root.style.inset = '0';
root.style.zIndex = '-100'; // bottomest layer
document.body.prepend(root); // prepend so it sits at the bottom

createRoot(root).render(<LiquidGlassApp />);
