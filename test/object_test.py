import u


def test_object_basic():
    s = u.loads(r"""
        {
            abc def
            123 456
            foo y
            z null
        }
    """)
    assert s == {123: 456, 'abc': 'def', 'foo': True, 'z': None}


def test_object_delimiters():
    s = u.loads(r"""
        {
            aa: AA,,
            bb:BB cc=CC dd 
                = DD ee/*hey*/EE "ff"FF
        }
    """)
    assert s == {'aa': 'AA', 'bb': 'BB', 'cc': 'CC', 'dd': 'DD', 'ee': 'EE', 'ff': 'FF'}


def test_object_refs():
    s = u.loads(r"""
        {
            abc : def
            deep.nested.prop boo
            deep.nested.array.0 foo
            other.prop = 42
            zero.a.b.c = null
            
            
        }
    """)
    assert s == {
        'abc': 'def',
        'deep': {
            'nested': {
                'array': ['foo'],
                'prop': 'boo'
            }
        },
        'other': {
            'prop': 42,
        },
        'zero': {'a': {'b': {'c': None}}}
    }


def test_object_refs_array_add():
    s = u.loads(r"""
        {
            +abc 1
            +abc 22
            +abc 333
        }
    """)
    assert s == {'abc': [1, 22, 333]}


def test_object_refs_array_add_nested_1():
    s = u.loads(r"""
        {
            +abc.x 1
            +abc.y 22
            +abc.z 333
        }
    """)
    assert s == {'abc': [{'x': 1}, {'y': 22}, {'z': 333}]}


def test_object_refs_array_add_nested_2():
    s = u.loads(r"""
        {
            abc.+x 1
            abc.+x 22
            abc.+x 333
        }
    """)
    assert s == {'abc': {'x': [1, 22, 333]}}
