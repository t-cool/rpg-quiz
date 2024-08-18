/*:
-------------------------------------------------------------------------------
@title Quiz System
@author Hime --> HimeWorks (http://himeworks.com)
@version 0.1
@date Mar 9, 2016
@filename HIME_QuizPointsWindow.js
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
@plugindesc v1.0 - 
@help 
-------------------------------------------------------------------------------
== Description ==

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Free for use in commercial projects, but it would be nice to let me know
- Please provide credits to HimeWorks

== Change Log ==

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

-------------------------------------------------------------------------------
@param Quiz Root Path
@desc Location that all of the quiz data is stored
Default: data/quiz/
@default data/quiz/
-------------------------------------------------------------------------------
 */ 
var Imported = Imported || {} ;
var TH = TH || {};
Imported.TH_QuizPointsWindow = 1;
TH.QuizPointsWindow = TH.QuizPointsWindow || {};

function Window_QuizMenuPoints() {
  this.initialize.apply(this, arguments);
};

Window_QuizMenuPoints.prototype = Object.create(Window_Base.prototype);
Window_QuizMenuPoints.prototype.constructor = Window_QuizMenuPoints;

(function ($) {

  Window_QuizMenuPoints.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
  };
  
  Window_QuizMenuPoints.prototype.refresh = function() {
    this.contents.clear();
    this.createContents();
    this.drawText("Quiz Points:", 0, 0, this.width);
    this.drawText($gameParty.quizPoints(), 0, 0, this.width - this.padding * 2, 'right');
  }
  
  var TH_SceneMenu_create = Scene_Menu.prototype.create;
  Scene_Menu.prototype.create = function() {
    TH_SceneMenu_create.call(this);
    this.createQuizPointsWindow();
  };
  
  Scene_Menu.prototype.createQuizPointsWindow = function() {
    var x = this._goldWindow.x
    var y = this._goldWindow.y - this._goldWindow.height
    var width = this._goldWindow.width;
    this._quizPointsWindow = new Window_QuizMenuPoints(x, y, width, this._goldWindow.height);
    this.addWindow(this._quizPointsWindow);
  };
  
})(TH.QuizPointsWindow);