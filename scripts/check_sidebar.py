with open('gym-app/public/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('class="sidebar-nav"')
if pos == -1:
    pos = text.find('<nav class="sidebar')
if pos == -1:
    pos = text.find('aria-label="Main navigation"')

print('Sidebar nav pos:', pos)
if pos != -1:
    print(text[pos:pos+600].encode('ascii', errors='replace').decode('ascii'))
