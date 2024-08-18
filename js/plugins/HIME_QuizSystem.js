/*:
-------------------------------------------------------------------------------
@title Quiz System
@author Hime --> HimeWorks (http://himeworks.com)
@version 1.1
@date Mar 13, 2016
@filename HIME_QuizSystem.js
@url 

If you enjoy my work, consider supporting me on Patreon!

* https://www.patreon.com/himeworks

If you have any questions or concerns, you can contact me at any of
the following sites:

* Main Website: http://himeworks.com
* Facebook: https://www.facebook.com/himeworkscom/
* Twitter: https://twitter.com/HimeWorks
* Youtube: https://www.youtube.com/c/HimeWorks
* Tumblr: http://himeworks.tumblr.com/

-------------------------------------------------------------------------------
@plugindesc v1.1 - A simple quiz system
@help 
-------------------------------------------------------------------------------
== Description ==

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Free for use in commercial projects, but it would be nice to let me know
- Please provide credits to HimeWorks

== Change Log ==

1.1 - Mar 13, 2016
 * added support for quiz question order mode
1.0 - Mar 9, 2016
 * initial release

== Usage ==

-- Set up Quiz Folder --

In the plugin parameters, choose the location where all of your quiz files
will be stored. This is your "quiz folder".

By default, it is stored in "data/quiz/"

-- Setting up Config --

In your quiz folder, create a file called "config.json". This is the data
file that the quiz manager will use to determine what quizzes to load.

The format of the config file is

  [
    {
      "name": "Your Quiz Name",
      "src": "URL to quiz file"
    },
    {
      "name": "My Sample Quiz",
      "src": "sampleQuiz.json"
    }
  ]
  
It contains an array of quizzes that will be loaded. Each quiz takes a name
and a URL.

The name is used when you want to refer to a particular quiz.
More information later.

The URL is assumed to be relative to the quiz folder, so if your
quiz folder is "data/path/" and the file is "sample.json" then the game will
search for the file in "data/path/sample.json".

-- Setting up your Quiz --

Each quiz is contained in a single JSON file.
Each quiz contains a list of questions.

The format is

  {
    "questions" : [
       {
          "question" : "Question #1",
          "options" : ["option1", "option2", "option3"],
          "answer: option number
       },
       {
          "question" : "Who is the author of this plugin?",
          "options" : ["Galv", "HimeWorks", "Quasi"],
          "answer: 2
       }       
    ]
  }
  
-- Using a quiz --

At this point, you have set up the quiz system.

  1. You have provided a list of quizzes that will be used in the game
  2. You can access each quiz by name
  
Now the question is, how will you present them to the player?

-- Setting Quiz Order Mode ---

The "order mode" determines how the questions will be presented to the player.
To set the order mode, use the script call

  QuizManager.setOrderMode( MODE )
  
Where the MODE is one of the following
 
   'in-order' - starts from the top and goes down in the same order
   'random'   - picks random questions from the quiz

-------------------------------------------------------------------------------
@param Quiz Root Path
@desc Location that all of the quiz data is stored
Default: data/quiz/
@default data/quiz/
-------------------------------------------------------------------------------
 */ 
var Imported = Imported || {} ;
var TH = TH || {};
Imported.TH_QuizSystem = 1;
TH.QuizSystem = TH.QuizSystem || {};

/* Manages all quizzes currently used. Acts as an interface for other objects*/
function QuizManager() {
  throw new Error('This is a static class');
};

/* A quiz object that contains information about the quiz itself, like which
 * questions are on the quiz.
 */
function Data_Quiz() {
  this.initialize.apply(this, arguments);
};

/* A particular quiz question, with data such as options, answers, rewards, and so on */
function Data_QuizQuestion() {
  this.initialize.apply(this, arguments);
};

(function ($) {

  $.params = PluginManager.parameters("HIME_QuizSystem");
  $.rootPath = $.params["Quiz Root Path"].trim();

  QuizManager.init = function() {
    this._fileCount = 0;
    this._filesLoaded = 0;
    this._quizList = {};
    this._currentQuiz = null;
    this._loaded = false;
    this._orderMode = 'in-order'
    this.loadConfig();    
  };
  
  QuizManager.loadConfig = function() {
    var self = this;
    var xhr = new XMLHttpRequest();
    var url = $.rootPath + 'config.json';
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
      if (xhr.status < 400) {
        self.readConfig(JSON.parse(xhr.responseText));
        self._loaded = true;
      }
    };
    xhr.onerror = function() {
      DataManager._errorUrl = DataManager._errorUrl || url;
    };
    xhr.send();
  };
  
  QuizManager.readConfig = function(data) {
    this._fileCount = data.length;
    for (var i = 0; i < data.length; i++) {
      var obj = data[i];
      var name = obj.name;
      var src = obj.src;
      this.loadQuiz(name, src);
    }
  };
  
  QuizManager.loadQuiz = function(name, src) {
    var self = this;
    var xhr = new XMLHttpRequest();
    var url = $.rootPath + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
      if (xhr.status < 400) {
        self.readQuiz(name, JSON.parse(xhr.responseText));
      }
    };
    xhr.onerror = function() {
      DataManager._errorUrl = DataManager._errorUrl || url;
    };
    xhr.send();
  };
  
  QuizManager.readQuiz = function(name, data) {
    var quiz = new Data_Quiz;
    for (var i = 0; i < data.questions.length; i++) {
      var obj = data.questions[i];      
      var question = new Data_QuizQuestion(obj.question, obj.options, obj.answer - 1);
      quiz.addQuestion(question);
    }        
    this._quizList[name] = quiz;
    this._filesLoaded += 1;
    console.log("quiz loaded");
  };
  
  /* Set the quiz */
  QuizManager.setQuiz = function(name) {
    this._currentQuiz = this._quizList[name];
  };
  
  QuizManager.nextQuestion = function() {
    if (this._orderMode === 'in-order') {
      this._currentQuiz.nextQuestion();
    } else if (this._orderMode === 'random') {
      this._currentQuiz.randomQuestion();
    }
  }
  
  QuizManager.setupQuestion = function() {
    this._currentQuestion = this._currentQuiz.getCurrentQuestion();
    $gameVariables.setValue(1, this._currentQuestion._answer);
    $gameTemp.reserveCommonEvent(1);
    $gameTroop.setupBattleEvent();
  };
  
  QuizManager.showQuestion = function() {
    $gameMessage.add(this._currentQuestion._question);
    $gameMessage.setPositionType(0);
  };
  
  QuizManager.showChoices = function() {
	$gameMessage.setChoices(this._currentQuestion._options, 1, -1)
    $gameMessage.setChoicePositionType(0);
    $gameMessage.setChoiceCallback(function(n) {
      $gameVariables.setValue(2, n);      
    }.bind(this));
    $gameTroop._interpreter.setWaitMode('message')
  };
  
  QuizManager.isLoaded = function() {
    return this._loaded && this._filesLoaded == this._fileCount;
  };
  
  QuizManager.isReady = function() {
    return this.isLoaded();
  };
  
  QuizManager.setOrderMode = function(mode) {
    this._orderMode = mode.toLowerCase();
  };

  /***************************************************************************/
  
  Data_Quiz.prototype.initialize = function() {
    this._currentQuestion = 1;
    this._questions = [];
    this._rewards = [];
  };
  
  Data_Quiz.prototype.addQuestion = function(question) {
    this._questions.push(question);
  };
  
  Data_Quiz.prototype.getQuestion = function(num) {
    return this._questions[num-1]
  };
  
  Data_Quiz.prototype.getCurrentQuestion = function() {
    return this.getQuestion(this._currentQuestion);
  };
  
  Data_Quiz.prototype.nextQuestion = function() {
    if (this._currentQuestion == this._questions.length) {
      this._currentQuestion = 1;
    }
    else {
      this._currentQuestion += 1;
    }
  };
  
  Data_Quiz.prototype.randomQuestion = function() {
    this._currentQuestion = Math.floor(Math.random() * this._questions.length) + 1;
  };
  
  Data_Quiz.prototype.isQuizComplete = function() {
    return this._currentQuestion === this._questions.length;
  };
  
  /***************************************************************************/
  
  Data_QuizQuestion.prototype.initialize = function(question, options, answer) {
    this._question = question;
    this._options = options;
    this._answer = answer;
  };
  
  /***************************************************************************/
  
  var TH_DataManager_loadDatabase = DataManager.loadDatabase;
  DataManager.loadDatabase = function() {    
    TH_DataManager_loadDatabase.call(this);
    QuizManager.init();
  }
  
  var TH_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function() {
    var res = TH_DataManager_isDatabaseLoaded.call(this);
    if (res) {
      res = QuizManager.isLoaded();
    }    
    return res;
  };
  
  /***************************************************************************/
  
  var TH_GameParty_initialize = Game_Party.prototype.initialize;
  Game_Party.prototype.initialize = function() {
    TH_GameParty_initialize.call(this);
    this._quizPoints = 0;
  }
  
  Game_Party.prototype.quizPoints = function() {
    return this._quizPoints;
  };
  
  Game_Party.prototype.addQuizPoints = function(num) {
    this._quizPoints += num;
  };
})(TH.QuizSystem);