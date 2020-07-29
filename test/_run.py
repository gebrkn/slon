import sys
import os
import subprocess
import json
import re
import tempfile
import shutil

_cmd = {
    'py': sys.executable,
    'js': 'node'
}


def main():
    root = os.path.abspath(os.path.dirname(__file__) + '/..')
    tmp = tempfile.mkdtemp()
    delim = '~~~~~~~~~~~~~~~~~~~~~~'

    tests = enum_tests(os.path.join(root, 'test'))
    sources = delim.join(t['source'] for t in tests)
    sources_path = os.path.join(tmp, '_sources')
    write(sources_path, sources)

    results_path = os.path.join(tmp, '_results')

    ls = locals()

    for lang in 'py', 'js':
        code_path = os.path.join(tmp, '_test.' + lang)

        code = re.sub(r'{(\w+)}', lambda m: ls[m.group(1)], read(os.path.join(root, 'test/_template.' + lang)))
        write(code_path, code)
        unlink(results_path)
        run([_cmd[lang], code_path])
        check(lang, tests, read(results_path).split(delim))

    shutil.rmtree(tmp)


def enum_tests(dir):
    res = []

    for p in os.listdir(dir):
        if p.endswith('.test.txt'):
            p = os.path.join(dir, p)
            res.extend(parse_tests(p, read(p)))

    return res


def parse_tests(path, text):
    buf = ''
    tests = []
    start = True

    for n, ln in enumerate(text.splitlines(keepends=True)):
        if ln.startswith('##'):
            continue
        if ln.startswith('TEST'):
            if tests:
                add_expected(tests[-1], buf)
            tests.append({
                'title': ln[4:].strip(),
                'path': path,
                'line': n + 1,
            })
            start = True
        elif ln.startswith('=='):
            if start:
                start = False
                buf = ''
            else:
                tests[-1]['source'] = buf
                buf = ''
        else:
            buf += ln

    if tests:
        add_expected(tests[-1], buf)

    return tests


def add_expected(test, buf):
    exp = buf.strip().split('\n')
    if len(exp) == 1:
        test['expected'] = exp[0]
    else:
        test['expected'] = {}
        for s in exp:
            s = s.split('=', 1)
            test['expected'][s[0]] = s[1].strip()


def check(lang, tests, results):
    p = f = 0
    for t, r in zip(tests, results):
        exp = t['expected']
        if isinstance(exp, dict):
            exp = exp[lang]
        if r != exp:
            cprint('red', 'FAILED: %s (%s:%s)' % (t['title'], t['path'], t['line']))
            cprint('red', 'EXPECT: %s' % exp)
            cprint('red', 'ACTUAL: %s' % r)
            cprint('red', '')
            f += 1
        else:
            p += 1

    if not f:
        cprint('green', '*** %s: %d passed\n' % (lang, p))
    else:
        cprint('red', '*** %s: %d passed, %d FAILED\n' % (lang, p, f))


def write(path, txt):
    with open(path, 'wt', encoding='utf8') as fp:
        fp.write(txt)


def read(path):
    with open(path, 'rt', encoding='utf8') as fp:
        return fp.read()


def unlink(path):
    try:
        os.unlink(path)
    except OSError:
        pass


def run(cmd):
    args = {
        'stdin': None,
        'stdout': subprocess.PIPE,
        'stderr': subprocess.STDOUT,
        'shell': False,
    }
    p = subprocess.Popen(cmd, **args)
    out, err = p.communicate()
    if out or err:
        print('ERROR', cmd)
        print(errstr(out))
        print(errstr(err))


def errstr(s):
    if not s:
        return ''
    if isinstance(s, bytes):
        s = s.decode('utf8')
    return str(s)


COLORS = {
    'black': '\x1b[30m',
    'red': '\x1b[31m',
    'green': '\x1b[32m',
    'yellow': '\x1b[33m',
    'blue': '\x1b[34m',
    'magenta': '\x1b[35m',
    'cyan': '\x1b[36m',
    'white': '\x1b[37m',
    'reset': '\x1b[0m',
}


def cprint(clr, msg):
    if not os.isatty(sys.stdin.fileno()):
        print(msg)
    else:
        print(COLORS[clr] + msg + COLORS['reset'])


if __name__ == '__main__':
    main()
