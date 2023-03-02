const getSpellIndices = (arr) => {
  const indices = [];
  arr.forEach((spell) => {
    indices.push(spell.index);
  });
  return indices;
};

const convertCharLvlToCasterLvl = (num) => {
  let casterLvl = 0;
  if (num > 16) {
    casterLvl = 9;
  } else {
    casterLvl = Math.ceil(num / 2);
  }
  return casterLvl;
};

//? this function is no longer being used, but it was really cool
// const convertCasterLvlToSpellLvl = (num) => {
//   const params = new URLSearchParams();

//   params.set('level', 0);
//   for (let i = 1; i <= num; i++) {
//     params.append('level', i);
//   }
//   return params;
// };

module.exports = {
  getSpellIndices,
  convertCharLvlToCasterLvl,
};