import u


def test_array_whitespace():
    s = u.loads(r"""
        [11 22 33]
    """)
    assert s == [11, 22, 33]


def test_array_commas():
    s = u.loads(r"""
        [11,22,33]
    """)
    assert s == [11, 22, 33]


def test_array_delimiters():
    s = u.loads(r"""
        [11,22   33/*hey*/44,,,,55]
    """)
    assert s == [11, 22, 33, 44, 55]


def test_array_mixed_types():
    s = u.loads(r"""
        [
            'abc',
            '''def
            ''',
            on,
            123,
            { foo bar }
            
        ]
    """)
    assert s == ['abc', 'def', True, 123, {'foo': 'bar'}]


def test_array_nested():
    s = u.loads(r"""
        [
            11 [22] [33 [44 55]] 66 
        ]
    """)
    assert s == [11, [22], [33, [44, 55]], 66]


def test_array_objects():
    s = u.loads(r"""
        [
            11
            {
                foo [ {bar: [x]} ]
                abc def
            }
        ]
    """)
    assert s == [11, {'foo': [{'bar': ['x']}], 'abc': 'def'}]
