with open('gym-app/public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()
pos = html.find('id="view-landing"')
print('view-landing index:', pos)
end_pos = html.find('<!-- END LANDING PAGE -->', pos)
print('END LANDING PAGE index:', end_pos)
if pos != -1 and end_pos != -1:
    print('Landing section length:', end_pos - pos)
