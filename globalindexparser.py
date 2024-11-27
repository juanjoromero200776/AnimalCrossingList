import os
import json

# Directory where your JSON files are stored
directory = "./"  # Update to your directory path
global_index = []

# Iterate through all files in the directory
for file_name in os.listdir(directory):
    if "_" in file_name and file_name.endswith(".json"):
        file_path = os.path.join(directory, file_name)
        
        try:
            with open(file_path, "r", encoding="utf-8") as json_file:
                data = json.load(json_file)
                
                # Extract the category from the filename (e.g., "fish" or "furniture")
                category, game = file_name.split("_")[0], file_name.split("_")[1].split(".")[0]
                
                for key, series_list in data.items():
                    for series in series_list:
                        for item in series["items"]:
                            # Build a global index entry
                            entry = {
                                "name": item["name"],
                                "category": category,
                                "game": game,
                                "bells": item.get("bells", None),
                                "source": item.get("source", None),
                                "series": series["series"]
                            }
                            global_index.append(entry)
        
        except Exception as e:
            print(f"Error processing {file_name}: {e}")

# Save the global index to a JSON file
output_file = "global_index.json"
with open(output_file, "w", encoding="utf-8") as outfile:
    json.dump(global_index, outfile, indent=4, ensure_ascii=False)

output_file
