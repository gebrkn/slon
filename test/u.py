import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)) + '/../slon')

import slon
from slon.decode import DecodeError, Error as err

raises = pytest.raises


def loads(text, **opts):
    return slon.loads(text, **opts)

