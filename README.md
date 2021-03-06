## JIRA Update Worklog Action

### What does it do?

This action accepts an input via labels in a PR. The input must be of the type `jira-worklog:<jira-accepted-time-format>`. 
For example, 
- `jira-worklog:2h` will update 2 hours to the issue provided
- `jira-worklog:14u` will not work because `14u` is not a valid time tracking string as far as JIRA is concerned.

### Inputs

#### `jira-issue`

**Required** The JIRA issue number in the format XYZ-123. Default `null`

#### `jira-token`

**Required** The JIRA token. To set this token - form the string `<jira-email-address>:<jira-api-token>` and Base64 encode it. For example `abc@xyz.com:7h1s1smyJIRAt0k3n`

#### `jira-domain`

**Required** The JIRA domain. Example: `https://<company>.atlassian.net`

### `prLabel`

**Required** A valid label with the prefix `jira-worklog` 

#### `ghtoken`

**Required** The GitHub token Default `null`

### Outputs
`result` - True if update was successful.

### Example usage
```
uses: rohitnb/jira-update-worklog@master
with:
  jira-issue: 'XYZ-123'
  jira-token: ${{secrets.JIRA_TOKEN}}
  jira-domain: ${{secrets.JIRA_URL}}
  prLabel: 'jira-worklog:2h'
```

### Demo workflow file for Pull Requests
```
name: Log Time in the linked JIRA Issue
on: 
  pull_request:
    types: [labeled]
  

jobs:
  jira-update-worklog:

    runs-on: ubuntu-latest
    if: |
      contains(github.event.label.name, 'jira-worklog')
    steps:
    - name: What is the Label that is kicking off this workflow?
      run: echo "Label Selected ${{github.event.label.name}}"
    
    - name: Jira Login
      uses: atlassian/gajira-login@v2.0.0
      env:
        JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
        JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
        JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
    
    - name: Find JIRA issue number from the PR Title
      id: pr-title-jira-issue
      uses: atlassian/gajira-find-issue-key@master
      with:
        string: ${{ github.event.pull_request.title }}
        from: ""
      
    - if: ${{ steps.pr-title-jira-issue.outputs.issue == ''}}
      name: JIRA Ticket not found
      run: exit 1
    
    - name: Update Work Log
      id: jira-update-worklog
      uses: rohitnb/jira-update-worklog@master
      with:
        jira-issue: ${{steps.pr-title-jira-issue.outputs.issue}}
        jira-token: ${{secrets.JIRA_TOKEN}}
        jira-domain: ${{ secrets.JIRA_BASE_URL }}
        prLabel: ${{github.event.label.name}}
```
