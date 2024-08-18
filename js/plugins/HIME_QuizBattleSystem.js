/*:
-------------------------------------------------------------------------------
@title Quiz Battle System
@author Hime --> HimeWorks (http://himeworks.com)
@version 1.0
@date Mar 9, 2016
@filename HIME_QuizBattleSystem.js
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

The quiz battle system changes the way battle action order is processed.

At the beginning of every turn, a question is presented. Depending on the
response to the question, battlers will be able to perform an action.

If the player correctly answers the question, the actors will be able to
perform an action.

If the player incorrectly answers the question, the neemies will be able
to perform an action.

== Terms of Use ==

- Free for use in non-commercial projects with credits
- Free for use in commercial projects, but it would be nice to let me know
- Please provide credits to HimeWorks

== Change Log ==

1.0 - Mar 9, 2016
 - initial release
 
== Required ==

Hime Quiz System

== Usage ==

-------------------------------------------------------------------------------
 */ 
var Imported = Imported || {} ;
var TH = TH || {};
Imported.TH_QuizBattleSystem = 1;
TH.QuizBattleSystem = TH.QuizBattleSystem || {};

function Window_MessageQuiz() {

};

Window_MessageQuiz.prototype = Object.create(Window_Message.prototype);
Window_MessageQuiz.prototype.constructor = Window_MessageQuiz;

(function ($) {

  var TH_BattleManager_initMembers = BattleManager.initMembers;
  BattleManager.initMembers = function() {
    TH_BattleManager_initMembers.call(this);
    this._isQuizShown = false;
  };
  
  var TH_BattleManager_update = BattleManager.update;
  BattleManager.update = function() {
    TH_BattleManager_update.call(this);
    if (!this.isBusy() && !this.updateEvent()) {
      if (this._phase == "quiz") {
        this.updateQuiz();
      }
    }
  }
  
  var TH_BattleManager_startInput = BattleManager.startInput;
  BattleManager.startInput = function() {
    if (!this._isQuizShown) {
      this.startQuiz();
    }
    else {
      TH_BattleManager_startInput.call(this);
    }
  };
  
  BattleManager.startQuiz = function() {
    this._phase = "quiz"
    this._isQuizShown = true;
    QuizManager.setupQuestion();
  };
  
  BattleManager.updateQuiz = function() {
    $gameTroop.updateInterpreter();
    if (!$gameTroop.isEventRunning()) {
      this._phase = "start"
    }
  };
  
  var TH_BattleManager_endTurn = BattleManager.endTurn;
  BattleManager.endTurn = function() { 
    TH_BattleManager_endTurn.call(this);
    QuizManager.nextQuestion();
    this._isQuizShown = false;
  };
  
  Scene_Battle.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    this.startFadeIn(this.fadeSpeed(), false);
    BattleManager.playBattleBgm();
    BattleManager.startBattle();
    this.startPartyCommandSelection();
  };
  
  Scene_Battle.prototype.startPartyCommandSelection = function() {
    this.refreshStatus();
    this._statusWindow.deselect();
    this._statusWindow.open();
    this.selectNextCommand()
  };
  
  Scene_Battle.prototype.updateStatusWindow = function() {
    if ($gameMessage.isBusy()) {
        // this._statusWindow.close();
        this._partyCommandWindow.close();
        this._actorCommandWindow.close();
    } else if (this.isActive() && !this._messageWindow.isClosing()) {
        this._statusWindow.open();
    }
  };
  
})(TH.QuizBattleSystem);