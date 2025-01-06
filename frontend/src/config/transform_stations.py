import json

# Read the JSON file
with open('stations.json', 'r') as file:
    stations = json.load(file)

# Transform the data
for station in stations:
    station['NAME'] = station['NAME'].replace(f" ({station['ALPHA']})", "")

# Write the transformed data back to a new file
with open('stations-transformed.json', 'w') as file:
    json.dump(stations, file, indent=2)
