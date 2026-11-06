with open('gym-app/public/fitfuel.js', 'r', encoding='utf-8') as f:
    text = f.read()

pos = 66889
start = max(0, pos - 200)
end = min(len(text), pos + 400)
for line in text[start:end].split('\n'):
    print(line)
