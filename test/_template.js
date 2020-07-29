let fs = require('fs');
let slon = require('{root}/js/slon')

let sources = fs.readFileSync('{sources_path}', {encoding: 'utf8'})

let delim = '{delim}'
let res = []

HOOKS = {
    'upper': x => x.toUpperCase(),
    'add5': x => x + 5,
    'addX': x => x + 'x',
}


function serialize(x) {
    if (x === null)
        return 'null'
    if (typeof x === 'boolean')
        return x ? 'true' : 'false'
    if (typeof x === 'number')
        return x.toString()
    if (typeof x === 'string') {
        let s = ''
        for (let c of [...x]) {
            let n = c.codePointAt(0)
            if (32 <= n && n <= 127)
                s += c
            else
                s += '\\u{' + n.toString(16) + '}'
        }
        return '"' + s + '"'
    }
    if (Array.isArray(x))
        return '[' + x.map(serialize).join(', ') + ']'
    if (typeof x === 'object')
        return '{' + [...Object.entries(x)].map(kv => serialize(kv[0]) + ': ' + serialize(kv[1])).join(', ') + '}'
    throw new Error('serialization error')
}


for (let src of sources.split(delim)) {
    let r
    try {
        r = slon.parse(src, {hooks: HOOKS})
        r = serialize(r)
    } catch (err) {
        if (err instanceof slon.SlonError)
            r = `ERROR:${err.code}:${err.row}:${err.col}:${err.startRow}:${err.startCol}`
        else
            r = 'ERROR:' + err.toString()
    }
    res.push(r)
}

fs.writeFileSync('{results_path}', res.join(delim), {encoding: 'utf8'})
