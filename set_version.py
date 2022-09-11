import os
import json

env_file_path = os.getenv('GITHUB_ENV')

with open(env_file_path, "a") as env_file:
    version = json.load(open('manifest.json'))['version']
    env_file.write(f"VERSION=v{version}")
