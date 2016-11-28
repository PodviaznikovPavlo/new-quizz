'use strict';

export default categoryService;

function categoryService($http, $stateParams, $interval, $rootScope, socketService, userService, onlineUsersService) {
  'ngInject';

  let self = {};
  let socket = socketService.socket;
  let interval;
  let user = userService.getActiveUser();

  self.category = {
    name: '',
    value: ''
  };

  self.onlineUsers = onlineUsersService.onlineUsers;

  self.question = { };

  self.score = user.score;

  self.init = category => {
    self.category.value = category;
    self.category.name = category.toUpperCase();

    socket.emit('room:joined', {category, user});
    socket.on('room:question', onQuestionLoaded);
    socket.on('room:answer:checked', onAnswerChecked)
  };

  self.makeAnswer = answer => {
    checkAnswer(answer) ? user.score.correct++ : user.score.incorrect++;

    socket.emit('room:answer', {
      category: self.category.name.toLowerCase(),
      score: user.score,
      email: user.email
    });
  };

  self.onCategoryLeave = () => {
    socket.emit('room:leave', self.category.name.toLowerCase());
  };

  function onQuestionLoaded(question) {
    if(!question || question.category !== self.category.value) return false;


    Object.assign(self.question, question);
    startTimer(question.seconds);
    $rootScope.$apply();
  }

  function startTimer(seconds) {
    if(interval) $interval.cancel(interval);

    let currentSeconds = new Date().getSeconds();

    if(currentSeconds >= seconds) {
      self.question.time = 15 - (currentSeconds - seconds);
    } else {
      self.question.time = 15 - (60 - (seconds + currentSeconds));
    }

    interval = $interval(()=>{
      if(self.question.time === 0) {
        socket.emit('room:answer', {
          category: self.category.name.toLowerCase(),
          score: user.score,
          email: user.email
        });
      }

      self.question.time--;
    }, 1000);
  }

  function onAnswerChecked (scores) {
    let score = scores[user.email];

    self.score.correct = score.correct;
    self.score.incorrect = score.incorrect;
  }

  function checkAnswer(answer) {
    return answer === self.question.answer;
  }

  // let socket = socketService.socket;
  //
  // self.category = {
  //   name: ''
  // };
  //
  // self.question = {};
  //
  // self.score = {
  //   correct: 0,
  //   incorrect: 0
  // };
  //
  //
  //
  // self.makeAnswer = answer => {
  //   debugger;
  //   socket.emit(`${self.category.name.toLowerCase()}:answered`, answer);
  //   socket.on(`correct:answer:${socket.id}`, isCorrect => {
  //     debugger;
  //     isCorrect ? self.score.correct++ : self.score.incorrect++;
  //   });
  // };
  //
  // self.init = categoryName => {
  //   if (!categoryName) return false;
  //
  //   socket.emit(`${categoryName}:joined`);
  //   socket.on(`${categoryName}:question:generated`, onQuestionLoaded);
  //
  //   self.category.name = categoryName.toUpperCase();
  // };
  //
  // function onQuestionLoaded(question) {
  //   if(!question) return false;
  //
  //   debugger;
  //
  //   Object.assign(self.question, question);
  // }

  return self;
}
