with open('gym-app/public/fitfuel.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('function switchView(')
print('function switchView pos:', pos)
if pos != -1:
    print(text[pos:pos+500].encode('ascii', errors='replace').decode('ascii'))
