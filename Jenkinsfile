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
  pipelineTriggers([])
])

node("primary") {
  stage ("Checkout SCM") {
    checkout scm
    sh "mkdir -p jenkins-plumbing"
    dir ("jenkins-plumbing") {
      git([branch: "master", url:"ssh://git@stash:7999/van/jenkins-plumbing.git", credentialsId: "8aa93893-84cc-45fc-a029-a42f21197bb3"])
    }
  }

  def extExec = load("jenkins-plumbing/exec.groovy")
  def extExecHandle = load("jenkins-plumbing/execHandle.groovy")
  def extYarnInstall = load("jenkins-plumbing/npm-install.groovy")
  def grunt = load("jenkins-plumbing/grunt.groovy")

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
    // Install tools
    stage ("Install tools") {
      cleanAndInstall()
    }

    stage ("Type check") {
      // TODO switch ci-all to using whole-repo tslint once all modules pass tslint checks
      extExec "yarn ci-all"
    }


    stage ("Run Tests") {
      grunt "list-changed-phantom list-changed-browser"
      // Run all the tests in parallel
      parallel processes
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
