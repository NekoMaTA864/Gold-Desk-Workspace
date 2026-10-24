"""Fetch only the three already-public upstream artifacts, pinned by commit and SHA256."""
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]

def main():
    manifest = json.loads((ROOT/'scripts/public-data-manifest.json').read_text(encoding='utf-8'))
    dest = ROOT/'frontend/public/data'
    dest.mkdir(parents=True, exist_ok=True)
    for name, expected in manifest['files'].items():
        path = dest/name
        if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest() == expected:
            print(f'{name}: verified cached public artifact')
            continue
        url = f"https://raw.githubusercontent.com/kuan35/Gold-Trading-Project/{manifest['commit']}/frontend/public/data/{name}"
        with urlopen(Request(url, headers={'User-Agent':'GoldDesk-public-data-build'}), timeout=120) as response:
            payload = response.read()
        if hashlib.sha256(payload).hexdigest() != expected:
            raise ValueError(f'Public artifact checksum mismatch: {name}')
        temporary = path.with_suffix('.download')
        temporary.write_bytes(payload)
        temporary.replace(path)
        print(f'{name}: downloaded and verified public artifact')

if __name__ == '__main__':
    main()
