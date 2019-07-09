def runTests(extExecHandle, name, browser, os=null) {
  // Clean out the old XML files before running tests, since we junit import *.XML files
  dir('scratch') {
    if (isUnix()) {
      sh "rm -f *.xml"
    } else {
      bat "del *.xml"
    }
  }

  def bedrock_os_param = os ? "--bedrock-os=" + os : "";

  def bedrock = browser == "phantomjs" ? "yarn grunt phantomjs-auto" : "yarn grunt browser-auto " + bedrock_os_param + " --bedrock-browser=" + browser;

  def successfulTests = extExecHandle(bedrock)

  echo "Writing JUnit results for " + name + " on node: $NODE_NAME"
  junit allowEmptyResults: true, testResults: 'scratch/TEST-*.xml'

  if (!successfulTests) {
    echo "Tests failed for " + name + " so passing failure as exit code for node: $NODE_NAME"
    sh "exit 1"
  }
}

properties([
  disableConcurrentBuilds(),
  pipelineTriggers([]),
  buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '1', daysToKeepStr: '', numToKeepStr: ''))
])

node("primary") {
  def extExec, extExecHandle, extYarnInstall, grunt

  def gitMerge = {
    if (BRANCH_NAME != "master") {
      echo "Merging master into this branch to run tests"
      extExec("git merge --no-commit --no-ff origin/master")
    }
  }

  stage ("Checkout SCM") {
    checkout scm
    fileLoader.withGit("ssh://git@stash:7999/van/jenkins-plumbing.git", "master", "8aa93893-84cc-45fc-a029-a42f21197bb3", '') {
      extExec = fileLoader.load("exec")
      extExecHandle = fileLoader.load("execHandle")
      extYarnInstall = fileLoader.load("npm-install")
      grunt = fileLoader.load("grunt")
    }
    // cancel build if master doesn't merge cleanly, otherwise tests wil fail
    gitMerge()
  }

  def browserPermutations = [
    [ name: "win10Chrome", os: "windows-10", browser: "chrome" ],
    [ name: "win10FF", os: "windows-10", browser: "firefox" ],
    [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge" ],
    [ name: "win10IE", os: "windows-10", browser: "ie" ],
    [ name: "macSafari", os: "macos", browser: "safari" ],
    [ name: "macChrome", os: "macos", browser: "chrome" ],
    [ name: "macFirefox", os: "macos", browser: "firefox" ]
  ]

  def cleanAndInstall = {
    echo "Installing tools"
    extExec "git clean -fdx modules"
    extYarnInstall()
  }

  def processes = [:]

  // Browser tests
  for (int i = 0; i < browserPermutations.size(); i++) {
    def permutation = browserPermutations.get(i)
    def processName = permutation.name
    processes[processName] = {
      stage (permutation.os + " " + permutation.browser) {
        node("bedrock-" + permutation.os) {
          echo "Slave checkout on node $NODE_NAME"
          checkout scm

          // windows tends to not have username or email set
          extExec("git config user.email \"local@build.node\"")
          extExec("git config user.name \"irrelevant\"")

          gitMerge()

          cleanAndInstall()
          extExec "yarn ci"

          echo "Platform: browser tests for " + permutation.name + " on node: $NODE_NAME"
          runTests(extExecHandle, permutation.name, permutation.browser, permutation.os)
        }
      }
    }
  }

  // PhantomJS is a browser, but runs on the same node as the pipeline
  processes["phantomjs"] = {
    stage ("PhantomJS") {
      // we are re-using the state prepared by `ci-all` below
      // if we ever change these tests to run on a different node, rollup is required in addition to the normal CI command
      echo "Platform: PhantomJS tests on node: $NODE_NAME"
      runTests(extExecHandle, "PhantomJS", "phantomjs")
    }
  }

  // No actual code runs between SCM checkout and here, just function definition
  notifyBitbucket()
  try {
    // our linux nodes have multiple executors, sometimes yarn creates conflicts
    lock("Don't run yarn simultaneously") {
      stage ("Install tools") {
        cleanAndInstall()
      }
    }

    stage ("Type check") {
      extExec "yarn ci-all"
    }

    stage ("Run Tests") {
      grunt "list-changed-phantom list-changed-browser"
      // Run all the tests in parallel
      parallel processes
    }

    if (BRANCH_NAME != "master") {
      stage ("Archive Build") {
        extExec("yarn tinymce-grunt prod")
        archiveArtifacts artifacts: 'js/**, dist/**', onlyIfSuccessful: true
      }
    }

    // bitbucket plugin requires the result to explicitly be success
    if (currentBuild.resultIsBetterOrEqualTo("SUCCESS")) {
      currentBuild.result = "SUCCESS"
    }
  } catch (err) {
    currentBuild.result = "FAILED"
  }
  notifyBitbucket()
}
