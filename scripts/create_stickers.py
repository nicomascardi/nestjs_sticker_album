import pandas as pd
import json

f = open('api.json')
data = json.load(f)
players = data['players']
df = pd.json_normalize(players)
newdf = df[['player.firstname','player.lastname','player.age','player.birth.date','player.height', 'player.weight', 'player.nationality', 'player.photo']]

out = newdf.to_json(orient="records").replace('player.', '').replace('.date', '')

with open('stickers.json', 'w') as f:
    f.write(out)