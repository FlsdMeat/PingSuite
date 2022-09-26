function Prefixes(num){
    let temp = (num.toString()).substring((num.toString()).length - 1)
        if ((num.toString())[0] === '0'){
            if (temp === '1'){
            return temp + 'st'
            } else if (temp === '2'){
            return temp + 'nd'
            } else if (temp === '3'){
            return temp + 'rd'
            }
            return temp + 'th'
        } else {
            if (temp === '1'){
            return num + 'st'
            } else if (temp === '2'){
            return num + 'nd'
            } else if (temp === '3'){
            return num + 'rd'
            }
            return num + 'th'
        }
}
module.exports = {Prefixes}