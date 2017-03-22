module.exports = (count, lower, upper) => {
    let rarray = []
    while (count--) {
        rarray.push(randGenerator(lower, upper))
    }
    return rarray
}

const randGenerator = (lower, upper) => {
    const rnumber = Math.floor((upper-lower) * Math.random()) + lower
    return rnumber
}