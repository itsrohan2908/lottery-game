// helper.js
function genTicket(n){
  let arr = new Array(n);
  for (let i = 0; i < n; i++){
      arr[i] = Math.floor(Math.random() * 10);
  }
  return arr;
}

function sum(arr){
  return arr.reduce((acc, curr) => acc + curr, 0);
}

/* Condition helpers */
function isAllEven(ticket){
  return ticket.every(d => d % 2 === 0);
}

function isPalindrome(ticket){
  const s = ticket.join('');
  return s === s.split('').reverse().join('');
}

function isAllSame(ticket){
  return ticket.every(d => d === ticket[0]);
}

function isStrictlyIncreasing(ticket){
  for (let i = 1; i < ticket.length; i++){
    if (ticket[i] <= ticket[i-1]) return false;
  }
  return true;
}

function hasRepeatedDigits(ticket){
  return new Set(ticket).size < ticket.length;
}

function containsDigit(ticket, d){
  return ticket.includes(Number(d));
}

/* Factory that returns a predicate function (ticket => boolean) */
function getConditionFn(key, param){
  switch(key){
    case 'sum-equals':
      const val = Number(param) || 0;
      return (t) => sum(t) === val;
    case 'all-even':
      return isAllEven;
    case 'palindrome':
      return isPalindrome;
    case 'all-same':
      return isAllSame;
    case 'increasing':
      return isStrictlyIncreasing;
    case 'repeats':
      return hasRepeatedDigits;
    case 'contains-digit':
      const d = Number(param) || 0;
      return (t) => containsDigit(t, d);
    default:
      return () => false;
  }
}

export { genTicket, sum, getConditionFn };
