from pymongo import MongoClient
import json

f = open('stickers.json')
data = json.load(f)

client = MongoClient('127.0.0.1', 27017)
album_database = client.album
sticker_collection = album_database.Sticker

sticker_collection.insert_many(data)