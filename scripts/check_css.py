with open('gym-app/public/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

pos = css.find('/* --- DRIBBLE-INSPIRED CINEMATIC LANDING PAGE')
if pos == -1:
    pos = css.find('landing-cinematic-hero')
print('Landing CSS start index:', pos)
print('Total CSS length:', len(css))
