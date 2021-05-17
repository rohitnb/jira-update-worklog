const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');


//INPUTS
const jiraIssue = core.getInput('jira-issue');
const jiraToken = core.getInput('jira-token'); 
const jiraDomain = core.getInput('jira-domain');
const prLabel = core.getInput('prLabel');
const ghtoken = core.getInput('ghtoken');
//END INPUTS

const octokit = github.getOctokit(ghtoken);

async function run(){
    const label_wl = prLabel.split(":")[1];

    function updateWorklog(callback){
        var data = JSON.stringify({"timeSpent":label_wl});
        console.log(data);
        var config = {
            method: 'post',
            url: jiraDomain+'/rest/api/3/issue/'+jiraIssue+'/worklog',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': 'Basic '+jiraToken, 
            },
            data : data
        };
        axios(config)
        .then(function (response) {
            callback(response.data);
        })
        .catch(function (error) {
            console.log(error);
            core.setOutput("result",false);
            core.setFailed("Error updating your worklog");
        });
    }

    updateWorklog(function(result){
        console.log(label_wl+" was added to the worklog for "+jiraIssue);
        console.log("Removing the "+prLabel+" label from this PR now");
        var removedLabel = octokit.rest.issues.removeLabel({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.payload.pull_request.number,
            name: prLabel
          });
        core.setOutput("result",true);
    });
}
run();