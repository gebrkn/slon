import u

def test_invalid_token():
    with u.raises(u.DecodeError) as e:
        u.loads(
            "'aa\n"
            "123' }"
        )
    assert e.value.args == (u.err.INVALID_TOKEN, 2, 6)


def test_premature_eof():
    with u.raises(u.DecodeError) as e:
        u.loads(
            "#aa\n"
            "#bb'\n"
            "{ foo\n"
            "bar"
        )
    assert e.value.args == (u.err.PREMATURE_EOF, 4, 3)


def test_decode_error_invalid_escape():
    with u.raises(u.DecodeError) as e:
        u.loads(r'  "ab\z"  ')
    assert e.value.args == (u.err.DECODE_ERROR, 1, 3)


def test_decode_error_bad_hex4():
    with u.raises(u.DecodeError) as e:
        u.loads(r'  "ab\uZ"  ')
    assert e.value.args == (u.err.DECODE_ERROR, 1, 3)


def test_decode_error_short_hex4():
    with u.raises(u.DecodeError) as e:
        u.loads(r'  "ab\u123"  ')
    assert e.value.args == (u.err.DECODE_ERROR, 1, 3)


def test_decode_error_bare_surrogate():
    with u.raises(u.DecodeError) as e:
        u.loads(r'  "ab\uD801 "  ')
    assert e.value.args == (u.err.DECODE_ERROR, 1, 3)


def test_decode_error_bad_surrogate():
    with u.raises(u.DecodeError) as e:
        u.loads(r'  "ab\uD801\u1234 "  ')
    assert e.value.args == (u.err.DECODE_ERROR, 1, 3)


def test_decode_error_bad_hex8():
    with u.raises(u.DecodeError) as e:
        u.loads(r'  "ab\Uzjzjzjz"  ')
    assert e.value.args == (u.err.DECODE_ERROR, 1, 3)


def test_decode_error_short_hex8():
    with u.raises(u.DecodeError) as e:
        u.loads(r'  "ab\U1234567"  ')
    assert e.value.args == (u.err.DECODE_ERROR, 1, 3)


def test_invalid_number_under():
    with u.raises(u.DecodeError) as e:
        u.loads(r'  0x___  ')
    assert e.value.args == (u.err.INVALID_NUMBER, 1, 3)


def test_invalid_key_float():
    with u.raises(u.DecodeError) as e:
        u.loads(
            '  {\n'
            '   ok 1\n'
            '   456.0 woo\n'
        )
    assert e.value.args == (u.err.INVALID_KEY, 3, 4)


def test_invalid_key_array():
    with u.raises(u.DecodeError) as e:
        u.loads(
            '  {\n'
            '   ok 1\n'
            '   [456] woo\n'
        )
    assert e.value.args == (u.err.INVALID_KEY, 3, 4)


def test_invalid_key_object():
    with u.raises(u.DecodeError) as e:
        u.loads(
            '  {\n'
            '   ok 1\n'
            '   {456 789} woo\n'
        )
    assert e.value.args == (u.err.INVALID_KEY, 3, 4)

def test_array_expected():
    with u.raises(u.DecodeError) as e:
        u.loads(
            '  {\n'
            '   a 123\n'
            '   a.0 3\n'
        )
    assert e.value.args == (u.err.ARRAY_EXPECTED, 3, 4)

def test_object_expected():
    with u.raises(u.DecodeError) as e:
        u.loads(
            '  {\n'
            '   a 123\n'
            '   a.b 3\n'
        )
    assert e.value.args == (u.err.OBJECT_EXPECTED, 3, 4)
