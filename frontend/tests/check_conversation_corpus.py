"""Run the formal-path portion of the shared 30-sentence corpus without a server or broker."""
import json
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from backend.conversation_intent import interpret_message

seed = dict(side='BUY', lot='0.1', order_type='LIMIT', limit_price='4090', sl='4080', tp='4110')
cases = json.loads((ROOT / 'docs/interaction-cases-30.json').read_text(encoding='utf-8'))
formal = [c for c in cases if c['target'] == 'formal']
assert len(formal) == 10
for case in formal:
    draft = deepcopy(seed) if case.get('existing') else None
    before = deepcopy(draft)
    result = interpret_message(case['text'], draft=draft)
    for key, value in case['expected'].items():
        assert result[key] == value, (case['id'], key, result[key], value)
    assert draft == before, case['id']
    print(case['id'], 'PASS')
print('Formal corpus: 10 passed; no network, model or broker calls.')
