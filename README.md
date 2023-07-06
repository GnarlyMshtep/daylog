# daylog 📝📊

`daylog` is a simple command line utility enabling semi-pretty customizable logging of basic statistics about your life. When ran, the script presents a customizable statistical summary of data collected from previous days, prompts the user to collect data for the current/past day, saves the new data to a `json` "db" file, and commits the changes to a (private) GitHub repository. 



### How to use out of the box?
1. Install [Node.js](https://nodejs.org/en) and check that node properly installed by running `node --version` in the command line. 
2. Fork the [repository](https://github.com/GnarlyMshtep/daylog) and make your copy private. 
3. Clone the repository.
4. Open the repository locally run `npm install` 
5. (Reccomended:) If you are not on windows (does this exist on LINUX), appand  `~/.zshrc` `alias daylog='node ~/Dev/daylog_script/main.js'`
6. run `daylog` in terminal to log daily (or run `node main.js` in the cloned repository)


### How to customize

To modify the questions you are prompted, change `questions.js`. The script is still using the old version of [`inquirer.js`](https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer). See [possible question prompt styles here](https://github.com/SBoudrias/Inquirer.js/tree/master/packages/inquirer#questions). Probably the easiest way to add change questions is follow the current pattern.


To modify the statistics printed when first prompted, add a new function to `stats.js` and `export` it. The function should take `db`, the `js` parsing `defeault_db.json` and return `["what f returns", f(db)]`. 


### Why should I use this? 
Personally, I found that logging (every morning) kept me 
* Accountable: I am very effected by being even slightly tired and I struggle with going to bed on time. Logging my bedtime every day, and assigning a score to it made me go to bed much earlier. 
* Appreciative: Logging every morning forced me to reflect on the prior day. When I do reflect, and in particular have to assign a rating to my day, I realize all the fantastic things I am fortunate for and feel tremendously better.   

For further discussion on this see *this blogpost I have yet to write*