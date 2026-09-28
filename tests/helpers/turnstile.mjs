// This replaces only Cloudflare's script in browser tests. No tokens or enquiries
// leave the local browser, and production code has no test-only bypass.
export async function mockTurnstile(page, { autoComplete = false, failFirstLoad = false } = {}) {
  let scriptRequests = 0;
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', route => {
    scriptRequests += 1;
    if (failFirstLoad && scriptRequests === 1) return route.abort('failed');
    return route.fulfill({ contentType: 'application/javascript', body: `
      (() => {
        const widgets = new Map();
        let serial = 0;
        const state = window.__turnstileTest = { loads: (window.__turnstileTest?.loads || 0) + 1, renders: 0, removes: 0, maxActive: 0, tokens: 0, configs: [] };
        function finish(id) {
          const widget = widgets.get(id);
          if (!widget) return;
          widget.options.callback('mock-token-' + (++state.tokens));
        }
        state.complete = () => widgets.forEach((_, id) => finish(id));
        state.expire = () => widgets.forEach(widget => widget.options['expired-callback']());
        state.fail = () => widgets.forEach(widget => widget.options['error-callback']());
        state.active = () => widgets.size;
        window.turnstile = {
          render(container, options) {
            const id = 'mock-widget-' + (++serial);
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Complete security check';
            button.setAttribute('aria-label', 'Complete security check');
            button.style.width = options.size === 'compact' ? '150px' : '100%';
            button.style.minWidth = options.size === 'compact' ? '150px' : '300px';
            button.style.height = options.size === 'compact' ? '140px' : '65px';
            button.addEventListener('click', () => finish(id));
            container.appendChild(button);
            widgets.set(id, { container, options });
            state.renders += 1;
            state.maxActive = Math.max(state.maxActive, widgets.size);
            state.configs.push({ action: options.action, theme: options.theme, size: options.size, responseField: options['response-field'] });
            if (${JSON.stringify(autoComplete)}) setTimeout(() => finish(id), 20);
            return id;
          },
          remove(id) {
            const widget = widgets.get(id);
            if (widget) widget.container.replaceChildren();
            widgets.delete(id);
            state.removes += 1;
          }
        };
      })();
    ` });
  });
  return { scriptRequests: () => scriptRequests };
}
