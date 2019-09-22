import u


def test_null():
    s = u.loads('null')
    assert s is None


def test_bool():

    s = u.loads('yes')
    assert s == True

    s = u.loads('true')
    assert s == True

    s = u.loads('ON')
    assert s == True

    s = u.loads('no')
    assert s == False

    s = u.loads('false')
    assert s == False

    s = u.loads('Off')
    assert s == False


def test_number():
    s = u.loads('123')
    assert s == 123 and isinstance(s, int)

    s = u.loads('123.0')
    assert s == 123.0 and isinstance(s, float)

    s = u.loads('123.456')
    assert s == 123.456

    s = u.loads('+123.456e3')
    assert s == 123456

    s = u.loads('+1_2___3_4')
    assert s == 1234


def test_hex_number():
    s = u.loads('0x1234abc')
    assert s == 0x1234abc

    s = u.loads('0x1234_a_b_c')
    assert s == 0x1234abc


def test_literal_string():
    s = u.loads(r"""
        'hello'
    """)
    assert s == 'hello'

    s = u.loads(r"""
        'hel\nlo\u1234'
    """)
    assert s == 'hel\\nlo\\u1234'


def test_literal_string_as_is():
    s = u.loads(r"""
        ' a  b  c  '
    """)
    assert s == ' a  b  c  '


def test_literal_string_remove_ws():
    s = u.loads(r"""
        '
        
            a
                b
                    c
        
        '
    """)
    assert s == 'a b c'


def test_literal_string_dedent():
    s = u.loads(r"""
        '''
            a
              b
                c
        '''
    """)
    assert s == 'a\n  b\n    c'


def test_literal_string_no_escapes():
    s = u.loads(r"""
        'a\nb\tc\u1234'
    """)
    assert s == r'a\nb\tc\u1234'


def test_rich_string_as_is():
    s = u.loads(r"""
        " a  b  c  "
    """)
    assert s == ' a  b  c  '


def test_rich_string_remove_ws():
    s = u.loads(r"""
        "
        
            a
                b
                    c
        
        "
    """)
    assert s == 'a b c'


def test_rich_string_dedent():
    s = u.loads(r'''
        """
            ....a....
            ..b....
            ....c.....
        """
    '''.replace('.', ' '))
    assert s == '  a\nb\n  c'


def test_rich_string_escapes():
    s = u.loads(r"""
        "
            latin=ABC,
            unicode=ГДЭ,
            esc=\", \\, \/, \b, \f, \r, \t, \n, 
            unicode=\u1234,
            surrogate=\ud83d\ude00,
            long=\U0001f620,
        "
    """)
    assert s == 'latin=ABC, unicode=ГДЭ, esc=", \\, /, \b, \f, \r, \t, \n, unicode=\u1234, surrogate=\U0001f600, long=\U0001f620,'


def test_raw_string():
    s = u.loads('''
        hello@mail.com
    ''')
    assert s == 'hello@mail.com'
