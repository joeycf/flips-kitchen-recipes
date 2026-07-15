// <tag-row tags="Chicken,Rice,Weeknight"> — single-line tag pills with a
// width-based "+N" overflow chip. Recomputes on resize. Self-contained, no deps.
(function () {
  if (customElements.get('tag-row')) return;

  class TagRow extends HTMLElement {
    static get observedAttributes() { return ['tags']; }

    connectedCallback() {
      this.style.display = 'flex';
      this.style.flexWrap = 'nowrap';
      this.style.alignItems = 'center';
      this.style.gap = '6px';
      this.style.overflow = 'hidden';
      this.style.maxWidth = '100%';
      this._render();
      this._ro = new ResizeObserver(() => this._layout());
      this._ro.observe(this);
    }
    disconnectedCallback() { if (this._ro) this._ro.disconnect(); }
    attributeChangedCallback() { if (this.isConnected) this._render(); }

    _tags() {
      return (this.getAttribute('tags') || '').split(',').map((s) => s.trim()).filter(Boolean);
    }
    _pill(text, more) {
      const s = document.createElement('span');
      s.textContent = text;
      s.style.cssText = 'flex:none;font:500 11px "Work Sans",sans-serif;padding:4px 10px;border-radius:999px;white-space:nowrap;';
      if (more) { s.style.color = '#BC5A39'; s.style.background = '#F3E3D9'; s.style.fontWeight = '600'; }
      else { s.style.color = '#7C6F5F'; s.style.background = '#F1E8D8'; }
      return s;
    }
    _render() {
      this.innerHTML = '';
      this._all = this._tags();
      this._pills = this._all.map((t) => this._pill(t, false));
      this._pills.forEach((p) => this.appendChild(p));
      this._more = this._pill('+0', true);
      this.appendChild(this._more);
      requestAnimationFrame(() => this._layout());
    }
    _layout() {
      const avail = this.clientWidth;
      if (!avail || !this._pills || !this._pills.length) return;
      const gap = 6;
      this._pills.forEach((p) => { p.style.display = ''; });
      this._more.style.display = '';
      const widths = this._pills.map((p) => p.offsetWidth);
      const total = widths.reduce((a, b, i) => a + b + (i > 0 ? gap : 0), 0);
      if (total <= avail) { this._more.style.display = 'none'; return; }
      let shown = 1;
      for (let n = this._pills.length - 1; n >= 1; n--) {
        this._more.textContent = '+' + (this._all.length - n);
        const moreW = this._more.offsetWidth;
        let w = 0;
        for (let i = 0; i < n; i++) w += widths[i] + (i > 0 ? gap : 0);
        w += gap + moreW;
        if (w <= avail) { shown = n; break; }
        shown = 1;
      }
      const remaining = this._all.length - shown;
      this._pills.forEach((p, i) => { p.style.display = i < shown ? '' : 'none'; });
      this._more.textContent = '+' + remaining;
      this._more.style.display = remaining > 0 ? '' : 'none';
    }
  }
  customElements.define('tag-row', TagRow);
})();
