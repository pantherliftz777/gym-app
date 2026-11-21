with open('gym-app/public/dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# In dashboard.html:
# 1. Remove #view-landing or make view-today active
html = html.replace('id="view-landing" class="view active', 'id="view-landing" class="view')
html = html.replace('id="view-today" class="view"', 'id="view-today" class="view active"')
html = html.replace('<section class="view active fitusion-landing-container" id="view-landing"', '<section class="view fitusion-landing-container" id="view-landing"')

# In sidebar, make Showcase link to "/"
html = html.replace('onclick="switchView(\'landing\')"', 'onclick="window.location.href=\'/\'"')

with open('gym-app/public/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('dashboard.html configured for active view today and return link to /')
