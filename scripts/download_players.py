import requests
import json
import pandas as pd


# Step 1 
players = []

for pageNumber in range(31,38):
    print("https://v3.football.api-sports.io/players?league=1&season=2018&page="+str(pageNumber))

    body=requests.get("https://v3.football.api-sports.io/players?league=1&season=2018&page="+str(pageNumber), headers={"x-apisports-key":"6c3886cb7a765557d404dab4417aeb02"})
    print("players: " + str(len(body.json()['response'])))
    for player in body.json()['response']:
        players.append(player)
    
with open("output_3.json", "w") as output_file:
    json.dump({"players": players}, output_file, indent=4, ensure_ascii = False) 