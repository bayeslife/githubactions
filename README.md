# Hello World GitHub Actions CI CD 

This is a repository to investigate and demonstrate using github actions.

Goal of this repository:
- code is pushed to GitHub
- the code is built and tested
- an artefact is built and released as a Git Hub release

## References

- [Git Hub Actions](https://docs.github.com/en/actions)
- [Git Hub Workflow](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Git Hub Expression](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions)

## Learnings

- Every yaml file in the .github/workflows is a separate workflow.  There can be many workflows that trigger on differnt conditions.

- Use the environment variable GITHUB_RUN_NUMBER to get a build number. There are a number of [default environment variables available](https://docs.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables).

- Setting variables that are visible through the workflow was not obvious.  Using *env* section at the job level variables were available to all steps 
```
    env: 
      PKG_NAME: real-value-app-0.1.0.${{ github.run_number }}.tgz
```
- Accessing variables occurs via expressions which either were
 ```
       run: echo $GITHUB_RUN_NUMBER $PKG_NAME
or
        run: tar czf ${{env.PKG_NAME}} src node_modules package.json lib public
```
- Had issues where I created a release but wasnt able to push any further changes to repo


