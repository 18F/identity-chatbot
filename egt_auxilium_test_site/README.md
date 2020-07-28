# About

This is an Auxilium implementation for GSA Login.gov

# How to build the react script

1. Save the landing page/background to `/public`
2. Clean up the build directory before creating a new build by executing `npm run clean`
3. Then compile existing code in `/src` by executing `npm run-script build` The generated javascript and css files are then included in the public/index.html file and added to the build directory.
4. Manually modify the static index.html file **<--IMPORTANT**

_After each build, you'll need to update the script manually to accommodate react script for static site. This is something you will need to update manually every time you build_

The links to the javascript and css in the index.html will be prefixed by a /. You must delete this character for the resources to load properly. Simply search for `/static/` and remove the first slash. For example,

> `<link href="/static/css/main.d0affe60.css" rel="stylesheet">`

needs to be

> `<link href="static/css/main.d0affe60.css" rel="stylesheet">`

# How to deploy

Copy the contents of the build directory into the S3 bucket being used. Make sure the S3 bucket is configured to host/serve a website. The current code is deployed in EGT's AWS environment under the account `571044959531`. The name for the s3 bucket is `gsa-login-auxilium-testing` You can see the site at <https://gsa-login-auxilium-testing.s3.amazonaws.com/index.html>

1. Move the files in `\build` folder to s3

# How to connect to a different bot

Edit the parameters sent to LexChat from App.js to modify bot configuration

- `botName` <- The bots name
- `botAlias` <- The lex bot alias
- `placeholder` <- This is what the chatbot window displays as a prompt to the user
- `headerText` <- The title in the chatbot window
- `IdentityPoolId` <- The cognito pool ID

# How to change the initial message of the bot

1. go to `\src\LexChat.js`
2. update `initialPrompt()`
