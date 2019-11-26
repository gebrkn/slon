# slon

`slon` is Simple Lightweight Object Notation. Like `json`, but with less punctuation and some smart features.

###### slon:
```
// slon example

{
    name Shakespeare
    firstName William
    
    bio """
        William Shakespeare was an English poet, playwright, and actor, 
        widely regarded as the greatest writer in the English language 
        and the world's greatest dramatist    
    """
    
    books [
        {
            title Hamlet
            price 12.34
            onSale yes
        }
        {
            title "King Lear"
            price 42.99
            onSale no
        }
        /* removed for now
        {
            title "The Comedy of Errors"
            price 34.11
            onSale no
        }
        */
    ]
}
```
###### json:
```
{
    "name": "Shakespeare",
    "firstName": "William",
    "bio": "William Shakespeare was an English poet, playwright, and actor,\nwidely regarded as the greatest writer in the English language\nand the world's greatest dramatist",
    "books": [
        {
            "title": "Hamlet",
            "price": 12.34,
            "onSale": true
        },
        {
            "title": "King Lear",
            "price": 42.99,
            "onSale": false
        }
    ]
}
```


 * [layout](#layout)
 * [values](#values)
     * [null](#null)
     * [numbers](#numbers)
     * [booleans](#booleans)
     * [strings](#strings)
         * [one quote, single line strings](#one-quote,-single-line-strings)
         * [triple quotes, multiline strings](#triple-quotes,-multiline-strings)
         * [bare strings](#bare-strings)
     * [arrays](#arrays)
     * [objects](#objects)
         * [structured keys](#structured-keys)
 * [python api](#python-api)
 * [info](#info)


## layout

First off, `slon` is a superset of `json`, that is, every valid `json` is also valid `slon`. Like in `json`, whitespace and indentation don't matter. Comments are line comments with `#` or `//` and C-style blocks `/* ... */`


###### slon:
```
# sample data

/*
    @author: me
    @date: today
*/

{
    authName Shakespeare // author's name
    bYear    1564        // year of birth
}
```
###### json:
```
{
    "authName": "Shakespeare",
    "bYear": 1564
}
```

## values 

`slon` can encode nulls, numbers, booleans, strings, arrays and objects.

### null

A `null` is just `null`:

###### slon:
```
null
```
###### json:
```
null
```

### numbers

Numbers are standard integers and floats. The format is less strict than `json` though, so you can have a leading `+` or zero. Hexadecimal numbers are supported. An underscore can be used to delimit long numbers:

###### slon:
```
[
    123
    123_456_789
    +045.990
    -12.3e4
    0xcafe
]
```
###### json:
```
[
    123,
    123456789,
    45.99,
    -123000.0,
    51966
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

Strings are surrounded by double and single quotes or triple-quotes. Double-quoted strings use the standard `json` escaping and "long" unicode escapes `\UXXXXXXXX`. Single-quoted strings are verbatim.  

#### one quote, single line strings

###### slon:
```
"Hamlet \u00a9 William, 1599. bravo \U0001F44F \U0001F44F"
```
###### json:
```
"Hamlet © William, 1599. bravo 👏 👏"
```

No escaping in single-quoted strings:

###### slon:
```
'Hamlet \u00a9 William, 1599. bravo \U0001F44F \U0001F44F'
```
###### json:
```
"Hamlet \\u00a9 William, 1599. bravo \\U0001F44F \\U0001F44F"
```

#### triple quotes, multiline strings

Triple-quoted strings can contain newlines. If a character right after the opening triple quote is a space or a new line, newlines in the string are preserved, and the string is dedented to the minmal indent:

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

If a character right after the opening quote is not a whitespace, all whitespace in the string is replaced with a single space:

###### slon:
```
"""You are welcome, masters; welcome, all. I am glad
to see thee well. Welcome, good friends. O, my old
friend! thy face is valenced since I saw thee last:
comest thou to beard me in Denmark?
"""
```
###### json:
```
"You are welcome, masters; welcome, all. I am glad to see thee well. Welcome, good friends. O, my old friend! thy face is valenced since I saw thee last: comest thou to beard me in Denmark?"
```



#### bare strings

Any sequence of symbols except whitespace, punctuation and numbers/bools is considered a string, so you can write "simple" strings without any quotes at all: 

###### slon:
```
hello
```
###### json:
```
"hello"
```

### arrays

An array (aka list) is a sequence of values separated by whitespace and/or commas, enclosed in `[...]`:
 
###### slon:
```
[
    Shakespeare, William 
    "The Tragedy of Hamlet" 
        [2017,2018,2019]
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

An object (aka struct, dict) is a sequence of key-value pairs, separated by whitespace and/or commas and enclosed in `{...}`. Keys and values are separated by whitespace and/or colons or equal signs. Keys can be quoted and bare strings, integers or booleans:
 
###### slon:
```
{
    author Shakespeare
    "full title":"The Tragedy of Hamlet"
    seasons {
        2017=yes 
        2018=no
        2019=yes
    } 
    year 1599
}
```
###### json:
```
{
    "author": "Shakespeare",
    "full title": "The Tragedy of Hamlet",
    "seasons": {
        "2017": true,
        "2018": false,
        "2019": true
    },
    "year": 1599
}
```

#### structured keys

A "bare" key can contain dots, in which case `slon` resolves all intermediate objects or arrays and creates them on the fly if needed:

###### slon:
```
{
    author Shakespeare
    title  Hamlet
    
    price { normal 12.34 }
    
    price.sale   
        5.67
    price.special.christmas   
        8.99
    
    readers.0.name Joe
    readers.1.name Lily
    readers.2.name Bob
}
```
###### json:
```
{
    "author": "Shakespeare",
    "title": "Hamlet",
    "price": {
        "normal": 12.34,
        "sale": 5.67,
        "special": {
            "christmas": 8.99
        }
    },
    "readers": [
        {
            "name": "Joe"
        },
        {
            "name": "Lily"
        },
        {
            "name": "Bob"
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

    readers+ { name Joe }
    readers+ { name Lily }
    readers+ { name Bob }
    
}
```
###### json:
```
{
    "author": "Shakespeare",
    "title": "Hamlet",
    "readers": [
        {
            "name": "Joe"
        },
        {
            "name": "Lily"
        },
        {
            "name": "Bob"
        }
    ]
}
```

If you need a literal dot/plus sign in a key, quote it:
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

## python api

The `slon` module exposes a single function:

```
slon.loads(s: str, as_object=False, as_array=False) -> None|int|float|str|list|dict
```

`as_object` and `as_array` put implicit `{...}` or `[...]` around the whole document.

```

import slon

text = """
    author Shakespeare
    title Hamlet
"""

dct = slon.loads(s, as_object=True)

print(dct)  # {'author': 'Shakespeare', 'title': 'Hamlet'} 
```



## info

(c) 2019 Georg Barikin (https://github.com/gebrkn). MIT license.
