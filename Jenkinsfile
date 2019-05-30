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
  pipelineTriggers([
    pollSCM("")
  ])
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

  // PhantomJS tests
  processes["phantomjs"] = {
    stage ("PhantomJS") {
      // we are re-using the state prepared by `ci-all` below
      echo "Platform: PhantomJS tests on node: $NODE_NAME"
      runTests(extExecHandle, "PhantomJS", "phantomjs")
    }
  }

  // Install tools
  stage ("Install tools") {
    cleanAndInstall()
  }

  stage ("Type check") {
    // TODO switch ci-all to using whole-repo tslint once all modules pass tslint checks
    extExec "yarn ci-all"
  }

  grunt "list-changed-phantom list-changed-browser"

  stage ("Run Tests") {
    // Run all the tests in parallel
    parallel processes
  }
}
