# Append fullscreen landing rules to styles.css
fullscreen_rules = '''
/* --- FULLSCREEN DRIBBBLE LANDING MODE --- */
html.landing-active .sidebar,
body.landing-active .sidebar,
html.landing-active .top-bar,
body.landing-active .top-bar,
html.landing-active .mobile-nav-bar,
body.landing-active .mobile-nav-bar,
html:has(#view-landing.active) .sidebar,
body:has(#view-landing.active) .sidebar,
html:has(#view-landing.active) .top-bar,
body:has(#view-landing.active) .top-bar,
html:has(#view-landing.active) .mobile-nav-bar,
body:has(#view-landing.active) .mobile-nav-bar {
  display: none !important;
}

html.landing-active .main-content,
body.landing-active .main-content,
html:has(#view-landing.active) .main-content,
body:has(#view-landing.active) .main-content {
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
}

html.landing-active .page-content,
body.landing-active .page-content,
html:has(#view-landing.active) .page-content,
body:has(#view-landing.active) .page-content {
  padding: 0 !important;
  margin: 0 !important;
  max-width: 100% !important;
}
'''

with open('gym-app/public/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

if '/* --- FULLSCREEN DRIBBBLE LANDING MODE --- */' not in css:
    css += '\n' + fullscreen_rules
    with open('gym-app/public/styles.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print('Fullscreen landing rules appended to styles.css!')
else:
    print('Fullscreen landing rules already present.')
