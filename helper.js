
function randomize(arr) {
  for (let i = 0; i < arr.length; i++) {
    let randomNum = Math.floor(Math.random()*arr.length)
    let temp = arr[i]
    arr[i] = arr[randomNum]
    arr[randomNum] = temp
  }
  return arr
}

module.exports = { randomize }