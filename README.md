# slon

`slon` is Simple Lightweight Object Notation. Like `json`, but with less punctuation and some smart features.

###### slon:
```
// slon example

{
    name Shakespeare
    first_name William

    about """
        William Shakespeare was an English poet, playwright, and actor, 
        widely regarded as the greatest writer in the English language 
        and the world's greatest dramatist (Wikipedia)
    """
    
    books [
        {  title Hamlet    price 12.34    onSale true }
        {  title Macbeth   price 42.99    onSale false  }

        /* sold out
        { title "The Comedy of Errors" price 34.11 onSale no }
        */
    ]

    locations {
        Africa.Egypt.Alexandria Antony
        Europe.Greece.Athens Timon
        Europe.Italy.Venice  Othello
        Europe.Italy.Verona  Romeo
    }

    readers [Alice Bob Carol]
}
```
###### json:
```
{
    "name": "Shakespeare",
    "first_name": "William",
    "about": "William Shakespeare was an English poet, playwright, and actor,\nwidely regarded as the greatest writer in the English language\nand the world's greatest dramatist (Wikipedia)",
    "books": [
        {
            "title": "Hamlet",
            "price": 12.34,
            "onSale": true
        },
        {
            "title": "Macbeth",
            "price": 42.99,
            "onSale": false
        }
    ],
    "locations": {
        "Africa": {
            "Egypt": {
                "Alexandria": "Antony"
            }
        },
        "Europe": {
            "Greece": {
                "Athens": "Timon"
            },
            "Italy": {
                "Venice": "Othello",
                "Verona": "Romeo"
            }
        }
    },
    "readers": [
        "Alice",
        "Bob",
        "Carol"
    ]
}
```

 * [layout](#layout)
 * [values](#values)
     * [null](#null)
     * [numbers](#numbers)
     * [booleans](#booleans)
     * [strings](#strings)
         * [plain strings](#plain-strings)
         * [multiline strings](#multiline-strings)
         * [bare strings](#bare-strings)
     * [arrays](#arrays)
     * [objects](#objects)
 * [advanced usage](#advanced-usage)
     * [structured keys](#structured-keys)
     * [hooks](#hooks)
 * [APIs](#apis)
     * [python](#python)
     * [javascript](#javascript)
 * [info](#info)


## layout

`slon` is a superset of `json`, that is, every valid `json` is also valid `slon`. Indentation is ignored, except within multiline strings. Array and object delimiters (commas/colons) are optional, object keys don't have to be quoted.

`slon` supports line comments with `#` or `//` and C-style comment blocks `/* ... */`


###### slon:
```
# sample data

/*
    @author: me
    @date: today
*/

{
    name Shakespeare // author's name
    year 1564        // year of birth

    books [Hamlet Macbeth Othello]

    Alice: true,
    Bob: true,
    Carol: true,
}
```
###### json:
```
{
    "name": "Shakespeare",
    "year": 1564,
    "books": [
        "Hamlet",
        "Macbeth",
        "Othello"
    ],
    "Alice": true,
    "Bob": true,
    "Carol": true
}
```

## values

Out of the box, `slon` can encode nulls, numbers, booleans, strings, arrays and objects.

### null

A `null` value is `null` or `none`, case-insensitive:

###### slon:
```
[ null NULL None none ]
```
###### json:
```
[
    null,
    null,
    null,
    null
]
```

### numbers

`slon` supports decimal, hexadecimal, octal and binary integers and decimal floats in the standard notation. Unlike json, leading zeroes are allowed. A number can be preceded by a `-` or `+`. Underscores can be used to delimit long numbers.

###### slon:
```
[
    123
    123_456_789
    +045.990
    -12.3e4
    0xcafe
    0o755
    0b1110011
]
```
###### json:
```
[
    123,
    123456789,
    45.99,
    -123000.0,
    51966,
    493,
    115
]
```

### booleans

Boolean literals are `true`, `on`, `yes` for "true", `false`, `off`, `no` for "false", case-insensitive.

###### slon:
```
{
    select true
    update YES
    insert ON
    delete no
    create Off
}
```
###### json:
```
{
    "select": true,
    "update": true,
    "insert": true,
    "delete": false,
    "create": false
}
```

### strings

#### plain strings

Plain strings are enclosed in single or double quotes and cannot contain a literal newline.

Single quoted strings are verbatim, that is, every symbol is interpreted exactly as written.

###### slon:
```
'Hamlet \xa9 William, 1599. \n bravo \U0001F44F \u{1f44f}'
```
###### json:
```
"Hamlet \\xa9 William, 1599. \\n bravo \\U0001F44F \\u{1f44f}"
```

Double quoted strings interpret these escape sequences:

```
\n  \r  \t  \b  \f  \\  \"  \'  \/  \\  \0
```

and unicode escapes in these formats:

```
\x12  \u1234  \u{12345}  \U00012345
```

###### slon:
```
"Hamlet \xa9 William, 1599. \n bravo \U0001F44F \u{1f44f}"
```
###### json:
```
"Hamlet © William, 1599. \n bravo 👏 👏"
```

`slon` decodes valid unicode surrogate pairs into plane 1 characters:

###### slon:
```
"smile \ud83d\ude03"
```
###### json:
```
"smile 😃"
```

`slon` doesn't allow unicode escapes greater than `\u{10FFFF}`, but otherwise makes no attempt to validate unicode. Particularly, invalid surrogate pairs and non-characters are left as is.

#### multiline strings

Strings enclosed in triple quotes (`'''` or `"""`) or backticks can span across multiple lines.

If a character right after opening quotes is a space or a newline, newlines in the string are preserved, and the string is dedented to its minimal indent:

###### slon:
```
"""
            Scene I.        

        BERNARDO
            Who's there?
        FRANCISCO
            Nay, answer me: stand, and unfold yourself.
"""
```
###### json:
```
"    Scene I.\n\nBERNARDO\n    Who's there?\nFRANCISCO\n    Nay, answer me: stand, and unfold yourself."
```

Otherwise, the string is "compressed", so that all whitespace sequences are reduced to a single space character:

###### slon:
```
"""You are welcome, masters;
welcome, all.

I am glad
to see thee well.
"""
```
###### json:
```
"You are welcome, masters; welcome, all. I am glad to see thee well."
```

`'''` strings are verbatim, `"""` and backtick strings interpret the escape sequences. Note that escaped spaces or newlines are preserved when the string is dedented or compressed:

###### slon:
```
`Enter a King\n
and a Queen very lovingly;\n
the Queen embracing him,\n
and he her.`
```
###### json:
```
"Enter a King\n and a Queen very lovingly;\n the Queen embracing him,\n and he her."
```

#### bare strings

Any sequence of symbols except whitespaces, punctuation and numeric/bool literals is considered a string, so you can write "simple" strings without any quotes at all:

###### slon:
```
[
    Hamlet
    claudius@elsinore.castle
    $123.45
]
```
###### json:
```
[
    "Hamlet",
    "claudius@elsinore.castle",
    "$123.45"
]
```

### arrays

An array (aka list) is a sequence of values separated by commas or whitespaces, enclosed in `[...]`:
 
###### slon:
```
[
    Shakespeare
    William
    "The Tragedy of Hamlet" 
    [
        2017,
        2018,
        2019,
    ]
]
```
###### json:
```
[
    "Shakespeare",
    "William",
    "The Tragedy of Hamlet",
    [
        2017,
        2018,
        2019
    ]
]
```

### objects

An object (aka struct, dict) is a sequence of key-value pairs, separated by commas or whitespaces and enclosed in `{...}`. Keys and values are separated by colons or equal signs or whitespaces. Keys can be strings, integers or booleans:
 
###### slon:
```
{
    author
        Shakespeare
    year
        1599
    "full title": 'The Tragedy of Hamlet'
    seasons {
        2017 = yes
        2018 = no
        2019 = yes
    } 
}
```
###### json:
```
{
    "author": "Shakespeare",
    "year": 1599,
    "full title": "The Tragedy of Hamlet",
    "seasons": {
        "2017": true,
        "2018": false,
        "2019": true
    }
}
```

## advanced usage

### structured keys

An object key which is a non-quoted ("bare") string can contain dots, in which case `slon` treats it as a structured ("nested") key and resolves intermediate objects or arrays, creating them on the fly if needed:

###### slon:
```
{
    title.short  Hamlet
    
    price { normal 12.34 }

    price.sale
        5.67
    price.special.christmas   
        8.99

    readers.0.name Alice
    readers.1.name Bob
    readers.2.name Carol
}
```
###### json:
```
{
    "title": {
        "short": "Hamlet"
    },
    "price": {
        "normal": 12.34,
        "sale": 5.67,
        "special": {
            "christmas": 8.99
        }
    },
    "readers": [
        {
            "name": "Alice"
        },
        {
            "name": "Bob"
        },
        {
            "name": "Carol"
        }
    ]
}
```

A `+` after a key means "append to that array":

###### slon:
```
{
    author Shakespeare
    title Hamlet

    readers+ { name Alice }
    readers+ { name Bob }
    readers+ { name Carol }
}
```
###### json:
```
{
    "author": "Shakespeare",
    "title": "Hamlet",
    "readers": [
        {
            "name": "Alice"
        },
        {
            "name": "Bob"
        },
        {
            "name": "Carol"
        }
    ]
}
```

If you need a literal dot in a key, quote it:

###### slon:
```
{
    "com.sun.java" installed
}
```
###### json:
```
{
    "com.sun.java": "installed"
}
```


### hooks

A "bare" string immediately followed by an opening parenthesis `(` is treated as a function name ("hook"). A hook function receives one of the basic values  and can return whatever you see fit. `slon` parser accepts the `hooks` argument, which is an object or a dict containing hook functions (or methods).

You can use hooks to add support for library types like dates or binary strings. For example, this `slon` file:

```
// test.slon

{
    title
        Hamlet
    created
        date('1599-02-20')
    image
        bin("\x89PNG\r\n\x1a\n\0\0\0...")
}
```

can be decoded with this code:

```
from datetime import date
from functools import partial

hooks = {
    'date': date.fromisoformat,
    'bin': partial(bytes, encoding='latin1'),
}

with open('test.slon') as fp:
    result = slon.loads(fp.read(), hooks=hooks)

print(result) ## {'title': 'Hamlet', 'created': datetime.date(1599, 2, 20), 'image': b'\x89PNG\r\n\x1a\n\x00\x00\x00...'}

```

## APIs

### python

```
pip install slon
```

The `slon` module provides a single function:
```
slon.loads(text: str, as_object=False, as_array=False, hooks=None) -> Any
```

- `text` is a string (`str`) which contains encoded `slon`. Note that `bytes` inputs are not supported

- `as_object` parses `text` as an object, that is, puts implicit `{...}` around it, unless `text` already starts with a `{`

- `as_array` parses `text` as an array

- `hooks` is a hooks dict or object


Examples:

```
text = """
    author Shakespeare
    title Hamlet
"""

val = slon.loads(text, as_object=True)

print(val)  # {'author': 'Shakespeare', 'title': 'Hamlet'}


text = """
    100
    200
    300
"""

val = slon.loads(text, as_array=True)

print(val)  # [100, 200, 300]
```


### javascript

```
npm install slonjs
```

The `slon` module provides a single function:

```
slon.parse(text: string, options: object) -> any
```

Options are `asObject`, `asArray` and `hooks`, with the same meaning as in python.


```
let slon = require('slon');

text = `
    author Shakespeare
    title Hamlet
`

val = slon.parse(text, {asObject: true})

console.log(val)  // {author: 'Shakespeare', title: 'Hamlet'}
```

For browsers, grab `index.js` and use `window.SLON.parse()`.



## info

(c) 2019 Georg Barikin (https://github.com/gebrkn). MIT license.
