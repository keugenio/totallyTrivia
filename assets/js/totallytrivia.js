// JavaScript function that wraps everything
$(document).ready(function() {

      var triviaArray = []; //array holds trivia objects
      var gameStarted = false; // game starts when strike button is hit and pauses when choosing new opponent
      var gameLost = false; // only triggers when player loses
      var newGame = true; // only updates when reset button hit
      var scoreRight = 0;
      var allTimeQuestionsPlayed = 0;
      var allTimeScoreRight = 0;
      var currentTriviaIndex = 0;
      const maxQuestions=10; 
      const maxPossibleAnswers=4;
      const timeBetweenQuestions = 100;
      var currentGame=0; 

// ********** create game ************************//
  createGame();

// ********* on click events ********************//

      // onclick event for answer radio element
      $(".answerField").on("click", function(){
          isGameStarted();
          evaluateGuess(this);
      });

      $("#infoBtn").on("click", function(){
           $("#info").fadeToggle();
      });
      $("#closeBtn").on("click", function(){
           $("#info").fadeToggle();
      });
      $("#resetBtn").on("click", function(){
           resetGame();
      }); 
      $("#triviaWindowCloseBtn").on("click", function(){
           $("#triviaWindow").fadeToggle();
           $("#Game1l").click();
      });
      $('#results li a').click(function(){
          var t = $(this).attr('id');

          if($(this).hasClass('inactive')){ //this is the start of our condition 
            $('#results li a').addClass('inactive');           
            $(this).removeClass('inactive');

            $('.oldGames').hide();
            $('#'+ t + 'C').fadeIn('slow');
         }
      });

      $(document).mouseup(function(e){
          // if the information div is open, toggle it close
          var container = $("#info");
          // if the target of the click isn't the container nor a descendant of the container
          if (!container.is(e.target) && container.has(e.target).length === 0) 
          {
              container.hide();
          }
       });

// ********** functions **************** //
      function createGame(){
      // download questions and possilble answers from API then fill in Question
        $.ajax({
          url: getGameType(),
          method: "GET"
        }).done(function(response) {
          createTrivia(response);
          getQuestion(currentTriviaIndex);
        });
      }
      function getGameType(){
        var htmlCall="https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple";

        return htmlCall;
      }
      // get current trivia array index and update main screen
      function getQuestion(){
        if (currentTriviaIndex < maxQuestions){         
          unMarkCorrectAnswer(); //unmark from any previous question
          $("#triviaWindowScore").html("Score: " + scoreRight); 
          $("#triviaWindowStatus").html(currentTriviaIndex+1 + " out of " + maxQuestions + " questions played.");

          $("#question").html(triviaArray[currentTriviaIndex].question);
          var triviaAnswers = triviaArray[currentTriviaIndex].getTriviaAnswers()
          for (var i = 0; i < triviaAnswers.length; i++) {
            $("#" + i).html(triviaAnswers[i]);
            $("#" + i).attr("value", i);
          }
        }
        else {
          $("#triviaWindowScore").html("Score: " + scoreRight);           
          setTimeout(gameOver, timeBetweenQuestions);
        }
      }

       function createTrivia(obj){
        // for all objects returned by ajax, create trivia object and push into global trivia array for future use
        for (var i = 0; i < obj.results.length; i++) {
          var trivia = {
            question: obj.results[i].question,
            correct_answer: obj.results[i].correct_answer,
            incorrect_answers : obj.results[i].incorrect_answers,
            correctIndex : Math.round(Math.random()*3),
            player_result:"",

            getTriviaAnswers : function(){
              var i=0;
              var triviaAnswers = [];
              for (var j = 0; j <= this.incorrect_answers.length; j++) {
                if (j === this.correctIndex)
                  triviaAnswers.push(this.correct_answer);
                else {
                  triviaAnswers.push(this.incorrect_answers[i++])
                }
              };
              return triviaAnswers; 
            }, //getTriviaAnswers() //
          } // trivia object //
          triviaArray.push(trivia);
        } // for //
       }

      function evaluateGuess(guess){
      // evaulate guess compared to correct answer then update stats and status
        var playerAnswer = $(guess).attr("value");
        allTimeQuestionsPlayed++;
        var correctAnswerIndex = triviaArray[currentTriviaIndex].correctIndex;
        if (playerAnswer == correctAnswerIndex){
          scoreRight++;
          allTimeScoreRight++
          triviaArray[currentTriviaIndex].player_result = "correct";
        }
        else
          triviaArray[currentTriviaIndex].player_result = "incorrect";          

        markCorrectAnswer();
        updateMainStatsWindow();
        currentTriviaIndex++;
        setTimeout(getQuestion, timeBetweenQuestions);
      }
      function markCorrectAnswer(){
        for (var i = 0; i < maxPossibleAnswers; i++) {
          if (i != triviaArray[currentTriviaIndex].correctIndex)
            $("#"+i).css("opacity", .2);
        }
      }
      function unMarkCorrectAnswer(){
        for (var i = 0; i < maxPossibleAnswers; i++) {
            $("#"+i).css("opacity", 1);
        }
      }              
      function gameOver(){
        // update final score, disable answer fields and show reset button       
        $("#question").html("Game Over. All Questions Answered");
        for (var i = 0; i < maxPossibleAnswers; i++) {
            $("#"+i).css("display", "none");;
        }
        $("#triviaWindowCloseBtn").css("display", "block");  
      }
      function updateAnswerElement(){
      // get current trivia object, update the Question and possible Answers
      }
      function updateStats(){
        $("#scoreRight").html("Correct:" + scoreRight);
        $("#scoreWrong").html("Incorrect:" + maxQuestions -scoreRight);
        $("#winPercent").html("Winning Percentage:" + Math.round(scoreRight/maxQuestions)); 
      }
      function resetGame(){
        // remove objects from trivia Array, reset htmlCall, reset scoreRight, create new game
        for (var i = 0; i < triviaArray.length; i++) {
          triviaArray.splice(i,1);
        }
        scoreRight=0;
        htmlCall = getGameType();
        createGame(htmlCall);
      }
      function updateMainStatsWindow(){
        var playerResultImage;
        var results;
        var wrong = allTimeQuestionsPlayed - allTimeScoreRight;
        var percentage = Math.round(allTimeScoreRight/allTimeQuestionsPlayed*100);

        if (triviaArray[currentTriviaIndex].player_result == "correct")
          playerResultImage = "<img src='assets/images/totallytrivia/correct.png' class='d-inline resultsIcon'/>"
        else
          playerResultImage = "<img src='assets/images/totallytrivia/wrong.png' class='d-inline resultsIcon'/>"

        results = "<p>" + (currentTriviaIndex+1) + ": " +
                   "<i>" + triviaArray[currentTriviaIndex].question + "</i> " + 
                   "<strong>" + triviaArray[currentTriviaIndex].correct_answer + "</strong> " +
                   playerResultImage + "</p>";             

        var gameTitle = "#Game" + currentGame + "C";
        $(gameTitle).append(results);
        $("#allTimeScoreRight").text("Correct:" + allTimeScoreRight);
        $("#allTimeWrong").text("Incorrect:"+ wrong); 
        $("#winPercent").text("Win Percentage:"+  percentage + "%");                
      }
      function isGameStarted(){
        // if new game hasn't started yet, create a new tab for questions and answers on the main page
        // create a new menu link and new tab content div to hold those Q&A then start game
        if (!gameStarted){
          gameStarted = true;

          currentGame ++;
          var gameTitle = "Game" + currentGame;
          var aID = gameTitle + "c";

          var newA = $(document.createElement('a'));

          newA.attr("data-toggle", "tab");
          newA.attr("href",  "#"+ gameTitle +"C");
          newA.text(gameTitle);
          newA.attr("id", aID);
          newA.attr("class", "nav-link active");
          newA.attr("aria-expanded", "true");

          var newLi = $("<li class='nav-item'>");          
          newLi.attr("aria-expanded", "false");

          newLi.appendTo("#resultTabs").append(newA);

          var newDiv = $("<div id='" + gameTitle + "C' class='tab-pane fade in active show'>");
          newDiv.attr("aria-expanded", "true");          
          $("#resultContent").append(newDiv);

        }
      }
});