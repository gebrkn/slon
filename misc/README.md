# slon

`slon` is Simple Lightweight Object Notation. Like `json`, but with less punctuation and some smart features.

```EXAMPLE
// slon example

{
    name Shakespeare
    firstName William
    
    bio "
        William Shakespeare was an English poet, playwright, and actor, 
        widely regarded as the greatest writer in the English language 
        and the world's greatest dramatist    
    "
    
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


{toc}


## layout

First off, `slon` is a superset of `json`, that is, every valid `json` is also valid `slon`. Like in `json`, whitespace and indentation don't matter. Comments are line comments with `#` or `//` and C-style blocks `/* ... */`


```EXAMPLE
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

## values 

`slon` can encode nulls, numbers, booleans, strings, arrays and objects.

### null

A `null` is just `null`:

```EXAMPLE
null
```

### numbers

Numbers are standard integers and floats. The format is less strict than `json` though, so you can have a leading `+` or zero. Hexadecimal numbers are supported. An underscore can be used to delimit long numbers:

```EXAMPLE
[
    123
    123_456_789
    +045.990
    -12.3e4
    0xcafe
]
```

### booleans

Boolean literals are `true`, `on`, `yes` for "true", `false`, `off`, `no` for "false", case-insensitive.

```EXAMPLE
{
    select true
    update YES
    insert ON
    delete no
    create Off
}
```

### strings

Strings are surrounded by double and single quotes or triple-quotes. Double-quoted strings use the standard `json` escaping and "long" unicode escapes `\UXXXXXXXX`. Single-quoted strings are verbatim.  

#### one quote, single line

```EXAMPLE
"Hamlet \u00a9 William, 1599. bravo \U0001F44F \U0001F44F"
```

No escaping in single-quoted strings:

```EXAMPLE
'Hamlet \u00a9 William, 1599. bravo \U0001F44F \U0001F44F'
```

#### one quote, multiline

If a double- or single-quoted string contains newlines, all whitespace within it is replaced with a single space:

```EXAMPLE
"
      The 
    Comedy 
      of 
    Errors 
"
```

#### triple quotes

Newlines in triple-quoted strings are preserved and the string is dedented to the minmal indent:

```EXAMPLE
"""
            Scene I.        

        BERNARDO
            Who's there?
        FRANCISCO
            Nay, answer me: stand, and unfold yourself.
"""
```

#### bare strings

Any sequence of symbols except whitespace, punctuation and numbers/bools is considered a string, so you can write "simple" strings without any quotes at all: 

```EXAMPLE
hello
```

### arrays

An array (aka list) is a sequence of values separated by whitespace and/or commas, enclosed in `[...]`:
 
```EXAMPLE
[
    Shakespeare, William 
    "The Tragedy of Hamlet" 
        [2017,2018,2019]
]
```

### objects

An object (aka struct, dict) is a sequence of key-value pairs, separated by whitespace and/or commas and enclosed in `{...}`. Keys and values are separated by whitespace and/or colons or equal signs. Keys can be quoted and bare strings, integers or booleans:
 
```EXAMPLE
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

#### structured keys

A "bare" key can contain dots, in which case `slon` resolves all intermediate objects or arrays and creates them on the fly if needed:

```EXAMPLE
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

A `+` after a key means "append to that array":

```EXAMPLE
{
    author Shakespeare
    title Hamlet

    readers+ { name Joe }
    readers+ { name Lily }
    readers+ { name Bob }
    
}
```

If you need a literal dot/plus sign in a key, quote it:
```EXAMPLE
{
    "com.sun.java" installed
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
