with open('gym-app/public/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('id="view-landing"')
print('view-landing pos:', pos)
print('Before view-landing:')
print(text[pos-400:pos].encode('ascii', errors='replace').decode('ascii'))
