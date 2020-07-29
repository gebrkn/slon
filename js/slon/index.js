/**slon - Simple Lightweight Object Notation.

 Data exchange and configuration notation, similar to JSON.

 See <https://github.com/gebrkn/slon>
 */


(function () {

    let __version__ = '0.2.2';
    let __author__ = 'Georg Barikin <georg@merribithouse.net>';

    ///


    function parse(text, options = null) {
        options = options || {}
        let b = new _Buf(text, _prepare_hooks(options.hooks))

        _ws(b)

        let v

        if (options.asArray) {
            v = _chr(b) === '[' ? _value(b) : _array(b, b.p, _EOF)
        } else if (options.asObject) {
            v = _chr(b) === '{' ? _value(b) : _object(b, b.p, _EOF)
        } else {
            v = _value(b)
        }

        _ws(b)

        if (_chr(b) === _EOF)
            return v

        _err(b, 'TRAILING_GARBAGE')
    }

    ///


    _ERRORS = {
        'INVALID_ESCAPE_SEQUENCE': 'Invalid escape sequence',
        'INVALID_HOOK': 'Invalid hook name',
        'INVALID_KEY_TYPE': 'Invalid key type',
        'INVALID_NUMBER': 'Invalid number',
        'INVALID_TOKEN': 'Invalid token',
        'MISSING_DELIMITER': 'Whitespace or "," expected',
        'MISSING_KEY_DELIMITER': 'Whitespace or ":" expected',
        'MUST_BE_ARRAY': 'Unable to assign index (array expected)',
        'MUST_BE_OBJECT': 'Unable to assign index (object expected)',
        'TRAILING_GARBAGE': 'Trailing garbage',
        'UNTERMINATED_ARRAY': 'Unterminated array',
        'UNTERMINATED_CALL': '")" expected',
        'UNTERMINATED_COMMENT': 'Unterminated block comment',
        'UNTERMINATED_OBJECT': 'Unterminated object',
        'UNTERMINATED_STRING': 'Unterminated string',
    }

    function SlonError(code, message, pos, row, col, start_pos, start_row, start_col) {
        Error.call(this, message)
        this.code = code
        this.pos = pos
        this.row = row
        this.col = col
        this.startPos = start_pos
        this.startRow = start_row
        this.startCol = start_col
    }

    ///

    let _exports = {parse, loads: parse, SlonError}

    if (typeof module !== 'undefined') {
        module.exports = _exports
    }
    if (typeof window !== 'undefined') {
        window.SLON = _exports
    }


    ///

    const _EOF = '\u{1FFFF}'
    const _EOL = '\n'
    const _SQ = "'"
    const _DQ = '"'
    const _SLASH = "\\"
    const _BACKTICK = '`'

    const _P_WS = 1 << 1
    const _P_PUNCT = 1 << 2
    const _P_LIST_DELIM = 1 << 3
    const _P_KEY_DELIM = 1 << 4
    const _P_DEC = 1 << 5
    const _P_HEX = 1 << 6
    const _P_OCT = 1 << 7
    const _P_BIN = 1 << 8

    const _P_NON_WORD = _P_WS | _P_PUNCT

    const _CMAP = {
        ' ': _P_WS,
        '\n': _P_WS,
        '\r': _P_WS,
        '\t': _P_WS,

        '[': _P_PUNCT,
        ']': _P_PUNCT,
        '{': _P_PUNCT,
        '}': _P_PUNCT,
        '(': _P_PUNCT,
        ')': _P_PUNCT,
        ',': _P_PUNCT | _P_LIST_DELIM,
        '=': _P_PUNCT | _P_KEY_DELIM,
        ':': _P_PUNCT | _P_KEY_DELIM,
        '#': _P_PUNCT,
        '/': _P_PUNCT,
        [_SLASH]: _P_PUNCT,
        [_SQ]: _P_PUNCT,
        [_DQ]: _P_PUNCT,
        [_BACKTICK]: _P_PUNCT,

        '0': _P_HEX | _P_DEC | _P_OCT | _P_BIN,
        '1': _P_HEX | _P_DEC | _P_OCT | _P_BIN,
        '2': _P_HEX | _P_DEC | _P_OCT,
        '3': _P_HEX | _P_DEC | _P_OCT,
        '4': _P_HEX | _P_DEC | _P_OCT,
        '5': _P_HEX | _P_DEC | _P_OCT,
        '6': _P_HEX | _P_DEC | _P_OCT,
        '7': _P_HEX | _P_DEC | _P_OCT,
        '8': _P_HEX | _P_DEC,
        '9': _P_HEX | _P_DEC,
        'a': _P_HEX,
        'b': _P_HEX,
        'c': _P_HEX,
        'd': _P_HEX,
        'e': _P_HEX,
        'f': _P_HEX,
        'A': _P_HEX,
        'B': _P_HEX,
        'C': _P_HEX,
        'D': _P_HEX,
        'E': _P_HEX,
        'F': _P_HEX,

    }

    const _ESCAPES = {
        "'": "'",
        '"': '"',
        '0': '\0',
        '/': '/',
        '\\': '\\',
        'b': '\b',
        'f': '\f',
        'n': '\n',
        'r': '\r',
        't': '\t',
    }

    const _WORDS = {
        'true': true,
        'on': true,
        'yes': true,
        'false': false,
        'off': false,
        'no': false,
        'null': null,
        'none': null,
    }

    const _SURR_1_START = 0xD800
    const _SURR_1_END = 0xDBFF
    const _SURR_2_START = 0xDC00
    const _SURR_2_END = 0xDFFF

    const _MAX_UNICODE = 0x110000

    ///

    function _Buf(text, hooks) {
        this.text = [...text]
        this.tlen = this.text.length
        this.p = 0
        this.hooks = hooks
    }

    ///

    function _prepare_hooks(hooks) {
        if (!hooks)
            return {}

        return hooks
    }

    ///

    function _value(b) {
        let ch = _chr(b)

        if (ch === _SQ) {
            if (_chr(b, 1) === _SQ && _chr(b, 2) === _SQ) {
                b.p += 3
                return _single3(b, b.p - 3)
            } else {
                b.p += 1
                return _single1(b, b.p - 1)
            }
        }

        if (ch === _DQ) {
            if (_chr(b, 1) === _DQ && _chr(b, 2) === _DQ) {
                b.p += 3
                return _double3(b, b.p - 3, false)
            } else {
                b.p += 1
                return _double1(b, b.p - 1)
            }
        }

        if (ch === _BACKTICK) {
            b.p += 1
            return _double3(b, b.p - 1, true)
        }

        if (ch === '+') {
            b.p += 1
            return _number(b, b.p - 1)
        }

        if (ch === '-') {
            b.p += 1
            return -1 * _number(b, b.p - 1)
        }

        if ((_CMAP[ch] & _P_DEC) || ch === '.') {
            return _number(b, b.p)
        }

        if (ch === '[') {
            b.p += 1
            return _array(b, b.p - 1, ']')
        }

        if (ch === '{') {
            b.p += 1
            return _object(b, b.p - 1, '}')
        }

        if (_CMAP[ch] & _P_NON_WORD)
            _err(b, 'INVALID_TOKEN')

        return _word(b, b.p)
    }


    ///

    function _single1(b, start) {
        let out = ''

        while (1) {
            let ch = _chr(b)
            if (ch === _EOL || ch === _EOF)
                _err(b, 'UNTERMINATED_STRING', {start})
            if (ch === _SQ) {
                b.p += 1
                break
            }
            out += ch
            b.p += 1
        }
        return out
    }


    function _single3(b, start) {
        let out = ''
        let dedent = _CMAP[_chr(b)] & _P_WS

        while (1) {
            let ch = _chr(b)
            if (ch === _EOF)
                _err(b, 'UNTERMINATED_STRING', {start})
            if (ch === _SQ && _chr(b, 1) === _SQ && _chr(b, 2) === _SQ) {
                b.p += 3
                break
            }
            out += ch
            b.p += 1
        }
        out = dedent ? _dedent(out) : _compress(out)
        return out
    }


    function _double1(b, start) {
        let out = ''

        while (1) {
            let ch = _chr(b)
            if (ch === _EOL || ch === _EOF)
                _err(b, 'UNTERMINATED_STRING', {start})
            if (ch === _DQ) {
                b.p += 1
                break
            }
            if (ch === _SLASH) {
                b.p += 1
                out += _escape(b, b.p - 1)
            } else {
                out += ch
                b.p += 1
            }
        }
        return out
    }

    function _double3(b, start, backtick) {
        let out = ''
        let escapes = []
        let esc_mark = _EOF
        let dedent = _CMAP[_chr(b)] & _P_WS

        while (1) {
            let ch = _chr(b)
            if (ch === _EOF)
                _err(b, 'UNTERMINATED_STRING', {start})
            if (backtick && ch === _BACKTICK) {
                b.p += 1
                break
            }
            if (!backtick && ch === _DQ && _chr(b, 1) === _DQ && _chr(b, 2) === _DQ) {
                b.p += 3
                break
            }
            if (ch === _SLASH) {
                out += esc_mark
                b.p += 1
                escapes.push(_escape(b, b.p - 1))
            } else {
                out += ch
                b.p += 1
            }
        }

        out = dedent ? _dedent(out) : _compress(out)
        if (!escapes.length)
            return out

        let out2 = ''
        let n = 0

        for (let ch of out) {
            if (ch === esc_mark) {
                out2 += escapes[n]
                n += 1
            } else
                out2 += ch
        }
        return out2
    }


    function _dedent(s) {
        let indent = 1e20
        let lines = []

        for (let ln of s.split(_EOL))
            lines.push(_rstrip(ln))

        if (lines.length && !lines[0])
            lines.shift()
        if (lines.length && !lines[-1])
            lines.pop()

        for (let ln of lines)
            if (ln)
                indent = Math.min(indent, ln.length - _strip(ln).length)

        return lines.map(ln => ln.slice(indent)).join(_EOL)
    }


    function _compress(s) {
        return _strip(s).split(/\s+/).join(' ')
    }


    function _escape(b, start) {
        let ch = _chr(b)

        if (_ESCAPES[ch]) {
            b.p += 1
            return _ESCAPES[ch]
        }

        let cp = _unicode_escape(b)
        if (cp < 0 || cp >= _MAX_UNICODE)
            _err(b, 'INVALID_ESCAPE_SEQUENCE', {pos: start})

        return String.fromCodePoint(cp)
    }


    function _unicode_escape(b) {
        let ch = _chr(b)

        if (ch === 'x') {
            b.p += 1
            return _hexval(b, 2, 2)
        }

        if (ch === 'U') {
            b.p += 1
            return _hexval(b, 8, 8)
        }

        if (ch === 'u' && _chr(b, 1) === '{') {
            b.p += 2
            let cp = _hexval(b, 1, 8)
            if (cp < 0 || _chr(b) !== '}')
                return -1
            b.p += 1
            return cp
        }

        if (ch === 'u') {
            b.p += 1
            let cp = _hexval(b, 4, 4)
            if (cp < 0)
                return -1

            if (_SURR_1_START <= cp && cp <= _SURR_1_END) {
                let savep = b.p

                if (_chr(b) === _SLASH && _chr(b, 1) === 'u') {
                    b.p += 2
                    let cp2 = _hexval(b, 4, 4)
                    if (_SURR_2_START <= cp2 && cp2 <= _SURR_2_END)
                        return 0x10000 + (((cp - _SURR_1_START) << 10) | (cp2 - _SURR_2_START))
                }

                b.p = savep
            }
            return cp
        }

        return -1
    }

    function _hexval(b, minlen, maxlen) {
        let out = ''
        let n = 0

        while (n < maxlen) {
            let ch = _chr(b)
            if (_CMAP[ch] & _P_HEX) {
                out += ch
                b.p += 1
                n += 1
            } else
                break
        }

        if (minlen <= n && n <= maxlen)
            return _int(out, 16)

        return -1
    }

    ///

    function _number(b, start) {
        if (_chr(b) === '0') {
            let ch = _chr(b, 1)
            if (ch === 'x' || ch === 'X') {
                b.p += 2
                return _nondec(b, start, _P_HEX, 16)
            }
            if (ch === 'o' || ch === 'O') {
                b.p += 2
                return _nondec(b, start, _P_OCT, 8)
            }
            if (ch === 'b' || ch === 'B') {
                b.p += 2
                return _nondec(b, start, _P_BIN, 2)
            }
        }
        return _decnum(b, start)
    }

    function _decnum(b, start) {
        let i = _intseq(b, _P_DEC)

        let f = ''
        if (_chr(b) === '.') {
            b.p += 1
            f = _intseq(b, _P_DEC)
            if (!f)
                _err(b, 'INVALID_NUMBER', {pos: start})
        }

        if (!i && !f)
            _err(b, 'INVALID_NUMBER', {pos: start})

        let e = ''
        let esign = ''

        let ch = _chr(b)
        if (ch === 'e' || ch === 'E') {
            b.p += 1
            ch = _chr(b)
            if (ch === '+' || ch === '-') {
                esign = ch
                b.p += 1
            }
            e = _intseq(b, _P_DEC)
            if (!e)
                _err(b, 'INVALID_NUMBER', {pos: start})
        }

        if (f || e)
            return _float(i, f, esign, e)

        return _int(i, 10)
    }

    function _nondec(b, start, prop, base) {
        let n = _intseq(b, prop)
        if (!n)
            _err(b, 'INVALID_NUMBER', {pos: start})
        return _int(n, base)
    }

    function _intseq(b, prop) {
        let out = ''

        while (1) {
            let ch = _chr(b)
            if (_CMAP[ch] & prop) {
                out += ch
                b.p += 1
            } else if (ch === '_')
                b.p += 1
            else
                break
        }
        return out
    }

    ///

    function _array(b, start, term) {
        let out = []
        let has_ws = true

        _ws(b, _P_WS | _P_LIST_DELIM)

        while (1) {
            let ch = _chr(b)

            if (ch === term) {
                b.p += 1
                break
            }

            if (ch === _EOF)
                _err(b, 'UNTERMINATED_ARRAY', {start})

            if (!has_ws)
                _err(b, 'MISSING_DELIMITER')

            out.push(_value(b))
            has_ws = _ws(b, _P_WS | _P_LIST_DELIM)
        }
        return out
    }

    ///

    function _object(b, start, term) {
        let out = Object.create(null)
        let has_ws = true

        _ws(b, _P_WS | _P_LIST_DELIM)

        while (1) {
            let ch = _chr(b)

            if (ch === term) {
                b.p += 1
                break
            }

            if (ch === _EOF)
                _err(b, 'UNTERMINATED_OBJECT', {start})

            if (!has_ws)
                _err(b, 'MISSING_DELIMITER')

            let key_pos = b.p
            let is_quoted = ch === _SQ || ch === _DQ || ch === _BACKTICK
            let key = _value(b)

            if (!_is_number(key) && !_is_bool(key) && !_is_str(key))
                _err(b, 'INVALID_KEY_TYPE', {pos: key_pos})

            if (!_ws(b, _P_WS | _P_KEY_DELIM))
                _err(b, 'MISSING_KEY_DELIMITER')

            let val = _value(b)

            if (_is_str(key) && !is_quoted && (_instr('.', key) || _instr('+', key)))
                _store(b, out, key, val, key_pos)
            else
                out[key] = val

            has_ws = _ws(b, _P_WS | _P_LIST_DELIM)
        }

        return out
    }


    function _store(b, obj, cmp_key, val, key_pos) {
        obj = [obj]
        let key = 0
        let is_int = true

        let keys = ['']
        let n = 0
        for (let ch of cmp_key) {
            if (ch === '.') {
                keys.push('')
                n += 1
            } else if (ch === '+') {
                keys.push('+')
                n += 1
            } else
                keys[n] += ch
        }

        for (let k of keys) {
            if (_isdigit(k)) {
                obj = _store_one(b, obj, key, is_int, [], false, key_pos)
                key = _int(k, 10)
                is_int = true
            } else if (k === '+') {
                obj = _store_one(b, obj, key, is_int, [], false, key_pos)
                key = -1
                is_int = true
            } else {
                obj = _store_one(b, obj, key, is_int, {}, false, key_pos)
                key = k
                is_int = false
            }
        }
        _store_one(b, obj, key, is_int, val, true, key_pos)
    }


    function _store_one(b, obj, key, is_int, val, force, key_pos) {
        if (is_int) {
            if (!_is_array(obj))
                _err(b, 'MUST_BE_ARRAY', {pos: key_pos})

            let le = obj.length
            if (key === -1)
                key = le
            while (key >= le) {
                obj.push(null)
                le += 1
            }

            if (force || obj[key] === null)
                obj[key] = val
            return obj[key]

        } else {
            if (!_is_object(obj))
                _err(b, 'MUST_BE_OBJECT', {pos: key_pos})

            if (force || !(key in obj))
                obj[key] = val
            return obj[key]
        }
    }


    ///

    function _word(b, start) {
        let w = ''

        while (1) {
            let ch = _chr(b)
            if (ch === _EOF || (_CMAP[ch] & _P_NON_WORD))
                break
            w += ch
            b.p += 1
        }

        let k = w.toLowerCase()
        if (k in _WORDS)
            return _WORDS[k]

        if (_chr(b) === '(') {
            let call_pos = b.p
            b.p += 1

            _ws(b)
            let val = _value(b)
            _ws(b)

            if (_chr(b) !== ')')
                _err(b, 'UNTERMINATED_CALL', {start: call_pos})

            b.p += 1

            if (!b.hooks[w])
                _err(b, 'INVALID_HOOK', {pos: start})
            return b.hooks[w](val)
        }

        return w
    }

    ///

    function _ws(b, prop = _P_WS) {
        let start = b.p

        while (1) {
            let ch = _chr(b)
            if (_CMAP[ch] & prop)
                b.p += 1
            else if (ch === '#') {
                b.p += 1
                _line_comment(b, b.p - 1)
            } else if (ch === '/' && _chr(b, 1) === '/') {
                b.p += 2
                _line_comment(b, b.p - 2)
            } else if (ch === '/' && _chr(b, 1) === '*') {
                b.p += 2
                _block_comment(b, b.p - 2)
            } else
                break
        }

        return b.p > start
    }

    function _line_comment(b, start) {
        while (1) {
            let ch = _chr(b)
            if (ch === _EOF)
                break
            if (ch === _EOL) {
                b.p += 1
                break
            }
            b.p += 1
        }
    }


    function _block_comment(b, start) {
        while (1) {
            let ch = _chr(b)
            if (ch === _EOF)
                _err(b, 'UNTERMINATED_COMMENT', {start})
            if (ch === '*' && _chr(b, 1) === '/') {
                b.p += 2
                break
            }
            b.p += 1
        }
    }

    function _chr(b, d = 0) {
        if (b.p + d < b.tlen)
            return b.text[b.p + d]
        return _EOF
    }


    function _int(s, base) {
        return parseInt(s, base)
    }


    function _float(i, f, esign, e) {
        return parseFloat((i || '0') + '.' + (f || '0') + 'E' + (esign || '') + (e || '0'))
    }


    function _is_number(x) {
        return typeof x === 'number'
    }


    function _is_str(x) {
        return typeof x === 'string'
    }


    function _is_bool(x) {
        return typeof x === 'boolean'
    }

    function _is_array(x) {
        return Array.isArray(x)
    }

    function _is_object(x) {
        return x && typeof x === 'object'
    }


    ///

    function _err(b, code, opts) {
        opts = opts || {}
        opts.pos = 'pos' in opts ? opts.pos : b.p

        let message = _ERRORS[code]

        let rc = _rowcol(b, opts.pos)
        let row = rc[0]
        let col = rc[1]
        let start_row
        let start_col

        message = `${message}) line ${row} column ${col} (offset ${opts.pos})`
        if ('start' in opts) {
            rc = _rowcol(b, opts.start)
            start_row = rc[0]
            start_col = rc[1]
            message += `, started at line ${start_row} column ${start_col} (offset ${opts.start})`
        } else {
            opts.start = opts.pos
            start_row = row
            start_col = col
        }

        throw new SlonError(code, message, opts.pos, row, col, opts.start, start_row, start_col)
    }


    function _rowcol(b, pos) {
        let n = 0, r = 0, c = 0
        while (n < pos) {
            if (b.text[n] === _EOL) {
                r += 1
                c = 0
            } else
                c += 1
            n += 1
        }
        return [r + 1, c + 1]
    }

    ///

    function _instr(ch, s) {
        return s.indexOf(ch) >= 0
    }

    function _isdigit(s) {
        return /^[0-9]+$/.test(s)
    }

    function _rstrip(s) {
        return s.replace(/\s+$/g, '')
    }

    function _strip(s) {
        return s.replace(/^\s+/, '').replace(/\s+$/, '')
    }

})();
