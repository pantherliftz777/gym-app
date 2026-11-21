with open('gym-app/public/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

pos = css.find('/* --- DRIBBLE-INSPIRED CINEMATIC LANDING PAGE')
if pos == -1:
    pos = css.find('landing-cinematic-hero')
    if pos != -1:
        pos = css.rfind('/*', 0, pos)

print('Position of previous landing CSS:', pos)
if pos != -1:
    print('Snippet before pos:', css[pos-100:pos])
