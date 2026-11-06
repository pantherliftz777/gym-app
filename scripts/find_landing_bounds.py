with open('gym-app/public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pos = html.find('id="view-landing"')
print('view-landing index:', pos)
next_view = html.find('id="view-today"', pos)
print('view-today index:', next_view)
print('Section snippet start:')
print(html[pos:pos+300])
print('Section snippet end:')
print(html[next_view-300:next_view])
