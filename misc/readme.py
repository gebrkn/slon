import sys
import os
import re
import json

DIR = os.path.dirname(__file__)

sys.path.insert(0, DIR + '/../py')

import slon

text = open(DIR + '/README.md').read()


def _example(m):
    exm = m.group(1).strip()
    res = slon.loads(exm)
    js = json.dumps(res, indent=4, ensure_ascii=False)

    out = []
    qq = '```'

    out.extend(['###### slon:', qq, exm, qq])

    out.extend(['###### json:', qq, js, qq])

    return '\n'.join(out)


text = re.sub(r'(?s)```EXAMPLE(.+?)```', _example, text)

toc = []

for ln in text.splitlines():
    m = re.match(r'^(#{2,4})([^#].+)', ln.strip())
    if m:
        d, t = m.groups()
        toc.append(
            '%s * [%s](#%s)' % (
                '    ' * (len(d) - 2),
                t.strip(),
                t.strip().lower().replace(' ', '-')
            ))

text = text.replace('{toc}', '\n'.join(toc))

with open(DIR + '/../README.md', 'w') as fp:
    fp.write(text)
