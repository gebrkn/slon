import sys

sys.path.insert(0, "{root}/py")
import slon

with open('{sources_path}', encoding='utf8') as fp:
    sources = fp.read()

delim = '{delim}'
res = []

HOOKS = {
    'upper': lambda x: x.upper(),
    'add5': lambda x: x + 5,
    'addX': lambda x: x + 'x',
}


def serialize(x):
    if x is None:
        return 'null'
    if isinstance(x, bool):
        return 'true' if x else 'false'
    if isinstance(x, (int, float)):
        return str(x)
    if isinstance(x, str):
        s = ''
        for c in x:
            n = ord(c)
            if 32 <= n <= 127:
                s += c
            else:
                s += r'\u{%x}' % n
        return '"' + s + '"'
    if isinstance(x, list):
        return '[' + ', '.join(serialize(v) for v in x) + ']'
    if isinstance(x, dict):
        return '{' + ', '.join(serialize(k) + ': ' + serialize(v) for k, v in x.items()) + '}'
    raise ValueError('serialization error')


for src in sources.split(delim):
    try:
        r = slon.loads(src, hooks=HOOKS)
        r = serialize(r)
    except slon.SlonError as err:
        r = 'ERROR:%s:%s:%s:%s:%s' % (err.code, err.row, err.col, err.start_row, err.start_col)
    except Exception as err:
        r = 'ERROR:%s' % repr(err)
    res.append(r)

with open('{results_path}', 'wt', encoding='utf8') as fp:
    fp.write(delim.join(res))
