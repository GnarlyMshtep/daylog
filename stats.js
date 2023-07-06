/* this file will export functions to which we will pass the entire (nonempty) DB object. 
The functions should return a ( nameOfStat, valOfStat ).
For example, avg_slept() may return (' average hours slept per night' ,8.5 ) 
functions should be in order of display*/

export const total_num_days = (db) => {
  return [
    "total num days recorded since",
    [db.data.length, db.data[0].date.dayLoggedFor],
  ];
};

export const avg_slept = (db) => {
  let sum = 0;
  let num_days = 0;
  for (let i = 0; i < db.data.length; i++) {
    if (Object.hasOwn(db.data[i], "hrsSleep")) {
      sum += db.data[i].hrsSleep;
      num_days++;
    }
  }
  return ["average # of hrs slept", sum / num_days];
};

export const sleep_pts = (db) => {
    let sleepPtsObj ={
        sleepFreebies:0,
        sleepPts :0
    }
  for (let i = 0; i < db.data.length; i++) {
    if (db.data[i].hasOwnProperty("whenSleep") && db.data[i].whenSleep != NaN) {
      sleepPtsObj.notNulls++;
      let x = db.data[i].whenSleep;

      switch (true) {
        case x == -99:
          sleepPtsObj.sleepFreebies++;
          break;
        case x <= 9:
          sleepPtsObj.sleepPts += 2;
          break;
        case x <= 9.5:
          sleepPtsObj.sleepPts += 1;
          break;
        case x <= 10:
          sleepPtsObj.sleepPts -= 2;
          break;
        case x > 10:
          sleepPtsObj.sleepPts -= 3;
          break;
        default:
            return ['sleep_pts', `detected weird whenSleep value ${x} for ${db.data[i].date.dayLoggedFor}`]
        }
    }
  }
  return ['sleep_pts', sleepPtsObj.sleepPts]
};

//export default {total_num_days, avg_slept}