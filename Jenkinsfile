def runTests(extExecHandle, name, browser, os, bucket, buckets) {
  // Clean out the old XML files before running tests, since we junit import *.XML files
  dir('scratch') {
    if (isUnix()) {
      sh "rm -f *.xml"
    } else {
      bat "del *.xml"
    }
  }

  def bedrock_os_param = os ? "--bedrock-os=" + os : "";

  def bedrock = browser == "phantomjs"
                            ? "yarn grunt phantomjs-auto"
                            : "yarn grunt browser-auto " + bedrock_os_param + " --bedrock-browser=" + browser +
                                                                              " --bucket=" + bucket +
                                                                              " --buckets=" + buckets;

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
    [ name: "win10Chrome", os: "windows-10", browser: "chrome", buckets: 2 ],
    [ name: "win10FF", os: "windows-10", browser: "firefox", buckets: 2 ],
    [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge", buckets: 2 ],
    [ name: "win10IE", os: "windows-10", browser: "ie", buckets: 4 ],
    [ name: "macSafari", os: "macos", browser: "safari", buckets: 1 ],
    [ name: "macChrome", os: "macos", browser: "chrome", buckets: 1 ],
    [ name: "macFirefox", os: "macos", browser: "firefox", buckets: 1 ]
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

    def buckets = permutation.buckets
    for (int bucket = 1; bucket <= buckets; bucket++) {
      echo "name: " + permutation.name + " bucket: " + bucket + "/" + buckets
      def suffix = buckets == 1 ? "" : "-" + bucket

      // closure variables - Jenkins is weird about these
      def c_suffix = suffix
      def c_os = permutation.os
      def c_browser = permutation.browser
      def c_bucket = bucket
      def c_buckets = buckets
      def c_name = permutation.name

      processes[c_name + c_suffix] = {
        stage (c_os + " " + c_browser + c_suffix) {
          node("bedrock-" + c_os) {
            echo "name: " + c_name + " bucket: " + c_bucket + "/" + c_buckets
            echo "Node checkout on node $NODE_NAME"
            checkout scm

            // windows tends to not have username or email set
            extExec("git config user.email \"local@build.node\"")
            extExec("git config user.name \"irrelevant\"")

            gitMerge()

            cleanAndInstall()
            extExec "yarn ci"

            echo "Platform: browser tests for " + c_name + " on node: $NODE_NAME"
            runTests(extExecHandle, c_name, c_browser, c_os, c_bucket, c_buckets)
          }
        }
      }
    }
  }

  processes["phantom-and-archive"] = {
    stage ("PhantomJS") {
      // PhantomJS is a browser, but runs on the same node as the pipeline
      // we are re-using the state prepared by `ci-all` below
      // if we ever change these tests to run on a different node, rollup is required in addition to the normal CI command
      echo "Platform: PhantomJS tests on node: $NODE_NAME"
      runTests(extExecHandle, "PhantomJS", "phantomjs", null, 1, 1)
    }

    if (BRANCH_NAME != "master") {
      stage ("Archive Build") {
        extExec("yarn tinymce-grunt prodBuild symlink:js")
        archiveArtifacts artifacts: 'js/**', onlyIfSuccessful: true
      }
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

    // bitbucket plugin requires the result to explicitly be success
    if (currentBuild.resultIsBetterOrEqualTo("SUCCESS")) {
      currentBuild.result = "SUCCESS"
    }
  } catch (err) {
    currentBuild.result = "FAILED"
  }
  notifyBitbucket()
}
