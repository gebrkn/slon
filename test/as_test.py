import u


def test_as_array_bare():
    s = u.loads(r"""
        11 22 33
    """, as_array=True)
    assert s == [11, 22, 33]


def test_as_array_array():
    s = u.loads(r"""
        [ 11 22 33 ]
    """, as_array=True)
    assert s == [11, 22, 33]


def test_as_object_bare():
    s = u.loads(r"""
        a A b B
    """, as_object=True)
    assert s == {'a': 'A', 'b': 'B'}


def test_as_object_object():
    s = u.loads(r"""
        { a A b B }
    """, as_object=True)
    assert s == {'a': 'A', 'b': 'B'}
