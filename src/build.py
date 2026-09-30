"""Build the static pages: shared header, footer, contact form and icons + src/pages/*.html -> project root.

Run:  python3 src/build.py
"""
import re, pathlib

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent

ICONS = {
 'arrow': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
 'ext': '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
 'chev': '<path d="m6 9 6 6 6-6"/>',
 'phone': '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
 'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
 'copy': '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
 'share': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4"/><path d="m15.4 6.5-6.8 4"/>',
 'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
 'school': '<path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/><path d="M9 10h.01M15 10h.01"/>',
 'landmark': '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="m12 2 8 5H4z"/>',
 'globe': '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
 'cards': '<rect x="3" y="6" width="11" height="15" rx="2"/><path d="M10 3h9a2 2 0 0 1 2 2v12"/>',
 'sliders': '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
 'present': '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
 'bot': '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1"/><path d="M9 13v2M15 13v2"/>',
 'laptop': '<rect x="4" y="4" width="16" height="11" rx="2"/><path d="M2 20h20"/>',
 'hand': '<path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
 'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
 'chart': '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
 'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
 'smile': '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
 'compass': '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
 'flask': '<path d="M9 3h6"/><path d="M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
 'wallet': '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16" cy="14" r="1.5"/>',
 'sheet': '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9z"/><path d="M9 12h6M9 16h4"/>',
 'trend': '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
 'game': '<rect x="2" y="6" width="20" height="12" rx="6"/><path d="M6 12h4M8 10v4"/><path d="M15 11h.01M18 13h.01"/>',
 'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
 'pointer': '<path d="m3 3 7 18 2.5-7.5L20 11z"/>',
 'pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
 'branch': '<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
 'heart': '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
 'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 'grad': '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
 'monitor': '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
 'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 'map': '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
 'alert': '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/>',
 'check': '<path d="M20 6 9 17l-5-5"/>',
 'bulb': '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
 'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 'pen': '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
 'code': '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
 'badge': '<path d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9L3.2 15.8l1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z"/><path d="m9 12 2 2 4-4"/>',
 'rocket': '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1 5 0 5 0M12 15v5s3-.6 4-2c1-1.6 0-5 0-5"/>',
 'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
 'user': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 'zap': '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
 'flag': '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 8 2a6 6 0 0 0 3.2-.8.6.6 0 0 1 .8.5V15a1 1 0 0 1-.4.8A6 6 0 0 1 16 17c-3 0-5-2-8-2a6 6 0 0 0-4 1.3"/>',
 'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
 'rotate': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
 'home': '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 'sprout': '<path d="M7 20h10"/><path d="M12 20v-8"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6z"/><path d="M12 12c0-3 2-6 7-6 0 4-3 6-7 6z"/>',
 'store': '<path d="M3 9 4.5 4h15L21 9"/><path d="M3 9v11h18V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 20v-6h6v6"/>',
 'coins': '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18"/><path d="M7 6h1v4"/>',
 'note': '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
 'receipt': '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 2 2V2l-2 2-3-2-3 2-3-2-3 2-3-2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 'idcard': '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h4M5 16c.5-1 1.6-1.5 3-1.5s2.5.5 3 1.5"/>',
 'msg': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 'db': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
 'file': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
 'pause': '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
 'up': '<path d="m18 15-6-6-6 6"/>',
 'mic': '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0M12 17v5"/>',
 'layers': '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
}

def icon(m):
    name, _, cls = m.group(1).partition(':')
    extra = f' {cls}' if cls else ''
    return f'<svg class="ico{extra}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{ICONS[name]}</svg>'

def render(text):
    return re.sub(r'\{\{i:([a-z]+(?::[a-z\- ]+)?)\}\}', icon, text)

LOGO = '''<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="3" width="22" height="26" rx="3" fill="currentColor"/><circle cx="16" cy="14" r="5.5" fill="none" stroke="#F5B942" stroke-width="1.6"/><path d="M10.5 14h11M16 8.5c2.2 2.2 2.2 8.8 0 11M16 8.5c-2.2 2.2-2.2 8.8 0 11" stroke="#F5B942" stroke-width="1.2" fill="none"/><rect x="11" y="22.5" width="10" height="1.8" rx=".9" fill="#F5B942"/></svg>'''

PROGRAMS = [
    ('financial-passport.html', 'fp', 'Financial Passport', 'From knowing about money to knowing what to do with it.', 'grad', ''),
    ('tax-readiness.html', 'tax', 'Tax Readiness', 'Your first salary, your first tax, in 4 hours.', 'receipt', 'icon-badge--amber'),
]
FINFUN = ('https://finfun.club', 'finfun', 'FinFun', 'Games and activities that make money fun for children.', 'sprout', 'icon-badge--amber')

def header(cur, H, dark):
    def cur_attr(key):
        return ' aria-current="page"' if cur == key else ''
    prog_cur = ' aria-current="page"' if cur in ('fp', 'tax') else ''
    menu = [FINFUN] + PROGRAMS
    ext = lambda k: ' target="_blank" rel="noopener"' if k == 'finfun' else ''
    ext_icon = lambda k: ' {{i:ext}}<span class="sr-only">(opens in a new tab)</span>' if k == 'finfun' else ''
    drop = '\n'.join(
        f'''<a class="drop-card" href="{href}"{ext(k)}{cur_attr(k)}><span class="ic icon-badge {cls}">{{{{i:{ic}}}}}</span><strong>{name}{ext_icon(k)}</strong><span>{desc}</span></a>'''
        for href, k, name, desc, ic, cls in menu)
    sheet_prog = '\n'.join(f'<a href="{href}"{ext(k)}>{name}<span>{desc}</span></a>' for href, k, name, desc, ic, cls in menu)
    spy = (lambda s: f' data-spy="{s}"') if H == '' else (lambda s: '')
    return f'''<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header{' on-dark' if dark else ''}" data-header>
  <div class="container header-inner">
    <a class="logo" href="index.html" aria-label="Financial Passport, home">{LOGO}<span class="logo-text">Financial <b>Passport</b></span></a>
    <nav class="main-nav" aria-label="Main">
      <ul class="nav-list">
        <li><a href="{H}#our-work"{spy('our-work')}>Our Work</a></li>
        <li><a href="{H}#approach"{spy('approach')}>Our Approach</a></li>
        <li class="has-dropdown">
          <button class="nav-drop-btn" type="button" aria-expanded="false" aria-controls="programs-menu"{prog_cur}{spy('programs')}>Programs {{{{i:chev}}}}</button>
          <div class="dropdown" id="programs-menu">
{drop}
          </div>
        </li>
        <li><a href="finterventions.html"{cur_attr('fint')}>Finterventions</a></li>
        <li><a href="contact.html"{cur_attr('contact')}>Contact Us</a></li>
      </ul>
      <span class="nav-indicator" aria-hidden="true"></span>
    </nav>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-sheet" aria-label="Open menu"><span></span><span></span><span></span></button>
  </div>
</header>
<div class="mobile-sheet" id="mobile-sheet" hidden>
  <nav aria-label="Mobile">
    <ul class="sheet-list">
      <li><a href="{H or 'index.html'}#top">Home {{{{i:arrow}}}}</a></li>
      <li><a href="{H}#our-work">Our Work {{{{i:arrow}}}}</a></li>
      <li><a href="{H}#approach">Our Approach {{{{i:arrow}}}}</a></li>
      <li><button class="sheet-acc-btn" type="button" aria-expanded="false" aria-controls="sheet-programs">Programs {{{{i:chev}}}}</button>
        <div class="sheet-sub" id="sheet-programs"><div>
{sheet_prog}
        </div></div></li>
      <li><a href="finterventions.html">Finterventions {{{{i:arrow}}}}</a></li>
      <li><a href="contact.html">Contact Us {{{{i:arrow}}}}</a></li>
    </ul>
    <div class="sheet-foot">
      <a href="tel:+916364155055">+91 63641 55055</a>
      <a href="mailto:yamuna@projectfinancialdignity.com">yamuna@projectfinancialdignity.com</a>
      <span>An initiative of Project Financial Dignity</span>
    </div>
  </nav>
</div>'''

def footer(H):
    return f'''<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="logo" href="index.html" aria-label="Financial Passport, home">{LOGO}<span class="logo-text">Financial <b>Passport</b></span></a>
        <p>Financial Passport — Building financial capability for better financial lives. An initiative of Project Financial Dignity.</p>
      </div>
      <div>
        <h3>Quick links</h3>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="{H}#our-work">Our Work</a></li>
          <li><a href="{H}#approach">Our Approach</a></li>
          <li><a href="{H}#programs">Programs</a></li>
          <li><a href="finterventions.html">Finterventions</a></li>
          <li><a href="contact.html">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h3>Who we work with</h3>
        <ul>
          <li><a href="https://finfun.club" target="_blank" rel="noopener">Children {{{{i:ext}}}}<span class="sr-only">(opens FinFun in a new tab)</span></a></li>
          <li><a href="financial-passport.html">Youth</a></li>
          <li><a href="contact.html?interest=women">Women &amp; SHGs</a></li>
                  </ul>
      </div>
      <div>
        <h3>Contact</h3>
        <ul>
          <li><a href="tel:+916364155055">{{{{i:phone}}}} +91 63641 55055</a></li>
          <li><a href="mailto:yamuna@projectfinancialdignity.com" style="word-break:break-all">{{{{i:mail}}}} yamuna@projectfinancialdignity.com</a></li>
          <li><a href="https://finfun.club" target="_blank" rel="noopener">FinFun {{{{i:ext}}}}<span class="sr-only">(opens in a new tab)</span></a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>2026</span> Financial Passport</span>
      <a href="privacy.html">Privacy Policy</a>
      <a href="terms.html">Terms of Use</a>
      <a class="to-top" href="#top">Back to top ↑</a>
    </div>
  </div>
</footer>'''

INTEREST_OPTS = [('finfun', 'Children and FinFun'), ('youth', 'Youth programs'), ('women', 'Women & SHGs'),
                 ('community', 'Community programs'), ('courses', 'Courses and training'),
                 ('finterventions', 'Finternships and projects'), ('partnership', 'Partnerships'), ('general', 'General enquiry')]

def contact(default, heading, lede, cloud=True):
    opts = '\n'.join(f'<option value="{v}">{l.replace("&", "&amp;")}</option>' for v, l in INTEREST_OPTS)
    return f'''<section class="section{' section--cloud' if cloud else ''}" id="contact" aria-labelledby="contact-h">
  <div class="container contact-grid">
    <div class="contact-copy">
      <span class="eyebrow reveal">Contact us</span>
      <h2 class="reveal" id="contact-h">{heading}</h2>
      <p class="reveal" style="--d:80ms">{lede}</p>
      <div class="contact-lines reveal" style="--d:160ms">
        <div class="contact-line"><a href="tel:+916364155055"><span class="icon-badge">{{{{i:phone}}}}</span>+91 63641 55055</a></div>
        <div class="contact-line"><a href="mailto:yamuna@projectfinancialdignity.com"><span class="icon-badge">{{{{i:mail}}}}</span>yamuna@projectfinancialdignity.com</a>
          <button class="copy-btn" type="button" data-copy="yamuna@projectfinancialdignity.com" aria-label="Copy email address">{{{{i:copy}}}} Copy</button></div>
      </div>
    </div>
    <div class="form-card reveal" style="--d:120ms">
      <form id="enquiry-form" novalidate>
        <h3>Tell us a little about yourself.</h3>
        <div class="form-grid">
          <div class="field">
            <label for="f-name">Full name <span class="req" aria-hidden="true">*</span><span class="req-txt">(required)</span></label>
            <div class="control"><input class="input" id="f-name" name="name" autocomplete="name" required minlength="2" maxlength="80" aria-describedby="e-name"></div>
            <p class="err" id="e-name" aria-live="polite">{{{{i:alert}}}}<span></span></p>
          </div>
          <div class="field">
            <label for="f-email">Email <span class="req" aria-hidden="true">*</span><span class="req-txt">(required)</span></label>
            <div class="control"><input class="input" id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="e-email"></div>
            <p class="err" id="e-email" aria-live="polite">{{{{i:alert}}}}<span></span></p>
          </div>
          <div class="field">
            <label for="f-phone">Phone</label>
            <div class="control phone-wrap"><span class="prefix" aria-hidden="true">+91</span><input class="input" id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" maxlength="10" placeholder="10-digit mobile" aria-describedby="e-phone"></div>
            <p class="err" id="e-phone" aria-live="polite">{{{{i:alert}}}}<span></span></p>
          </div>
          <div class="field">
            <label for="f-org">Organisation</label>
            <div class="control"><input class="input" id="f-org" name="organisation" autocomplete="organization" placeholder="School / college / company"></div>
          </div>
          <div class="field">
            <label for="f-role">I am a…</label>
            <div class="control"><select class="select" id="f-role" name="role">
              <option value="">Choose one</option><option>Student</option><option>Teacher / Principal</option><option>Placement cell</option><option>Parent</option><option>Organisation</option>
            </select></div>
          </div>
          <div class="field">
            <label for="f-interest">Area of interest <span class="req" aria-hidden="true">*</span><span class="req-txt">(required)</span></label>
            <div class="control"><select class="select" id="f-interest" name="interest" required data-default="{default}" aria-describedby="e-interest">
              <option value="">Choose an area</option>
{opts}
            </select></div>
            <p class="err" id="e-interest" aria-live="polite">{{{{i:alert}}}}<span></span></p>
          </div>
          <div class="field full">
            <label for="f-msg">How would you like to work with us? <span class="req" aria-hidden="true">*</span><span class="req-txt">(required)</span></label>
            <div class="control"><textarea class="textarea" id="f-msg" name="message" required minlength="10" maxlength="1000" aria-describedby="e-msg c-msg"></textarea></div>
            <p class="counter" id="c-msg" aria-live="polite"></p>
            <p class="err" id="e-msg" aria-live="polite">{{{{i:alert}}}}<span></span></p>
          </div>
        </div>
        <div class="form-foot">
          <p class="small">Fields marked * are required. We only use your details to reply.</p>
          <button class="btn btn-primary" type="submit"><span class="label">Send Enquiry</span><span class="spinner" aria-hidden="true"></span>
            <svg class="done-check" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg></button>
        </div>
        <p class="sr-only form-live" aria-live="assertive"></p>
      </form>
      <div class="success" role="status">
        <svg class="stamp-check" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" fill="#E8F5EE" stroke="#187A4F" stroke-width="3" stroke-dasharray="4 5"/>
          <circle cx="60" cy="60" r="42" fill="none" stroke="#187A4F" stroke-width="2"/>
          <path d="M40 61l13 13 27-28" fill="none" stroke="#187A4F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>Thank you for reaching out.</h3>
        <p>Our team will be in touch.</p>
        <button class="link" type="button" data-reset-form style="background-color:transparent;border:0">Send another enquiry {{{{i:arrow}}}}</button>
      </div>
    </div>
  </div>
</section>'''

def sticky(interest):
    return f'''<div class="sticky-bar" aria-hidden="true"><strong>Interested?</strong><a class="btn btn-primary btn-sm" href="contact.html?interest={interest}">Enquire {{{{i:arrow}}}}</a></div>'''

HEAD = '''<!doctype html>
<html lang="en-IN" id="top">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#1B2A4E">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">
<script defer src="assets/js/main.js"></script>
</head>
<body>
'''

for page in sorted((SRC / 'pages').glob('*.html')):
    raw = page.read_text()
    meta = dict(re.findall(r'(\w+)="([^"]*)"', raw.split('\n', 1)[0]))
    body = raw.split('\n', 1)[1]
    cur = meta['current']
    H = '' if cur == 'home' else 'index.html'
    parts = [HEAD.format(title=meta['title'], desc=meta['desc']), header(cur, H, meta.get('dark') == '1'),
             '<main id="main" class="flow">' if meta.get('flow') else '<main id="main">', body]
    if meta.get('contact'):
        parts.append(contact(meta.get('interest', ''), meta.get('ch', 'Partner with us'), meta.get('cl', ''), cloud=True))
    parts.append('</main>')
    if meta.get('sticky'):
        parts.append(sticky(meta['interest']))
    parts.append(footer(H))
    parts.append('</body>\n</html>\n')
    html = render('\n'.join(parts))
    if cur == 'home':
        html = html.replace('href="index.html#top"', 'href="#top"')
    (OUT / meta['file']).write_text(html)
    print('wrote', meta['file'], len(html))
