//-----uncond. imports----
import { createRequire } from "module"; // to reuire in a module
const require = createRequire(import.meta.url); // to reuire in a module
const inquirer = require("inquirer"); //needed for command line prompts
const os = require("os"); //needed to determine OS endline (to seperate as list)
const fs = require("fs"); //needed to write back JSON file
import * as statsFuncs from "./stats.js";
import { log } from "console";
const path = require("path");
const simpleGit = require("simple-git");

// config
const DB_NAME = "default_db.json";
const currentDir = path.dirname(new URL(import.meta.url).pathname);
process.chdir(currentDir);

//constants
const horizSep = "--------------------------------------";
const boldString = "\x1b[36m%s\x1b[0m";

//resource imports
let db = require(`./${DB_NAME}`); //read the db

/**
 * loops through DB and prints of various stats and metrics
 */
const printInitialStatCheck = () => {
  if (!db.hasOwnProperty("data") || db.data.length === 0) {
    console.log(
      "\nNo data has been logged yet, so there are no statistics to print\n"
    );
    console.log(horizSep);
    return;
  } else {
    //there is data to statistics through

    //-------print intro-----------
    //console.log(horizSep);
    //console.log("printing statistics:\n");

    let statsOut = {};
    const functionNames = Object.keys(statsFuncs);
    // Loop through the array and call each function
    functionNames.forEach((functionName) => {
      const temp = statsFuncs[functionName](db);
    //  console.log(temp, functionName, statsOut);
      Object.defineProperty(statsOut, temp[0], {
        value: temp[1].toString(),
        writable: true,
        enumerable: true,
      });
    });

    const style = `
        font-size: 16px;
        font-family: Arial, sans-serif;
        border-collapse: collapse;
        margin-top: 1000px;
        width: 100%;
        text-align: center;
        `;
    console.log("%cStatistics", style);
    //console.table(statsOut);
    console.table(statsOut);
  }
};

/**
 * push to git using simple exec logic. uncomment the console.logs for debugging
 * @param {*} dateObjToLog
 */
const pushToGitHub = (dateObjToLog) => {
  console.log("Commiting to git and pushing to GitHub.\n");

  const git = simpleGit();

  // Add all changes to the staging area
  git
    .add(`${DB_NAME}`)

    // Commit with today's date as the commit message
    .commit(
      `>>>=DB UPDATE<<< update at: ${dateObjToLog.dateWhenLogged} logged for: ${dateObjToLog.dayLoggedFor} >>>DB UPDATE<<<`
    )

    // Push to the default remote repository (origin)
    .push();
};

/**
 * Checks for most recent logs in the DB and makes sure there are no overlaps. In general makes, sure we log for increasing dates. Exits if the user found that he already logged for today/yeasterday/tommorow/etc. exist the process with status 0 if user chooses not to log, else returns dtaeObjToLog which has the time of rn & the date we log for.
 *
 * @returns if logging: dateObjToLog, else: exits process
 */
const determineDate = async () => {
  const currentDate = new Date();
  //add bleedover
  const dWithBleedOver = new Date(
    db.bleedover ? currentDate.getTime() + db.bleedover : currentDate.getTime()
  );
  //console.log(dWithBleedOver.getTime());
  const todayDateStr = dWithBleedOver.toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric", //to display the full name of the month
    year: "numeric",
  });

  let dateObjToLog = {
    dateWhenLogged: currentDate.getTime(),
    dayLoggedFor: todayDateStr,
  };
  if (db.hasOwnProperty("data") && db.data.length > 0) {
    //do all these checks only if there are things already logged

    const lastEntryDateObj = db.data[db.data.length - 1].date;
    const dateObjLoggedForLastEntry = new Date(lastEntryDateObj.dayLoggedFor);

    //deal with the case where we have already inputted for the day
    //the follwoing comparison gets the 1970Date of the last entry we logged for (say 12/31/2021), towords the end of the day (hence the addition of ms), and dWithBleedOver.getTime() is the date that one would think we are logging
    if (
      dateObjLoggedForLastEntry.getTime() + 115730000 >=
      dWithBleedOver.getTime()
    ) {
      const nextNotLoggedForDateObj = new Date(
        dateObjLoggedForLastEntry.getTime() + 86400005
      );
      const nextNotLoggedForDateString =
        nextNotLoggedForDateObj.toLocaleDateString("en-US", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        });

      const answers1 = await inquirer.prompt([
        {
          type: "confirm",
          name: "logForTomm",
          message: `You have already logged for ${lastEntryDateObj.dayLoggedFor} and are trying to log for ${todayDateStr}. Would you like to log for the next uniputted date, ${nextNotLoggedForDateString}?`,
        },
      ]);
      if (!answers1.logForTomm) {
        console.log("Sound good! Please return when you are ready to log!");
        process.exit(0);
      }
      dateObjToLog.dayLoggedFor = nextNotLoggedForDateString;
      console.log(
        `Okay! logging for ${nextNotLoggedForDateString}\n${horizSep}\n`
      );
    } else {
      console.log(
        `Okay! logging for ${dateObjToLog.dayLoggedFor}\n${horizSep}\n`
      );
    }
  }
  return dateObjToLog;
};
const askQuestionsParseAndWriteDB = async (dateObjToLog) => {
  const questions = require("./questions.json");

  // ----------- check which set of questions we are asking
  const whichLogLevelAnswerObj = await inquirer.prompt(
    questions["loggingLevel"]
  );

  //-----------ask the saved questions---------------------

  const answers2 = await inquirer.prompt(
    questions[whichLogLevelAnswerObj.loggingLevel]
  ); //get answers for questions
  answers2["loggingLevel?"] = whichLogLevelAnswerObj.loggingLevel;
  //--------parse answers to convinent form---------------

  const osSpecificNewline = os.platform() === "win32" ? "\r\n" : "\n"; // to take parse to list

  // loop through every question asked, see if it has any special parsing needs
  for (let i = 0; i < questions.length; i++) {
    //! currently no parsing is needed
  }
  //-------- ask to approve -----------------

  while (true) {
    let choices = [];
    for (
      let i = 0;
      i < questions[whichLogLevelAnswerObj.loggingLevel].length;
      i++
    ) {
      choices.push({
        key: i>= 7? String.fromCharCode(97 + i +1) :String.fromCharCode(97 + i ) ,
        value: {i: i, value: questions[whichLogLevelAnswerObj.loggingLevel][i].name },
        name: `${questions[whichLogLevelAnswerObj.loggingLevel][i].name}: ${
          answers2[questions[whichLogLevelAnswerObj.loggingLevel][i].name]
        }`,
        message: "Everything seem okay?",
      });
    }
    choices.push({
      key: "v",
      value: "isGood",
      name: "everything looks good! Valid log!",
    });

    const validateRes = await inquirer.prompt([
      {
        type: "expand",
        message: "Does everything seem okay?",
        name: "validate",
        pageSize: 100,

        choices: choices,
      },
    ]);

    //console.log("validateRes", validateRes);
    if (validateRes.validate == "isGood") {
      break;
    } else {
       // console.log(questions[whichLogLevelAnswerObj.loggingLevel], validateRes.validate, answers2);
//     console.log(questions[whichLogLevelAnswerObj.loggingLevel][validateRes.value]); 
        const x= await inquirer.prompt(
        questions[whichLogLevelAnswerObj.loggingLevel][validateRes.validate.i])
      answers2[validateRes.validate.value] = x[validateRes.validate.value]
    }
  }

  //-------- add and write to db --------------

  answers2.date = dateObjToLog;
  if (!db.hasOwnProperty("data")) {
    db.data = [];
  }

  db.data.push(answers2);

  try {
    await fs.promises.writeFile(`./${DB_NAME}`, JSON.stringify(db));
  } catch (err) {
    console.error(`Error occured while writing ${DB_NAME}!`, err);
  }
  console.log(`Saved to DB!\n${db.byeSentence}`);
};

const main = async () => {
  console.log(
    "\nWelcome to the dayLogScrpt! Reflect effectively and privately collect data about your life!"
  );

  printInitialStatCheck();

  const dateObjToLog = await determineDate(); //will exit if we are not logging
  //----getTime we have set up date and the user kgetTimes what they are logging for, we can get qs and ask ----
  await askQuestionsParseAndWriteDB(dateObjToLog);
  //------------push the db chnages to github -------------------

  pushToGitHub(dateObjToLog);
};

main();
