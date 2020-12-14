console.log('你好 刘景元')

let summary = 0
for (let i = 0; i <= 1010230; i ++) {
	summary = summary + i
}

console.log(summary)

console.log(Math.PI)
function unfoldPiTaylor(num){
    var sum = 0,flag = true;
    for(var i = 0; i < num; i++){
        sum += flag?(1/(2*i+1)):(-1/(2*i+1))
        flag = !flag;
    }
    return sum * 4;
}
console.log("π的近似值：" + unfoldPiTaylor(100000000000))


function * generateDigitsOfPi() {
    let q = 1n;
    let r = 180n;
    let t = 60n;
    let i = 2n;
    while (true) {
        let digit = ((i * 27n - 12n) * q + r * 5n) / (t * 5n);
        yield Number(digit);
        let u = i * 3n;
        u = (u + 1n) * 3n * (u + 2n);
        r = u * 10n * (q * (i * 5n - 2n) + r - t * digit);
        q *= 10n * i * (i++ * 2n - 1n);
        t *= u;
    }
}

