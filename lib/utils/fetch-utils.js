// const { convertCasterLvlToSpellLvl } = require('./spell-utils');

const fetchAllSpells = async () => {
  const resp = await fetch('https://www.dnd5eapi.co/api/spells');
  const spells = await resp.json();
  return spells.results;
};

const fetchSpellByIndex = async (index) => {
  const resp = await fetch(`https://www.dnd5eapi.co/api/spells/${index}`);
  const spell = await resp.json();
  return spell;
};

const fetchSpellDetails = async (arr) => {
  // wrap a nested async function in Promise.all so that the nested function completes before the parent function fires
  return Promise.all(
    arr.map(async (index) => {
      const spell = await fetchSpellByIndex(index);
      //TODO investigate timeout to spread requests out
      return {
        index: spell.index,
        name: spell.name,
        level: spell.level,
        school: spell.school.index,
        classes: spell.classes.map((charClass) => {
          //TODO make these fellas come back as strings
          return charClass.name;
        }),
      };
    })
  );
};

module.exports = {
  fetchAllSpells,
  fetchSpellByIndex,
  fetchSpellDetails,
};