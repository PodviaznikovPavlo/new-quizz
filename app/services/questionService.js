'use strict';

let util = require('../util');
let capitalsData = require('../themes/capitals.json');
let countriesData = require('../themes/countries/countries.json');
let firebase = require('../firebase');

let categories = {
  capitals: {
    activeQuestion: null
  },
  countries: {
    activeQuestion: null
  }
};

class QuestionService {
  constructor() {}

  generateQuestion({category, isAfterAnswer}) {
    let question = categories[category].activeQuestion;

    return (question && !isAfterAnswer) ? question : generateQuestion(category);
  }

  updateUserStatistic({email, score}) {
    return firebase.updateScore(util.encodeKey(email), score);
  }

  resetActiveQuestion(category) {
    categories[category].activeQuestion = null;
  }
}

function generateQuestion(category) {
  if(!category) return false;

  let question;

  switch (category) {
    case 'capitals':
      question = generateCapitalsQuestion();
      break;
    case 'countries':
      question = generateCountriesQuestion();
      break;
  }

  question.answers = util.shuffle(question.answers);
  question.seconds = new Date().getSeconds();
  question.category = category;

  categories[category].activeQuestion = Object.assign({}, question);

  return categories[category].activeQuestion;
}

function generateCountriesQuestion() {
  let countryName = getRandomCountryName();
  let country = countriesData[countryName];

  let question = {
    flag: getCountryFlag(countryName),
    answer: country,
    answers: [country]
  };

  for(let i=0; i<3; i++) {
    question.answers.push(countriesData[getRandomCountryName()]);
  }

  return question;
}

function generateCapitalsQuestion() {
  let capitals = getFormattedCapitalsData();
  let question = getRandomCapital(capitals);

  question.answers = [ question.answer ];

  for(let i=0; i<3; i++) {
    question.answers.push(getRandomCapital(capitals).answer);
  }

  return question;
}

function getFormattedCapitalsData() {
  return capitalsData.map(item => {
    return { name: item.country, answer: item.capital };
  });
}

function getRandomCapital(capitals) {
  return capitals[util.getRandomInt(0, capitals.length)];
}

function getRandomCountryName() {
  let countryNames = Object.keys(countriesData);

  return countryNames[util.getRandomInt(0, countryNames.length)];
}

function getCountryFlag(countryName) {
  let pathToImg = `./app/themes/countries/img/${countryName.toLowerCase()}.png`;

  return `data:image/png;base64, ${util.encodeToBase64(pathToImg)}`;
}

module.exports = new QuestionService();