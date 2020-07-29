from setuptools import setup

try:
    desc = open('README.md').read()
except:
    desc = ''

setup(
    name='slon',
    version='0.2.2',
    description='Simple Lightweight Object Notation',
    url='https://github.com/gebrkn/slon',
    author='Georg Barikin',
    author_email='georg@merribithouse.net',
    long_description="""slon is Simple Lightweight Object Notation. Like json, but with less punctuation and some smart features. See https://github.com/gebrkn/slon""",
    long_description_content_type="text/markdown",
    license='MIT',
    packages=['slon'],
    zip_safe=False,
)
