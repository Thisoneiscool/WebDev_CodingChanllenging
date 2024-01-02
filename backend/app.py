from flask import Flask, jsonify, render_template
import json

app = Flask(__name__, static_folder = '../frontend/static', template_folder = '../frontend/templates')


@app.route('/')
def index():
    return render_template('index.html')

# Load Json data from file
with open('soccer_small.json') as file:
  players_data = json.load(file)

#Endpoint for retrieval of all players
@app.route('/players/', methods=['GET'])
def get_players():
  return jsonify(players_data)

# Endpoint to return a specific player by name
@app.route('/players/<name>', methods =['GET'])
def get_player(name):
  player = next((p for p in players_data if p['Name'].lower() == name.lower()), None)
  return jsonify(player) if player else('', 404)

# Endpoint to return all clubs with their players
@app.route('/clubs/', methods=['GET'])
def get_clubs():
  clubs = {}
  for player in players_data:
    club = player['Club']
    if club not in clubs:
      clubs[club] = []
    clubs[club].append(player['Name'])
  return jsonify(clubs)

# Endpoint to return all attribute names
@app.route('/attributes/', methods=['GET'])
def get_attributes():
  if players_data:
    return jsonify(list(players_data[0].keys()))
  else: 
    return jsonify([])

if __name__ == '__main__':
  app.run(debug=True)