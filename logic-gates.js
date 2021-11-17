const binaryArray = [0, 1];

/**
 * 
 * @param {number} num 
 * @returns 
 */
const not = (num) => {
  if (!binaryArray.includes(num)) return;

  if (num === 0) return 1;
  else if (num === 1) return 0;
};

/**
 * 
 * @param {number} num1 
 * @param {number} num2 
 * @returns 
 */
const and = (num1, num2) => {
  if (!binaryArray.includes(num1) || !binaryArray.includes(num2)) return;

  if (num1 !== 0 && num2 !== 0 && num1 === num2) return 1;
  else return 0;
};

/**
 * 
 * @param {number} num1 
 * @param {number} num2 
 * @returns 
 */
const or = (num1, num2) => {
  if (!binaryArray.includes(num1) || !binaryArray.includes(num2)) return;

  if (num1 === 1 || num2 === 1) return 1;
  else return 0;
};

/**
 * 
 * @param {number} num1 
 * @param {number} num2 
 * @returns 
 */
const nand = (num1, num2) => {
  const number = and(num1, num2);

  if (number === 1) return 0;
  else if (number === 0) return 1;
};

/**
 * 
 * @param {number} num1 
 * @param {number} num2 
 */
const nor = (num1, num2) => {
  const number = or(num1, num2);

  if (number === 0) return 1;
  else if (number === 1) return 0;
}

module.exports = {
  not,
  and,
  or,
  nand,
  nor,
}