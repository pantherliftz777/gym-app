with open('gym-app/public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

head_end = html.find('</head>')
print(html[:head_end])
